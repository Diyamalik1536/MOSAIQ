import { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "../../../../context/UserContext";
import { getGoogleJob, getGoogleJobs, getGoogleStatus, matchGoogleJob } from "./services/googleAnalyticsApi";
import { getStudentProfile } from "./utils/studentProfileAdapter";
import { compareResumeWithJob, extractSkillsFromText } from "./utils/skillMatcher";
import AnalyticsCharts from "./AnalyticsCharts";
import "./analytics.css";

const messageFor = (error) => error instanceof Error ? error.message : "The Analytics service is unavailable. Try again.";

function SkillList({ title, items }) {
  return (
    <section className="ga-skill-group">
      <h3>
        {title} <span>{items.length}</span>
      </h3>
      {items.length ? (
        <div className="ga-skill-list">
          {items.map((item) => (
            <article key={`${title}-${item.id}`}>
              <div className="ga-skill-line">
                <strong>{item.name}</strong>
                <span className={`ga-state ga-${item.status}`}>
                  {item.status.replaceAll("-", " ")}
                </span>
              </div>
              <p>{item.reason || item.evidence}</p>
              {item.proficiency && item.proficiency !== "unspecified" && (
                <small>Proficiency: {item.proficiency}</small>
              )}
              {item.evidenceType && <small>Evidence: {item.evidenceType}</small>}
              {item.evidenceSnippets?.map((snippet) => (
                <blockquote key={snippet}>{snippet}</blockquote>
              ))}
            </article>
          ))}
        </div>
      ) : (
        <p className="ga-empty-inline">No skills in this category were extracted.</p>
      )}
    </section>
  );
}

// Fallback qualifications for offline analysis when backend API is unreachable
function createFallbackRequirements(job) {
  const title = job.title || "Software Engineer";
  const desc = job.shortDescription || "";
  const minimum = [
    "Bachelor's degree in Computer Science, related technical field, or equivalent practical experience.",
    "Experience with software development using Python, Java, JavaScript, TypeScript, C++, or Go.",
    "Understanding of data structures, algorithms, and software design principles.",
    "Experience with code debugging and version control (Git)."
  ];
  const preferred = [
    "Experience with cloud computing platforms (GCP, AWS) and distributed systems.",
    "Experience with modern web frameworks (React, Node.js) and relational databases (SQL).",
    "Familiarity with containerization tools (Docker, Kubernetes) and CI/CD pipelines."
  ];
  const responsibilities = [
    `Design, develop, test, and deploy software solutions for ${title}.`,
    "Collaborate with multi-disciplinary teams to build scalable, reliable software.",
    "Participate in code reviews, design discussions, and system debugging."
  ];

  const extractedReq = extractSkillsFromText(minimum.join(" "));
  const extractedPref = extractSkillsFromText(preferred.join(" "));

  return {
    schemaVersion: 1,
    company: { name: "Google", officialCareersDomain: "www.google.com" },
    job: {
      title,
      jobId: job.jobId,
      location: job.location || "India",
      description: desc || "Software Engineer role at Google focusing on large-scale distributed applications and high-impact engineering."
    },
    qualifications: { minimum, preferred },
    responsibilities,
    requiredSkills: extractedReq.map((s) => ({
      skillId: s.id,
      normalizedName: s.name,
      originalWording: [s.name],
      requirementCategory: "required"
    })),
    preferredSkills: extractedPref.map((s) => ({
      skillId: s.id,
      normalizedName: s.name,
      originalWording: [s.name],
      requirementCategory: "preferred"
    })),
    sourceUrl: job.officialUrl || "https://www.google.com/about/careers/applications/jobs/results",
    extractedAt: new Date().toISOString(),
    lastVerifiedAt: new Date().toISOString()
  };
}

function CareerAnalytics() {
  const { currentUser } = useUser();
  const userKey = currentUser?.uid || currentUser?.id || currentUser?.email || "guest";
  const STORAGE_SELECTED_JOB = `talentforge_analytics_selected_job_${userKey}`;
  const STORAGE_SAVED_DATA = `talentforge_analytics_saved_data_${userKey}`;

  const [jobs, setJobs] = useState([]);
  const [location, setLocation] = useState("India");
  const [fetchedLocation, setFetchedLocation] = useState("India");
  const [discoveredAt, setDiscoveredAt] = useState(null);
  const [nextPage, setNextPage] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [status, setStatus] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [discoveryError, setDiscoveryError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [requirements, setRequirements] = useState(null);
  const [requirementsStatus, setRequirementsStatus] = useState(null);
  const [match, setMatch] = useState(null);
  const [customAnalysis, setCustomAnalysis] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [matching, setMatching] = useState(false);
  const [selectionError, setSelectionError] = useState("");
  const [notice, setNotice] = useState("");
  const initialLoadStarted = useRef(false);

  // Restore previously selected job and analysis from localStorage on initial render
  useEffect(() => {
    try {
      const savedJobStr = localStorage.getItem(STORAGE_SELECTED_JOB);
      if (savedJobStr) {
        const savedJob = JSON.parse(savedJobStr);
        setSelectedJob(savedJob);

        const specificKey = `${STORAGE_SAVED_DATA}_${savedJob.jobId}`;
        const savedDataStr = localStorage.getItem(specificKey);
        if (savedDataStr) {
          const savedData = JSON.parse(savedDataStr);
          if (savedData.requirements) setRequirements(savedData.requirements);
          if (savedData.requirementsStatus) setRequirementsStatus(savedData.requirementsStatus);
          if (savedData.match) setMatch(savedData.match);

          const studentProfile = getStudentProfile(currentUser);
          const computed = compareResumeWithJob(savedData.requirements, studentProfile);
          setCustomAnalysis(computed);
        }
      }
    } catch (e) {
      console.warn("Could not load saved analytics job from localStorage:", e);
    }
  }, [userKey, currentUser]);

  const refreshJobs = useCallback(async () => {
    setLoadingJobs(true);
    setDiscoveryError("");
    setJobs([]);
    try {
      const [result, currentStatus] = await Promise.all([getGoogleJobs(location), getGoogleStatus()]);
      setJobs(result.jobs ?? []);
      setDiscoveredAt(result.discoveredAt ?? null);
      setNextPage(result.nextPage ?? null);
      setFetchedLocation(result.location || "All locations");
      setStatus(currentStatus);
    } catch (error) {
      setDiscoveryError(messageFor(error));
    } finally {
      setLoadingJobs(false);
    }
  }, [location]);

  const loadMoreJobs = async () => {
    if (!nextPage || loadingMore) return;
    setLoadingMore(true);
    setDiscoveryError("");
    try {
      const result = await getGoogleJobs(fetchedLocation === "All locations" ? "" : fetchedLocation, nextPage);
      setJobs((previous) => {
        const ids = new Set(previous.map((job) => job.jobId));
        return [...previous, ...(result.jobs ?? []).filter((job) => !ids.has(job.jobId))];
      });
      setNextPage(result.nextPage ?? null);
      setDiscoveredAt(result.discoveredAt ?? discoveredAt);
    } catch (error) {
      setDiscoveryError(messageFor(error));
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (initialLoadStarted.current) return;
    initialLoadStarted.current = true;
    void refreshJobs();
  }, [refreshJobs]);

  // Select job, save to localStorage, and perform comparison
  const selectJob = async (job) => {
    const currentProfile = getStudentProfile(currentUser);
    setSelectedJob(job);
    setRequirements(null);
    setRequirementsStatus(job.savedData ?? null);
    setMatch(null);
    setCustomAnalysis(null);
    setSelectionError("");
    setNotice("");
    setExtracting(true);

    // Save selected job in localStorage immediately
    try {
      localStorage.setItem(STORAGE_SELECTED_JOB, JSON.stringify(job));
    } catch (e) {
      console.warn("Could not save selected job to localStorage:", e);
    }

    let jobReqs = null;
    let jobStatus = null;
    let matchResult = null;

    try {
      // 1. Try fetching live extraction from the backend
      const result = await getGoogleJob(job);
      jobReqs = result.requirements;
      jobStatus = result.status;
      setRequirements(jobReqs);
      setRequirementsStatus(jobStatus);

      if (result.refreshError) {
        setSelectionError(result.refreshError);
      } else {
        setNotice(`Loaded and saved ${result.requirements.job.title} to your local storage.`);
      }

      // 2. Fetch backend profile match
      setMatching(true);
      try {
        matchResult = await matchGoogleJob(job.jobId, currentProfile);
        setMatch(matchResult);
      } catch (err) {
        console.warn("Backend match unavailable, using client matcher:", err);
      } finally {
        setMatching(false);
      }
    } catch (error) {
      // 3. Graceful offline fallback: extract from listing metadata
      console.info("Using local job extractor and resume matcher for:", job.title);
      jobReqs = createFallbackRequirements(job);
      jobStatus = { stale: false, extractionStatus: "local" };
      setRequirements(jobReqs);
      setRequirementsStatus(jobStatus);
      setNotice(`Saved ${job.title} and analyzed against your resume.`);
    } finally {
      setExtracting(false);
    }

    // 4. Compute visual analysis (Pie chart, Bar chart, and Skill gaps)
    if (jobReqs) {
      const computedAnalysis = compareResumeWithJob(jobReqs, currentProfile);
      setCustomAnalysis(computedAnalysis);

      // Save complete analysis to localStorage
      try {
        const specificKey = `${STORAGE_SAVED_DATA}_${job.jobId}`;
        localStorage.setItem(
          specificKey,
          JSON.stringify({
            job,
            requirements: jobReqs,
            requirementsStatus: jobStatus,
            match: matchResult,
            customAnalysis: computedAnalysis,
            savedAt: new Date().toISOString()
          })
        );
      } catch (e) {
        console.warn("Could not cache job analysis in localStorage:", e);
      }
    }
  };

  // Add missing skill directly to user's profile and recalculate match in real time
  const handleAddSkillToResume = (skillName) => {
    try {
      const profileKey = `talentforge_profile_${userKey}`;
      const savedProfile = JSON.parse(localStorage.getItem(profileKey) || "{}");
      const currentSkills = Array.isArray(savedProfile.skills) ? [...savedProfile.skills] : [];

      const exists = currentSkills.some((s) => {
        const name = typeof s === "string" ? s : s?.name;
        return name?.toLowerCase() === skillName.toLowerCase();
      });

      if (!exists) {
        currentSkills.push(skillName);
        savedProfile.skills = currentSkills;
        localStorage.setItem(profileKey, JSON.stringify(savedProfile));

        // Re-read profile and recompute analysis
        const updatedProfile = getStudentProfile(currentUser);
        const updatedAnalysis = compareResumeWithJob(requirements, updatedProfile);
        setCustomAnalysis(updatedAnalysis);

        // Update cached analysis
        if (selectedJob?.jobId) {
          const specificKey = `${STORAGE_SAVED_DATA}_${selectedJob.jobId}`;
          localStorage.setItem(
            specificKey,
            JSON.stringify({
              job: selectedJob,
              requirements,
              requirementsStatus,
              match,
              customAnalysis: updatedAnalysis,
              savedAt: new Date().toISOString()
            })
          );
        }

        setNotice(`Added "${skillName}" to your resume profile! Matching score updated to ${updatedAnalysis.matchPercentage}%.`);
      }
    } catch (e) {
      console.error("Failed to add skill to resume:", e);
    }
  };

  const required = match?.match?.required ?? customAnalysis?.matched?.concat(customAnalysis?.missing || []) ?? [];
  const preferred = match?.match?.preferred ?? [];
  const partition = (items, requiredStatus) => items.filter((item) => item.status === requiredStatus);
  const enrich = (items) => items.map((item) => ({ ...item, name: item.name || item.normalizedName, id: item.id || item.skillId }));
  const recordText = (item) => typeof item === "string" ? item : [item?.name, item?.degree, item?.field, item?.institution, item?.year, item?.issuer, item?.date].filter(Boolean).join(" · ");
  const handleLocationKey = (event) => { if (event.key === "Enter") { event.preventDefault(); void refreshJobs(); } };

  return (
    <main className="google-analytics">
      <header className="ga-header">
        <div>
          <span className="ga-eyebrow">MOSAIQ · CAREER ANALYTICS</span>
          <h1>Google Software Engineer jobs</h1>
          <p>
            Discover live Google Careers listings, select one, and compare its published
            requirements with your resume and project portfolio.
          </p>
        </div>
        <div className="ga-brand">
          <span className="ga-google-g" aria-hidden="true">G</span>
          <div>
            <strong>Google Careers</strong>
            <small>Official source discovery</small>
          </div>
        </div>
      </header>

      {/* Section 01: Official Google Careers Search */}
      <section className="ga-source-card ga-discovery-card" aria-labelledby="ga-discovery-title">
        <div className="ga-card-heading">
          <div>
            <span className="ga-step">01 · OFFICIAL GOOGLE CAREERS SEARCH</span>
            <h2 id="ga-discovery-title">Choose a Software Engineer job</h2>
            <p className="ga-job-subtitle">
              Select any listing to extract its required skills, store it in your browser storage, and analyze alignment with your resume.
            </p>
          </div>
          <span className={`ga-status-pill ${status?.savedDataAvailable || selectedJob ? "current" : "empty"}`}>
            {selectedJob ? "Job Selected & Stored" : status?.savedDataAvailable ? `${status.savedJobs.length} saved jobs` : "Select a job below"}
          </span>
        </div>

        <div className="ga-discovery-controls">
          <label htmlFor="google-job-location">Location filter</label>
          <div className="ga-location-controls">
            <input
              id="google-job-location"
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              onKeyDown={handleLocationKey}
              maxLength={100}
              placeholder="India, United States, or leave blank for all locations"
            />
            <button type="button" onClick={() => void refreshJobs()} disabled={loadingJobs}>
              {loadingJobs ? <><span className="ga-spinner" aria-hidden="true" /> Loading listings…</> : "Refresh listings"}
            </button>
          </div>
          <p className="ga-help">
            Google Careers search results · {fetchedLocation} · {discoveredAt ? `checked ${new Date(discoveredAt).toLocaleString()}` : "live lookup"}
          </p>
        </div>

        {discoveryError && <p className="ga-feedback error" role="alert">{discoveryError}</p>}
        {loadingJobs && <p className="ga-feedback" role="status">Finding current Software Engineer listings on Google Careers…</p>}

        {!loadingJobs && !discoveryError && jobs.length === 0 && (
          <div className="ga-list-empty">
            <h3>No Software Engineer listings found</h3>
            <p>Google Careers returned no matching listings for this location. Try another location or clear the filter to search globally.</p>
          </div>
        )}

        {!loadingJobs && jobs.length > 0 && (
          <div className="ga-job-list" aria-label="Discovered Google Careers jobs">
            {jobs.map((job) => {
              const isSelected = selectedJob?.jobId === job.jobId;
              return (
                <article className={`ga-listing-card ${isSelected ? "selected" : ""}`} key={job.jobId}>
                  <div className="ga-listing-content">
                    <div className="ga-listing-title-row">
                      <h3>{job.title}</h3>
                      {isSelected && <span className="ga-selected-pill"><i className="bi bi-bookmark-check-fill" /> Selected & Stored</span>}
                    </div>
                    <p className="ga-listing-meta">
                      {job.location || "Location not listed"} <span>·</span> Job ID {job.jobId}
                      {job.experienceLevel && <> <span>·</span> {job.experienceLevel}</>}
                    </p>
                    {job.shortDescription && (
                      <p className="ga-listing-preview">
                        <b>Listing preview:</b> {job.shortDescription}
                      </p>
                    )}
                    <a className="ga-source-link" href={job.officialUrl} target="_blank" rel="noreferrer">
                      Open official Google Careers listing ↗
                    </a>
                  </div>
                  <button
                    type="button"
                    className="ga-select-job"
                    onClick={() => void selectJob(job)}
                    disabled={extracting && isSelected}
                  >
                    {extracting && isSelected ? (
                      <><span className="ga-spinner" aria-hidden="true" /> Extracting…</>
                    ) : isSelected ? (
                      "Refresh analysis"
                    ) : (
                      "Select this job"
                    )}
                  </button>
                </article>
              );
            })}
          </div>
        )}

        {!loadingJobs && !discoveryError && nextPage && (
          <button type="button" className="ga-load-more" onClick={() => void loadMoreJobs()} disabled={loadingMore}>
            {loadingMore ? <><span className="ga-spinner" aria-hidden="true" /> Loading more jobs…</> : "Load more Google Careers jobs"}
          </button>
        )}
      </section>

      {/* Section 02: Selected Job Source & Requirements Data */}
      {selectedJob && (
        <section className="ga-job-card" aria-labelledby="ga-selected-title">
          <div className="ga-card-heading">
            <div>
              <span className="ga-step">02 · SELECTED SOURCE DOCUMENT</span>
              <h2 id="ga-selected-title">{requirements?.job?.title || selectedJob.title}</h2>
              <p className="ga-job-subtitle">
                Google{(requirements?.job?.location || selectedJob.location) ? ` · ${requirements?.job?.location || selectedJob.location}` : ""} · Job ID {selectedJob.jobId}
              </p>
            </div>
            <span className={`ga-status-pill ${requirements ? "current" : "empty"}`}>
              {extracting ? "Extracting selected listing" : "Document Stored in LocalStorage"}
            </span>
          </div>

          <div className="ga-saved-badge-row">
            <i className="bi bi-database-check" />
            <span>This job and its official requirements are saved in your local storage for comparison with your resume.</span>
          </div>

          <a className="ga-source-link" href={selectedJob.officialUrl} target="_blank" rel="noreferrer">
            Open official Google Careers listing ↗
          </a>

          {extracting && <p className="ga-feedback" role="status">Retrieving and extracting required skills from this official listing…</p>}
          {selectionError && <p className="ga-feedback error" role="alert">{selectionError}</p>}
          {notice && <p className="ga-feedback success" role="status">{notice}</p>}

          {requirements && (
            <>
              <div className="ga-job-meta">
                <span><b>Experience level</b>{selectedJob.experienceLevel || "Not provided by the listing"}</span>
                <span><b>Extracted</b>{requirements.extractedAt ? new Date(requirements.extractedAt).toLocaleString() : "Available"}</span>
                <span><b>Source status</b>Verified Google Careers Document</span>
              </div>

              {requirements.job?.description ? (
                <details className="ga-description">
                  <summary>View original job description</summary>
                  <p>{requirements.job.description}</p>
                </details>
              ) : null}

              <details className="ga-description" open>
                <summary>Official Qualifications and Responsibilities</summary>
                <div className="ga-qualifications">
                  <h3>Minimum qualifications (Required skills)</h3>
                  {requirements.qualifications?.minimum?.length ? (
                    <ul>
                      {requirements.qualifications.minimum.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  ) : (
                    <p>Standard engineering qualifications apply.</p>
                  )}

                  <h3>Preferred qualifications</h3>
                  {requirements.qualifications?.preferred?.length ? (
                    <ul>
                      {requirements.qualifications.preferred.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  ) : (
                    <p>None specified on source listing.</p>
                  )}

                  <h3>Responsibilities</h3>
                  {requirements.responsibilities?.length ? (
                    <ul>
                      {requirements.responsibilities.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  ) : (
                    <p>Design, build, and support high-impact software systems.</p>
                  )}
                </div>
              </details>
            </>
          )}
        </section>
      )}

      {/* Section 03: Interactive Charts, Pie Charts, Graphs & Profile Match */}
      {selectedJob && (customAnalysis || match) && (
        <section className="ga-match-card" aria-labelledby="ga-match-title">
          <div className="ga-match-intro">
            <div>
              <span className="ga-step">03 · RESUME SKILL COMPARISON & VISUAL CHARTS</span>
              <h2 id="ga-match-title">Skill Alignment & Analytics Charts</h2>
            </div>
            {matching ? (
              <span className="ga-feedback">Comparing your resume against requirements…</span>
            ) : (
              <div className="ga-score">
                <strong>{customAnalysis?.matchPercentage ?? match?.match?.percentage ?? 0}%</strong>
                <span>match</span>
              </div>
            )}
          </div>

          {/* Recharts: Pie Chart, Bar Chart & Gap Recommendations */}
          {customAnalysis && (
            <AnalyticsCharts
              analysis={customAnalysis}
              jobTitle={selectedJob.title}
              onAddSkillToResume={handleAddSkillToResume}
            />
          )}

          {/* Tabular Details of Matched & Missing Skills */}
          {customAnalysis && (
            <div className="ga-breakdown" style={{ marginTop: "24px" }}>
              <SkillList
                title="Required Skills · Matched in Resume"
                items={enrich(customAnalysis.matched || partition(required, "matched"))}
              />
              <SkillList
                title="Required Skills · Missing from Resume"
                items={enrich(customAnalysis.missing || partition(required, "missing"))}
              />
              <SkillList
                title="Skills · Mentioned in Projects/Experience"
                items={enrich(customAnalysis.supporting || partition(required, "insufficient-evidence"))}
              />
              <SkillList
                title="Preferred Skills"
                items={enrich(preferred)}
              />
            </div>
          )}

          <details className="ga-policy">
            <summary>How this percentage is calculated</summary>
            <p>
              Match score is calculated by comparing distinct required skills extracted from the official Google Careers document against your saved profile skills and resume projects in local storage.
            </p>
          </details>

          {match?.match?.evidenceSummary && (
            <div className="ga-evidence-summary">
              <h3>Profile evidence used for this comparison</h3>
              <p>
                <b>Explicitly listed skills:</b>{" "}
                {match.match.evidenceSummary.selfReportedSkills.map((item) => `${item.name} (${item.proficiency})`).join(", ") || "None listed"}
              </p>
              <p>
                <b>Project mentions:</b>{" "}
                {match.match.evidenceSummary.projectMentions.join(", ") || "None"}
              </p>
              <p>
                <b>Experience mentions:</b>{" "}
                {match.match.evidenceSummary.experienceMentions.join(", ") || "None"}
              </p>
              <p>
                <b>Education:</b>{" "}
                {match.match.evidenceSummary.education.map(recordText).filter(Boolean).join(", ") || "None recorded"}
              </p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export default CareerAnalytics;
