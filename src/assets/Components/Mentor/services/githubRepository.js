const GITHUB_API = "https://api.github.com";

function getRepositoryPath(repositoryUrl) {
    try {
        const url = new URL(repositoryUrl);
        if (url.hostname !== "github.com") return null;

        const [owner, repository] = url.pathname.split("/").filter(Boolean);
        if (!owner || !repository) return null;

        return `${encodeURIComponent(owner)}/${encodeURIComponent(repository.replace(/\.git$/i, ""))}`;
    } catch {
        return null;
    }
}

async function fetchGitHubJson(path, signal) {
    const response = await fetch(`${GITHUB_API}${path}`, {
        headers: { Accept: "application/vnd.github+json" },
        signal,
    });

    if (!response.ok) {
        throw new Error(`GitHub returned ${response.status} for ${path}. Check the repository URL and API rate limit.`);
    }

    return response.json();
}

async function fetchOptionalMetric(path, signal, getValue) {
    try {
        const data = await fetchGitHubJson(path, signal);
        return { value: getValue(data), error: "" };
    } catch (error) {
        if (error.name === "AbortError") throw error;
        return { value: null, error: error.message };
    }
}

export async function fetchRepositoryEvidence(repositoryUrl, signal) {
    const repositoryPath = getRepositoryPath(repositoryUrl);
    if (!repositoryPath) {
        throw new Error("Enter a valid GitHub repository URL.");
    }

    const [repository, contributors, commits, pullRequests, ciRuns] = await Promise.all([
        fetchGitHubJson(`/repos/${repositoryPath}`, signal),
        fetchGitHubJson(`/repos/${repositoryPath}/contributors?anon=1&per_page=100`, signal),
        fetchGitHubJson(`/repos/${repositoryPath}/commits?per_page=5`, signal),
        fetchOptionalMetric(
            `/search/issues?q=${encodeURIComponent(`repo:${repositoryPath} is:pr`)}`,
            signal,
            (data) => {
                if (!Number.isFinite(data.total_count)) throw new Error("GitHub returned an invalid pull request count.");
                return data.total_count;
            },
        ),
        fetchOptionalMetric(
            `/repos/${repositoryPath}/actions/runs?per_page=100`,
            signal,
            (data) => {
                if (!Array.isArray(data.workflow_runs)) throw new Error("GitHub returned an invalid workflow run list.");
                return data.workflow_runs;
            },
        ),
    ]);

    if (!Array.isArray(contributors) || !Array.isArray(commits)) {
        throw new Error("GitHub returned an unexpected repository response.");
    }

    const completedRuns = (ciRuns.value ?? []).filter((run) => run.status === "completed" && run.conclusion);
    const successfulRuns = completedRuns.filter((run) => run.conclusion === "success").length;

    return {
        repository,
        contributors,
        commits,
        pullRequests,
        ci: {
            rate: completedRuns.length ? Math.round((successfulRuns / completedRuns.length) * 100) : null,
            completedRuns: completedRuns.length,
            error: ciRuns.error,
        },
    };
}
