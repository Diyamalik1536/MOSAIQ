import { useEffect, useState } from "react";
import { fetchRepositoryEvidence } from "../services/githubRepository";
const contributorColors = ["lavender", "mint", "peach", "blue", "rose"];
const tabs = ["Repository", "Recent commits", "Contributors"];

function getInitials(name) {
    return name.split(/[\s-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function formatDate(date) {
    return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(date));
}

function EvidenceBrief({ project }) {
    const [activeTab, setActiveTab] = useState(tabs[0]);
    const [result, setResult] = useState({ repositoryUrl: "", status: "loading", data: null, error: "" });

    useEffect(() => {
        const controller = new AbortController();

        if (!project.repositoryUrl) {
            return () => controller.abort();
        }

        fetchRepositoryEvidence(project.repositoryUrl, controller.signal)
            .then((data) => setResult({ repositoryUrl: project.repositoryUrl, status: "loaded", data, error: "" }))
            .catch((error) => {
                if (error.name !== "AbortError") {
                    setResult({ repositoryUrl: project.repositoryUrl, status: "error", data: null, error: error.message });
                }
            });

        return () => controller.abort();
    }, [project.repositoryUrl]);

    const isCurrentRepository = result.repositoryUrl === project.repositoryUrl;
    const status = !project.repositoryUrl ? "unlinked" : isCurrentRepository ? result.status : "loading";
    const data = status === "loaded" ? result.data : null;
    const error = isCurrentRepository ? result.error : "";
    const contributors = (data?.contributors ?? [])
        .filter((contributor) => Number.isFinite(contributor.contributions) && contributor.contributions > 0)
        .map((contributor, index) => ({
            name: contributor.login || contributor.name || "Anonymous contributor",
            login: contributor.login,
            commits: contributor.contributions,
            color: contributorColors[index % contributorColors.length],
        }))
        .sort((first, second) => second.commits - first.commits);
    const totalContributions = contributors.reduce((total, contributor) => total + contributor.commits, 0);
    const contributorRows = contributors.map((contributor) => ({
        ...contributor,
        initials: getInitials(contributor.name),
        impact: Math.round((contributor.commits / totalContributions) * 100),
    }));

    return (
        <section className="surface-card evidence-brief" aria-label="Project evidence brief">
            <div className="evidence-heading">
                <div className="evidence-title"><span className="evidence-title__icon">⌘</span><div><h2>GitHub repository</h2><p>Live repository details, commits, and contributors</p></div></div>
                <span className={`repository-status${status === "error" ? " repository-status--error" : ""}`}><i></i> {status === "loaded" ? "Connected" : status === "loading" ? "Loading…" : status === "error" ? "Unavailable" : "Not linked"}</span>
            </div>

            {status === "loaded" && (
                <>
                    <div className="evidence-metrics">
                        <div><span>Commits</span><strong>{totalContributions}</strong></div>
                        <div title={data.pullRequests.error}><span>Pull requests</span><strong>{data.pullRequests.value ?? "Unavailable"}</strong></div>
                        <div title={data.ci.error || "Successful workflow runs divided by completed workflow runs."}><span>CI test pass rate</span><strong>{data.ci.error ? "Unavailable" : data.ci.rate === null ? "No runs" : `${data.ci.rate}%`}</strong></div>
                        <div title="GitHub does not provide code similarity checks."><span>Similarity check</span><strong>Unavailable</strong></div>
                    </div>
                    {(data.pullRequests.error || data.ci.error) && <p className="repository-metric-note" role="status">{[data.pullRequests.error && `Pull requests: ${data.pullRequests.error}`, data.ci.error && `CI: ${data.ci.error}`].filter(Boolean).join(" ")}</p>}
                    <div className="evidence-tabs" role="tablist" aria-label="GitHub repository details">
                        {tabs.map((tab) => <button key={tab} role="tab" aria-selected={activeTab === tab} className={`evidence-tab${activeTab === tab ? " evidence-tab--active" : ""}`} onClick={() => setActiveTab(tab)}>{tab}</button>)}
                    </div>
                    <div className="evidence-content">
                        {activeTab === "Repository" && (
                            <div className="repository-details">
                                <div className="evidence-subheading">
                                    <div><strong>{data.repository.full_name}</strong><span>{data.repository.description || "No repository description provided."}</span></div>
                                    <a className="text-button" href={data.repository.html_url} target="_blank" rel="noreferrer">Open on GitHub ↗</a>
                                </div>
                                <dl className="repository-facts">
                                    <div><dt>Primary language</dt><dd>{data.repository.language || "Not specified"}</dd></div>
                                    <div><dt>Default branch</dt><dd>{data.repository.default_branch}</dd></div>
                                    <div><dt>Open issues</dt><dd>{data.repository.open_issues_count}</dd></div>
                                    <div><dt>Last updated</dt><dd>{formatDate(data.repository.updated_at)}</dd></div>
                                    <div><dt>Created</dt><dd>{formatDate(data.repository.created_at)}</dd></div>
                                </dl>
                                <p className="evidence-disclaimer">Repository fields and counts are provided by GitHub. Contributor commit totals include contributors returned by GitHub’s public API.</p>
                            </div>
                        )}
                        {activeTab === "Recent commits" && (
                            <div className="repository-list">
                                {data.commits.length ? data.commits.map((commit) => (
                                    <article className="repository-list__item" key={commit.sha}>
                                        <div><a href={commit.html_url} target="_blank" rel="noreferrer"><strong>{commit.commit.message.split("\n")[0]}</strong></a><span>{commit.commit.author?.name || commit.author?.login || "Unknown author"} · {formatDate(commit.commit.author?.date || commit.commit.committer?.date)}</span></div>
                                        <code>{commit.sha.slice(0, 7)}</code>
                                    </article>
                                )) : <p className="repository-empty">No commits were returned for this repository.</p>}
                            </div>
                        )}
                        {activeTab === "Contributors" && (
                            <div className="collaboration-panel">
                                <div className="evidence-subheading"><div><strong>Contributor commit share</strong><span>Percentages are based on GitHub’s returned contribution counts.</span></div></div>
                                {contributorRows.length ? <div className="contribution-chart">
                                    {contributorRows.map((contributor) => (
                                        <div className="contribution-row" key={contributor.login || contributor.name}>
                                            <span className={`student-avatar student-avatar--${contributor.color}`}>{contributor.initials}</span>
                                            <strong>{contributor.login ? <a href={`https://github.com/${encodeURIComponent(contributor.login)}`} target="_blank" rel="noreferrer">{contributor.name}</a> : contributor.name}</strong>
                                            <div className="contribution-track"><span style={{ width: `${contributor.impact}%` }}></span></div>
                                            <span className="contribution-count">{contributor.commits} commits</span>
                                            <span className="contribution-impact">{contributor.impact}%</span>
                                        </div>
                                    ))}
                                </div> : <p className="repository-empty">GitHub did not return contributor data for this repository.</p>}
                                <p className="health-note">Commit share is a Git activity signal, not a measure of total project contribution.</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {status === "loading" && <p className="repository-state" role="status">Fetching repository details from GitHub…</p>}
            {status === "unlinked" && <p className="repository-state">Add a GitHub repository URL to this project to load its details.</p>}
            {status === "error" && <p className="repository-state repository-state--error" role="alert">{error}</p>}
        </section>
    );
}

export default EvidenceBrief;
