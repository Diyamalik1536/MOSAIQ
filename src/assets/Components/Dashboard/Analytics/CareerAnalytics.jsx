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
    <header className="ga-header"><div><span className="ga-eyebrow">TALENTFORGE · CAREER ANALYTICS</span><h1>Google Software Engineer jobs</h1><p>Discover live Google Careers listings, select one, and compare its published requirements with your TalentForge profile.</p></div><div className="ga-brand"><span className="ga-google-g" aria-hidden="true">G</span><div><strong>Google Careers</strong><small>Official source discovery</small></div></div></header>

<<<<<<< HEAD
    {section === "Overview" && <>
      <div className="ca-section-title"><div><span>YOUR SNAPSHOT</span><h2>Readiness at a glance</h2></div><span className="ca-defined">MOSAIQ-defined indicator · not an employer eligibility decision</span></div>
      <section className="ca-metrics">
        <article className="ca-metric ca-primary-metric"><span>Overall career readiness</span><strong>{readiness === null ? "—" : `${Math.round(readiness)}%`}</strong><b>{readinessLabel}</b><small>Based on your assessed skills and best sample role match</small></article>
        <article className="ca-metric"><span>Best sample match</span><strong className="ca-metric-text">{bestMatch?.role.title || "—"}</strong><small>{bestMatch ? `${bestMatch.company.name} · ${bestMatch.result.overall}% calculated match` : "Assess skills to explore matches"}</small></article>
        <article className="ca-metric"><span>Skills matched</span><strong>{analysis.matchedSkills.length}</strong><small>For selected role: {selectedRole.title}</small></article>
        <article className="ca-metric"><span>Skills missing</span><strong>{analysis.missingSkills.length}</strong><small>Must-have and preferred requirements</small></article>
        <article className="ca-metric"><span>Profile completeness</span><strong>{completeness}%</strong><small>Across profile, skills, projects and education</small></article>
      </section>
      {readiness === null && <div className="ca-empty"><strong>Complete your profile and assess your skills to generate a reliable readiness score.</strong><p>Add skills to your profile to begin career matching. Proficiency is never assumed; assess each skill below.</p><button className="ca-button" onClick={() => setSection("Skill Gap Analysis")}>Assess skills</button></div>}
      <div className="ca-two-col"><section className="ca-card"><div className="ca-card-heading"><div><span>TOP ALIGNMENT</span><h3>Roles to explore</h3></div><button className="ca-link" onClick={() => setSection("Company Matches")}>Explore companies →</button></div>{rankedRoles.slice(0, 4).map(({ company, role, result }) => <button className="ca-role-row" key={role.id} onClick={() => viewRole(role.id)}><span className="ca-company-mark">{company.name.slice(0, 1)}</span><span><strong>{role.title}</strong><small>{company.name} · {role.category}</small></span><b>{result.overall === null ? "Assess skills" : `${Math.round(result.overall)}%`}</b></button>)}</section>
        <section className="ca-card"><div className="ca-card-heading"><div><span>PROFILE SIGNALS</span><h3>Your starting point</h3></div></div>{profile.skills.length ? <><p className="ca-muted">Skills from your MOSAIQ profile</p><div className="ca-chips">{profileSkills.map((skill) => <span key={skill.id}>{skill.name}{assessments[skill.id] ? ` · ${levelNames[assessments[skill.id]]}` : " · Unassessed"}</span>)}</div></> : <div className="ca-inline-empty">Add skills to your profile to begin career matching.</div>}<div className="ca-inline-stats"><span><strong>{profile.projects.length}</strong> projects</span><span><strong>{profile.experience.length}</strong> experiences</span><span><strong>{profile.education.length}</strong> education records</span></div></section></div>
    </>}
=======
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
>>>>>>> e90d20c27dbf2fa55b6969670916ec3e1c3a6e18

    {selectedJob && <section className="ga-job-card" aria-labelledby="ga-selected-title"><div className="ga-card-heading"><div><span className="ga-step">02 · SELECTED SOURCE DATA</span><h2 id="ga-selected-title">{requirements?.job?.title || selectedJob.title}</h2><p className="ga-job-subtitle">Google{(requirements?.job?.location || selectedJob.location) ? ` · ${requirements?.job?.location || selectedJob.location}` : ""} · Job ID {selectedJob.jobId}</p></div><span className={`ga-status-pill ${requirementsStatus?.stale ? "stale" : requirements ? "current" : "empty"}`}>{extracting ? "Extracting selected listing" : requirementsStatus?.stale ? "Saved data · stale" : requirements ? "Source verified" : "Awaiting extraction"}</span></div>
      <a className="ga-source-link" href={selectedJob.officialUrl} target="_blank" rel="noreferrer">Open official Google Careers listing ↗</a>
      {extracting && <p className="ga-feedback" role="status">Retrieving and validating the full description and requirements for this job…</p>}
      {selectionError && <p className="ga-feedback error" role="alert">{selectionError}</p>}
      {notice && <p className="ga-feedback success" role="status">{notice}</p>}
      {requirements && <><div className="ga-job-meta"><span><b>Experience level</b>{selectedJob.experienceLevel || "Not provided by the listing"}</span><span><b>Extracted</b>{requirements.extractedAt ? new Date(requirements.extractedAt).toLocaleString() : "Not available"}</span><span><b>Last verified from source</b>{requirements.lastVerifiedAt ? new Date(requirements.lastVerifiedAt).toLocaleString() : "Not available"}</span></div>{requirements.job.description ? <details className="ga-description"><summary>View original job description</summary><p>{requirements.job.description}</p></details> : <p className="ga-help">Google does not publish a separate overview paragraph on this listing; the qualifications and responsibilities below are the extracted job content.</p>}<details className="ga-description" open><summary>Qualifications and responsibilities</summary><div className="ga-qualifications"><h3>Minimum qualifications</h3>{requirements.qualifications.minimum.length ? <ul>{requirements.qualifications.minimum.map((item) => <li key={item}>{item}</li>)}</ul> : <p>Not listed on the source page.</p>}<h3>Preferred qualifications</h3>{requirements.qualifications.preferred.length ? <ul>{requirements.qualifications.preferred.map((item) => <li key={item}>{item}</li>)}</ul> : <p>Not listed on the source page.</p>}<h3>Responsibilities</h3>{requirements.responsibilities.length ? <ul>{requirements.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul> : <p>Not separately labeled on the source page.</p>}</div></details></>}
    </section>}

<<<<<<< HEAD
    {section === "Skill Gap Analysis" && <><div className="ca-section-title"><div><span>PERSONALIZED SKILL GAP</span><h2>See what each role requires</h2><p>Self-assessments affect your match immediately. They are not independently verified.</p></div></div><div className="ca-card ca-role-picker"><label>Selected role<select value={selectedRole.id} onChange={(event) => selectRoleId(event.target.value)}>{rankedRoles.map(({ company, role }) => <option value={role.id} key={role.id}>{company.name} — {role.title}</option>)}</select></label><div className="ca-score-pills"><span>Overall <b>{analysis.overall ?? "—"}%</b></span><span>Must-have <b>{analysis.mustScore ?? "—"}%</b></span><span>Preferred <b>{analysis.preferredScore ?? "—"}%</b></span></div></div><section className="ca-card"><div className="ca-card-heading"><div><span>{selectedCompany.name.toUpperCase()}</span><h3>{selectedRole.title}</h3></div><span className="ca-role-reason">Weighted score: matched proficiency points ÷ total requirement weight</span></div><div className="ca-filters ca-compact-filters"><label>Show<select value={skillFilter} onChange={(event) => setSkillFilter(event.target.value)}>{["All", "Matched", "Exceeds Requirement", "Needs Improvement", "Missing", "must-have", "preferred"].map((item) => <option key={item}>{item}</option>)}</select></label><label>Sort by<select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>{["Importance", "Skill name", "Gap severity"].map((item) => <option key={item}>{item}</option>)}</select></label></div><div className="ca-skill-table"><div className="ca-table-head"><span>Skill / Weight</span><span>Your level</span><span>Required</span><span>Type</span><span>Status</span></div>{filteredRequirements.map((requirement) => { const row = analysis.requirements.find((item) => item.skillId === requirement.skillId); return <div className="ca-table-row" key={requirement.skillId}><span><strong>{normalizeSkill(requirement.skillId).name}</strong><small>Importance weight {requirement.weight}</small></span><label><span className="ca-sr-only">Assess {normalizeSkill(requirement.skillId).name}</span><select value={assessments[requirement.skillId] || ""} onChange={(event) => setAssessment(requirement.skillId, event.target.value)}><option value="">Unassessed</option>{proficiencyLevels.map((level, index) => <option key={level} value={index + 1}>{level}</option>)}</select><small>{assessments[requirement.skillId] ? "Self-assessed" : "Assess your level"}</small></label><span>{levelNames[requirement.requiredLevel]}</span><span><i className={`ca-type-dot ${requirement.type}`} />{requirement.type}</span><span className={`ca-status ${row.status.toLowerCase().replaceAll(" ", "-")}`}>{row.status}</span></div>; })}</div><p className="ca-muted ca-assessment-help">{Object.entries(proficiencyDescriptions).map(([level, description]) => `${level}: ${description}`).join(" ")} Assessments are self-reported. Existing projects do not automatically grant proficiency.</p></section></>}

    {section === "Career Roadmap" && <><div className="ca-section-title"><div><span>YOUR NEXT STEPS</span><h2>A practical roadmap for {selectedRole.title}</h2><p>Prioritized from actual missing and below-target skills. Completing a task never changes your proficiency assessment.</p></div><label className="ca-inline-select">Role<select value={selectedRole.id} onChange={(event) => selectRoleId(event.target.value)}>{rankedRoles.map(({ company, role }) => <option value={role.id} key={role.id}>{company.name} — {role.title}</option>)}</select></label></div>{roadmap.length ? <div className="ca-roadmap">{roadmap.map((task, index) => <article className="ca-roadmap-card" key={task.id}><span className="ca-roadmap-number">{String(index + 1).padStart(2, "0")}</span><div className="ca-roadmap-content"><div><span className={`ca-priority ${task.priority.toLowerCase()}`}>{task.priority} priority</span><span className="ca-task-skill">{normalizeSkill(task.skillId).name}</span></div><h3>{task.title}</h3><p>{task.description}</p><div className="ca-roadmap-meta"><span>◷ {task.duration}</span><a href={task.resource} target="_blank" rel="noreferrer">Learning resources ↗</a></div></div><label>Status<select value={task.status} onChange={(event) => updateTask(task.id, event.target.value)}>{["Not Started", "In Progress", "Completed"].map((status) => <option key={status}>{status}</option>)}</select></label></article>)}</div> : <div className="ca-empty"><strong>No gaps for this role based on your current assessment.</strong><p>Reassess your skills when you have new evidence; tasks do not update proficiency automatically.</p></div>}</>}

    {section === "Project Evidence" && <><div className="ca-section-title"><div><span>LEARNING THROUGH BUILDING</span><h2>Your project evidence</h2><p>Projects are read from your MOSAIQ profile and are treated as self-reported, not verified.</p></div></div>{profile.projects.length ? <div className="ca-project-grid">{profile.projects.map((project, index) => { const detected = normalizeSkillList([...(project.technologies || []), project.stack]).map((skill) => skill.id); const key = project.id || project.title || `project-${index}`; const associated = saved.evidence?.[key] || detected; return <article className="ca-card ca-project-card" key={key}><div className="ca-project-top"><span className="ca-company-mark">⌘</span><span className="ca-evidence-state">Self-reported evidence</span></div><h3>{project.title || "Untitled project"}</h3><p>{project.description || "No project description provided."}</p><label>Associate skills<div className="ca-check-list">{skillTaxonomy.map((skill) => <label key={skill.id}><input type="checkbox" checked={associated.includes(skill.id)} onChange={(event) => { const next = event.target.checked ? [...associated, skill.id] : associated.filter((id) => id !== skill.id); persist({ ...saved, evidence: { ...saved.evidence, [key]: next } }); }} />{skill.name}</label>)}</div></label><div className="ca-chips">{associated.map((id) => <span key={id}>{normalizeSkill(id)?.name || id}</span>)}</div><div className="ca-project-links">{project.link || project.repositoryUrl || project.githubUrl ? <a href={project.link || project.repositoryUrl || project.githubUrl} target="_blank" rel="noreferrer">Project link ↗</a> : <span>No project link</span>}{project.liveUrl || project.deploymentUrl ? <a href={project.liveUrl || project.deploymentUrl} target="_blank" rel="noreferrer">Live project ↗</a> : <span>No live URL</span>}</div></article>; })}</div> : <div className="ca-empty"><strong>Add your projects to demonstrate your practical experience.</strong><p>Projects added to your MOSAIQ profile will appear here.</p></div>}</>}

    {section === "Skill Demand" && <><div className="ca-section-title"><div><span>DATASET EXPLORER</span><h2>Skill demand insights</h2><p>Insights from MOSAIQ’s sample company requirements dataset. These are not live hiring statistics or current market demand.</p></div></div><section className="ca-card ca-demand-card"><div className="ca-card-heading"><div><span>{companiesDataset.length} COMPANIES · {rankedRoles.length} ROLE PROFILES</span><h3>Most frequently listed skills</h3></div></div><div className="ca-demand-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={demand} layout="vertical" margin={{ left: 8, right: 24, top: 5, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" allowDecimals={false} /><YAxis type="category" dataKey="name" width={155} tick={{ fontSize: 12 }} /><Tooltip formatter={(value, name) => [value, name === "total" ? "Role profiles" : name]} /><Bar dataKey="total" name="Role profiles" fill="var(--ca-accent)" radius={[0, 5, 5, 0]} /></BarChart></ResponsiveContainer></div><div className="ca-demand-list">{demand.map((item) => <div key={item.skillId}><strong>{item.name}</strong><span>{item.total} requirements</span><span>{item.roles} roles</span><span>{item.must} must-have</span><span>{item.preferred} preferred</span></div>)}</div><div className="ca-demand-breakdown"><label>Inspect skill by industry and role<select value={demandSkillId} onChange={(event) => setDemandSkillId(event.target.value)}>{skillTaxonomy.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}</select></label><div><strong>{selectedSkill.name} by industry</strong>{industryDemand.map((item) => <span key={item.name}>{item.name}<b>{item.count} roles</b></span>)}</div><div><strong>{selectedSkill.name} by role category</strong>{roleDemand.map((item) => <span key={item.name}>{item.name}<b>{item.count} roles</b></span>)}</div></div></section><section className="ca-card ca-data-disclosure"><strong>About this dataset</strong><p>{datasetMetadata.sourceDescription} Dataset type: {datasetMetadata.type}. Verification status: {datasetMetadata.verificationStatus}. Last reviewed: {datasetMetadata.lastReviewed}. Company websites link to their careers pages; no active vacancy is asserted here.</p></section></>}
  </div>;
=======
    {requirements && <section className="ga-match-card" aria-labelledby="ga-match-title"><div className="ga-match-intro"><div><span className="ga-step">03 · YOUR PROFILE MATCH</span><h2 id="ga-match-title">Profile alignment</h2></div>{matching ? <span className="ga-feedback">Comparing your current profile…</span> : match?.match?.percentage !== null && match?.match?.percentage !== undefined ? <div className="ga-score"><strong>{match.match.percentage}%</strong><span>match</span></div> : <div className="ga-score unavailable"><strong>—</strong><span>unavailable</span></div>}</div>{match?.match?.error ? <p className="ga-feedback error">{match.match.error}</p> : match?.match && <><p className="ga-score-explainer"><strong>{match.match.matchedCount} of {match.match.totalRequired}</strong> distinct required skills matched from your profile. Proficiency is unassessed for {unassessedCount} required skills because this profile does not record that information. This is a profile comparison, not an employer eligibility decision.</p><div className="ga-breakdown"><SkillList title="Required · matched" items={enrich(partition(required, "matched"))} /><SkillList title="Required · missing" items={enrich(partition(required, "missing"))} /><SkillList title="Required · supporting evidence only" items={enrich(partition(required, "insufficient-evidence"))} /><SkillList title="Preferred · shown separately" items={enrich(preferred)} /></div><details className="ga-policy"><summary>How this percentage is calculated</summary><p>{match.match.scoringPolicy}</p></details><div className="ga-evidence-summary"><h3>Profile evidence used for this comparison</h3><p><b>Explicitly listed skills:</b> {match.match.evidenceSummary.selfReportedSkills.map((item) => `${item.name} (${item.proficiency})`).join(", ") || "None listed"}</p><p><b>Project mentions (not counted as direct skill matches):</b> {match.match.evidenceSummary.projectMentions.join(", ") || "None"}</p><p><b>Experience mentions:</b> {match.match.evidenceSummary.experienceMentions.join(", ") || "None"}</p><p><b>Education:</b> {match.match.evidenceSummary.education.map(recordText).filter(Boolean).join(", ") || "None recorded in this profile"}</p><p><b>Certifications:</b> {match.match.evidenceSummary.certifications.map(recordText).filter(Boolean).join(", ") || "None recorded in this profile"}</p><p><b>Verified skills:</b> None returned by the existing TalentForge profile.</p></div></>}</section>}
  </main>;
>>>>>>> e90d20c27dbf2fa55b6969670916ec3e1c3a6e18
}

export default CareerAnalytics;
