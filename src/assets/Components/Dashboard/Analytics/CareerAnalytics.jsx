import { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "../../../../context/UserContext";
import { getGoogleJob, getGoogleJobs, getGoogleStatus, matchGoogleJob } from "./services/googleAnalyticsApi";
import { getStudentProfile } from "./utils/studentProfileAdapter";
import "./analytics.css";

const messageFor = (error) => error instanceof Error ? error.message : "The Analytics service is unavailable. Try again.";

function SkillList({ title, items }) {
  return <section className="ga-skill-group"><h3>{title} <span>{items.length}</span></h3>{items.length ? <div className="ga-skill-list">{items.map((item) => <article key={`${title}-${item.id}`}><div className="ga-skill-line"><strong>{item.name}</strong><span className={`ga-state ga-${item.status}`}>{item.status.replaceAll("-", " ")}</span></div><p>{item.reason}</p>{item.proficiency && item.proficiency !== "unspecified" && <small>Proficiency: {item.proficiency}</small>}{item.evidenceType && <small>Evidence: {item.evidenceType}</small>}{item.evidenceSnippets?.map((snippet) => <blockquote key={snippet}>{snippet}</blockquote>)}</article>)}</div> : <p className="ga-empty-inline">No skills in this category were extracted.</p>}</section>;
}

function CareerAnalytics() {
  const { currentUser } = useUser();
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
  const [extracting, setExtracting] = useState(false);
  const [matching, setMatching] = useState(false);
  const [selectionError, setSelectionError] = useState("");
  const [notice, setNotice] = useState("");
  const initialLoadStarted = useRef(false);

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
    } finally { setLoadingJobs(false); }
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
    } catch (error) { setDiscoveryError(messageFor(error)); }
    finally { setLoadingMore(false); }
  };

  useEffect(() => {
    if (initialLoadStarted.current) return;
    initialLoadStarted.current = true;
    void refreshJobs();
  }, [refreshJobs]);
  const selectJob = async (job) => {
    const currentProfile = getStudentProfile(currentUser);
    setSelectedJob(job);
    setRequirements(null);
    setRequirementsStatus(job.savedData ?? null);
    setMatch(null);
    setSelectionError("");
    setNotice("");
    setExtracting(true);
    try {
      const result = await getGoogleJob(job);
      setRequirements(result.requirements);
      setRequirementsStatus(result.status);
      if (result.refreshError) setSelectionError(result.refreshError);
      else setNotice(`Loaded and saved ${result.requirements.job.title} from Google Careers.`);
      setMatching(true);
      try { setMatch(await matchGoogleJob(job.jobId, currentProfile)); }
      catch (error) { setMatch(null); setSelectionError((previous) => [previous, messageFor(error)].filter(Boolean).join(" ")); }
      finally { setMatching(false); }
    } catch (error) {
      setSelectionError(messageFor(error));
    } finally { setExtracting(false); }
  };

  const required = match?.match?.required ?? [];
  const preferred = match?.match?.preferred ?? [];
  const unassessedCount = required.filter((item) => !item.proficiency || item.proficiency === "unspecified" || item.proficiency === "unassessed").length;
  const partition = (items, requiredStatus) => items.filter((item) => item.status === requiredStatus);
  const enrich = (items) => items.map((item) => ({ ...item, name: item.name || item.normalizedName, id: item.id || item.skillId }));
  const recordText = (item) => typeof item === "string" ? item : [item?.name, item?.degree, item?.field, item?.institution, item?.year, item?.issuer, item?.date].filter(Boolean).join(" · ");
  const handleLocationKey = (event) => { if (event.key === "Enter") { event.preventDefault(); void refreshJobs(); } };

  return <main className="google-analytics">
    <header className="ga-header"><div><span className="ga-eyebrow">MOSAIQ · CAREER ANALYTICS</span><h1>Google Software Engineer jobs</h1><p>Discover live Google Careers listings, select one, and compare its published requirements with your MOSAIQ profile.</p></div><div className="ga-brand"><span className="ga-google-g" aria-hidden="true">G</span><div><strong>Google Careers</strong><small>Official source discovery</small></div></div></header>

    <section className="ga-source-card ga-discovery-card" aria-labelledby="ga-discovery-title">
      <div className="ga-card-heading"><div><span className="ga-step">01 · OFFICIAL GOOGLE CAREERS SEARCH</span><h2 id="ga-discovery-title">Choose a Software Engineer job</h2><p className="ga-job-subtitle">Listings are fetched live from Google Careers. No sample or fallback jobs are shown.</p></div><span className={`ga-status-pill ${status?.savedDataAvailable ? "current" : "empty"}`}>{status?.savedDataAvailable ? `${status.savedJobs.length} saved job${status.savedJobs.length === 1 ? "" : "s"}` : "No saved requirements"}</span></div>
      <div className="ga-discovery-controls"><label htmlFor="google-job-location">Location filter</label><div className="ga-location-controls"><input id="google-job-location" type="text" value={location} onChange={(event) => setLocation(event.target.value)} onKeyDown={handleLocationKey} maxLength={100} placeholder="India, United States, or leave blank for all locations" /><button type="button" onClick={() => void refreshJobs()} disabled={loadingJobs}>{loadingJobs ? <><span className="ga-spinner" aria-hidden="true" /> Loading listings…</> : "Refresh listings"}</button></div><p className="ga-help">Google Careers search results · {fetchedLocation} · {discoveredAt ? `checked ${new Date(discoveredAt).toLocaleString()}` : "not checked yet"}</p></div>
      {discoveryError && <p className="ga-feedback error" role="alert">{discoveryError}</p>}
      {loadingJobs && <p className="ga-feedback" role="status">Finding current Software Engineer listings on Google Careers…</p>}
      {!loadingJobs && !discoveryError && jobs.length === 0 && <div className="ga-list-empty"><h3>No Software Engineer listings found</h3><p>Google Careers returned no matching listings for this location. Try another location or clear the filter to search globally.</p></div>}
      {!loadingJobs && jobs.length > 0 && <div className="ga-job-list" aria-label="Discovered Google Careers jobs">{jobs.map((job) => {
        const isSelected = selectedJob?.jobId === job.jobId;
        return <article className={`ga-listing-card ${isSelected ? "selected" : ""}`} key={job.jobId}>
          <div className="ga-listing-content"><div className="ga-listing-title-row"><h3>{job.title}</h3>{isSelected && <span className="ga-selected-pill">Selected</span>}</div><p className="ga-listing-meta">{job.location || "Location not listed"} <span>·</span> Job ID {job.jobId}{job.experienceLevel && <> <span>·</span> {job.experienceLevel}</>}</p>{job.shortDescription && <p className="ga-listing-preview"><b>Google listing preview:</b> {job.shortDescription}</p>}<a className="ga-source-link" href={job.officialUrl} target="_blank" rel="noreferrer">Open official Google Careers listing ↗</a>{job.savedData && <span className={`ga-saved-note ${job.savedData.stale ? "stale" : ""}`}>{job.savedData.stale ? "Saved extraction is stale" : "Requirements previously saved"}</span>}</div>
          <button type="button" className="ga-select-job" onClick={() => void selectJob(job)} disabled={extracting && isSelected}>{extracting && isSelected ? <><span className="ga-spinner" aria-hidden="true" /> Extracting…</> : isSelected ? "Refresh selected job" : "Select this job"}</button>
        </article>;
      })}</div>}
      {!loadingJobs && !discoveryError && nextPage && <button type="button" className="ga-load-more" onClick={() => void loadMoreJobs()} disabled={loadingMore}>{loadingMore ? <><span className="ga-spinner" aria-hidden="true" /> Loading more jobs…</> : "Load more Google Careers jobs"}</button>}
    </section>


    {selectedJob && <section className="ga-job-card" aria-labelledby="ga-selected-title"><div className="ga-card-heading"><div><span className="ga-step">02 · SELECTED SOURCE DATA</span><h2 id="ga-selected-title">{requirements?.job?.title || selectedJob.title}</h2><p className="ga-job-subtitle">Google{(requirements?.job?.location || selectedJob.location) ? ` · ${requirements?.job?.location || selectedJob.location}` : ""} · Job ID {selectedJob.jobId}</p></div><span className={`ga-status-pill ${requirementsStatus?.stale ? "stale" : requirements ? "current" : "empty"}`}>{extracting ? "Extracting selected listing" : requirementsStatus?.stale ? "Saved data · stale" : requirements ? "Source verified" : "Awaiting extraction"}</span></div>
      <a className="ga-source-link" href={selectedJob.officialUrl} target="_blank" rel="noreferrer">Open official Google Careers listing ↗</a>
      {extracting && <p className="ga-feedback" role="status">Retrieving and validating the full description and requirements for this job…</p>}
      {selectionError && <p className="ga-feedback error" role="alert">{selectionError}</p>}
      {notice && <p className="ga-feedback success" role="status">{notice}</p>}
      {requirements && <><div className="ga-job-meta"><span><b>Experience level</b>{selectedJob.experienceLevel || "Not provided by the listing"}</span><span><b>Extracted</b>{requirements.extractedAt ? new Date(requirements.extractedAt).toLocaleString() : "Not available"}</span><span><b>Last verified from source</b>{requirements.lastVerifiedAt ? new Date(requirements.lastVerifiedAt).toLocaleString() : "Not available"}</span></div>{requirements.job.description ? <details className="ga-description"><summary>View original job description</summary><p>{requirements.job.description}</p></details> : <p className="ga-help">Google does not publish a separate overview paragraph on this listing; the qualifications and responsibilities below are the extracted job content.</p>}<details className="ga-description" open><summary>Qualifications and responsibilities</summary><div className="ga-qualifications"><h3>Minimum qualifications</h3>{requirements.qualifications.minimum.length ? <ul>{requirements.qualifications.minimum.map((item) => <li key={item}>{item}</li>)}</ul> : <p>Not listed on the source page.</p>}<h3>Preferred qualifications</h3>{requirements.qualifications.preferred.length ? <ul>{requirements.qualifications.preferred.map((item) => <li key={item}>{item}</li>)}</ul> : <p>Not listed on the source page.</p>}<h3>Responsibilities</h3>{requirements.responsibilities.length ? <ul>{requirements.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul> : <p>Not separately labeled on the source page.</p>}</div></details></>}
    </section>}

    {requirements && <section className="ga-match-card" aria-labelledby="ga-match-title"><div className="ga-match-intro"><div><span className="ga-step">03 · YOUR PROFILE MATCH</span><h2 id="ga-match-title">Profile alignment</h2></div>{matching ? <span className="ga-feedback">Comparing your current profile…</span> : match?.match?.percentage !== null && match?.match?.percentage !== undefined ? <div className="ga-score"><strong>{match.match.percentage}%</strong><span>match</span></div> : <div className="ga-score unavailable"><strong>—</strong><span>unavailable</span></div>}</div>{match?.match?.error ? <p className="ga-feedback error">{match.match.error}</p> : match?.match && <><p className="ga-score-explainer"><strong>{match.match.matchedCount} of {match.match.totalRequired}</strong> distinct required skills matched from your profile. Proficiency is unassessed for {unassessedCount} required skills because this profile does not record that information. This is a profile comparison, not an employer eligibility decision.</p><div className="ga-breakdown"><SkillList title="Required · matched" items={enrich(partition(required, "matched"))} /><SkillList title="Required · missing" items={enrich(partition(required, "missing"))} /><SkillList title="Required · supporting evidence only" items={enrich(partition(required, "insufficient-evidence"))} /><SkillList title="Preferred · shown separately" items={enrich(preferred)} /></div><details className="ga-policy"><summary>How this percentage is calculated</summary><p>{match.match.scoringPolicy}</p></details><div className="ga-evidence-summary"><h3>Profile evidence used for this comparison</h3><p><b>Explicitly listed skills:</b> {match.match.evidenceSummary.selfReportedSkills.map((item) => `${item.name} (${item.proficiency})`).join(", ") || "None listed"}</p><p><b>Project mentions (not counted as direct skill matches):</b> {match.match.evidenceSummary.projectMentions.join(", ") || "None"}</p><p><b>Experience mentions:</b> {match.match.evidenceSummary.experienceMentions.join(", ") || "None"}</p><p><b>Education:</b> {match.match.evidenceSummary.education.map(recordText).filter(Boolean).join(", ") || "None recorded in this profile"}</p><p><b>Certifications:</b> {match.match.evidenceSummary.certifications.map(recordText).filter(Boolean).join(", ") || "None recorded in this profile"}</p><p><b>Verified skills:</b> None returned by the existing MOSAIQ profile.</p></div></>}</section>}
  </main>;

}

export default CareerAnalytics;
