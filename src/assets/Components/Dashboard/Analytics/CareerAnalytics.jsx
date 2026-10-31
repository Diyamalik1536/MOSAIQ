import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useUser } from "../../../../context/UserContext";
import { companiesDataset, datasetMetadata } from "./data/companies";
import { normalizeSkill, normalizeSkillList, proficiencyDescriptions, proficiencyLevels, skillTaxonomy } from "./data/skillTaxonomy";
import { analyzeRole } from "./utils/matchingEngine";
import { calculateProfileCompleteness, getStudentProfile } from "./utils/studentProfileAdapter";
import { readAnalytics, writeAnalytics } from "./utils/analyticsPersistence";
import "./analytics.css";

const sections = ["Overview", "Company Matches", "Skill Gap Analysis", "Career Roadmap", "Project Evidence", "Skill Demand"];
const levelNames = ["", "Beginner", "Intermediate", "Advanced", "Expert"];
const emptyAssessments = {};

function CareerAnalytics() {
  const { currentUser } = useUser();
  const uid = currentUser?.uid || currentUser?.id || currentUser?.email || "guest";
  return <CareerAnalyticsView key={uid} uid={uid} currentUser={currentUser} />;
}

function CareerAnalyticsView({ currentUser, uid }) {
  const [profile, setProfile] = useState(() => getStudentProfile(currentUser));
  const [saved, setSaved] = useState(() => readAnalytics(uid));
  const [section, setSection] = useState("Overview");
  const [selectedRoleId, setSelectedRoleId] = useState(() => readAnalytics(uid).selectedRoleId || "");
  const [companyQuery, setCompanyQuery] = useState("");
  const [industry, setIndustry] = useState("All industries");
  const [roleCategory, setRoleCategory] = useState("All roles");
  const [skillFilter, setSkillFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Importance");
  const [demandSkillId, setDemandSkillId] = useState("javascript");
  const [compareIds, setCompareIds] = useState(saved.compareIds || []);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    const refresh = () => setProfile(getStudentProfile(currentUser));
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("profileUpdated", refresh);
    return () => { window.removeEventListener("focus", refresh); window.removeEventListener("storage", refresh); window.removeEventListener("profileUpdated", refresh); };
  }, [currentUser, uid]);

  const assessments = saved.assessments ?? emptyAssessments;
  const selectedRole = useMemo(() => companiesDataset.flatMap((company) => company.roles).find((role) => role.id === selectedRoleId) || companiesDataset[0].roles[0], [selectedRoleId]);
  const selectedCompany = companiesDataset.find((company) => company.roles.some((role) => role.id === selectedRole.id));
  const analysis = analyzeRole(selectedRole, assessments);
  const profileSkills = normalizeSkillList(profile.skills);
  const completeness = calculateProfileCompleteness(profile);

  const persist = (next) => {
    const ok = writeAnalytics(uid, next);
    setSaved(next);
    setSaveError(!ok);
  };
  const selectRoleId = (roleId) => {
    setSelectedRoleId(roleId);
    persist({ ...saved, selectedRoleId: roleId });
  };
  const setAssessment = (skillId, value) => {
    const nextAssessments = { ...assessments };
    if (!value) delete nextAssessments[skillId];
    else nextAssessments[skillId] = Number(value);
    persist({ ...saved, assessments: nextAssessments, updatedAt: new Date().toISOString() });
  };
  const industries = ["All industries", ...new Set(companiesDataset.map((company) => company.industry))];
  const categories = ["All roles", ...new Set(companiesDataset.flatMap((company) => company.roles.map((role) => role.category)))];
  const visibleCompanies = companiesDataset.filter((company) => (industry === "All industries" || company.industry === industry) && `${company.name} ${company.roles.map((role) => role.title).join(" ")}`.toLowerCase().includes(companyQuery.toLowerCase()) && (roleCategory === "All roles" || company.roles.some((role) => role.category === roleCategory)));
  const rankedRoles = companiesDataset.flatMap((company) => company.roles.map((role) => ({ company, role, result: analyzeRole(role, assessments) }))).sort((a, b) => (b.result.overall ?? -1) - (a.result.overall ?? -1));
  const bestMatch = rankedRoles.find((item) => item.result.overall !== null);
  const hasProfileAssessment = profileSkills.some((skill) => assessments[skill.id]);
  const readiness = profileSkills.length && hasProfileAssessment ? bestMatch?.result.overall ?? null : null;
  const readinessLabel = readiness === null ? "Not enough data" : readiness < 40 ? "Needs Improvement" : readiness < 60 ? "Developing" : readiness < 80 ? "Good Progress" : "Strong Match";
  const totalRequirements = selectedRole.requirements;
  const filteredRequirements = totalRequirements.filter((item) => skillFilter === "All" || item.type === skillFilter || analysis.requirements.find((row) => row.skillId === item.skillId)?.status === skillFilter).sort((a, b) => sortBy === "Importance" ? b.weight - a.weight : sortBy === "Skill name" ? normalizeSkill(a.skillId).name.localeCompare(normalizeSkill(b.skillId).name) : (analysis.requirements.find((row) => row.skillId === b.skillId)?.ratio ?? 0) - (analysis.requirements.find((row) => row.skillId === a.skillId)?.ratio ?? 0));
  const demand = useMemo(() => {
    const counts = new Map();
    companiesDataset.flatMap((company) => company.roles).forEach((role) => role.requirements.forEach((requirement) => {
      const current = counts.get(requirement.skillId) || { skillId: requirement.skillId, total: 0, must: 0, preferred: 0, roles: new Set() };
      current.total += 1; current.roles.add(role.id); current[requirement.type === "must-have" ? "must" : "preferred"] += 1; counts.set(requirement.skillId, current);
    }));
    return [...counts.values()].map((item) => ({ ...item, roles: item.roles.size, name: normalizeSkill(item.skillId).name })).sort((a, b) => b.total - a.total).slice(0, 12);
  }, []);
  const selectedSkill = normalizeSkill(demandSkillId);
  const industryDemand = [...new Set(companiesDataset.map((company) => company.industry))].map((name) => ({ name, count: companiesDataset.filter((company) => company.industry === name).flatMap((company) => company.roles).filter((role) => role.requirements.some((item) => item.skillId === demandSkillId)).length })).sort((a, b) => b.count - a.count);
  const roleDemand = [...new Set(rankedRoles.map(({ role }) => role.category))].map((name) => ({ name, count: rankedRoles.filter(({ role }) => role.category === name && role.requirements.some((item) => item.skillId === demandSkillId)).length })).sort((a, b) => b.count - a.count);
  const roadmap = useMemo(() => selectedRole.requirements
    .map((requirement) => ({ requirement, level: assessments[requirement.skillId] ?? null }))
    .filter(({ requirement, level }) => level === null || level < requirement.requiredLevel)
    .sort((a, b) => b.requirement.weight * (1 + (b.requirement.requiredLevel - (b.level || 0))) - a.requirement.weight * (1 + (a.requirement.requiredLevel - (a.level || 0))))
    .map(({ requirement, level }, index) => ({ id: `${selectedRole.id}-${requirement.skillId}`, skillId: requirement.skillId, title: level === null ? `Build a foundation in ${normalizeSkill(requirement.skillId).name}` : `Strengthen ${normalizeSkill(requirement.skillId).name}`, description: `Work toward ${levelNames[requirement.requiredLevel]} proficiency for the ${selectedRole.title} role. Start with a focused tutorial, then apply the concept in a small project.`, priority: index < 2 ? "High" : index < 4 ? "Medium" : "Later", duration: level === null ? "2–4 weeks" : "1–2 weeks", resource: `https://www.google.com/search?q=${encodeURIComponent(`${normalizeSkill(requirement.skillId).name} official documentation tutorial`)}`, status: saved.roadmap?.[`${selectedRole.id}-${requirement.skillId}`] || "Not Started" })), [selectedRole, assessments, saved.roadmap]);
  const toggledCompare = (roleId) => {
    const next = compareIds.includes(roleId) ? compareIds.filter((id) => id !== roleId) : compareIds.length < 3 ? [...compareIds, roleId] : compareIds;
    setCompareIds(next); persist({ ...saved, compareIds: next });
  };
  const selectedComparisons = rankedRoles.filter(({ role }) => compareIds.includes(role.id));

  const chooseRole = (roleId) => { selectRoleId(roleId); setSection("Skill Gap Analysis"); };
  const viewRole = (roleId) => { selectRoleId(roleId); setSection("Company Matches"); };
  const updateTask = (taskId, status) => persist({ ...saved, roadmap: { ...saved.roadmap, [taskId]: status } });

  return <div className="career-analytics">
    <header className="ca-header"><div><div className="ca-eyebrow">CAREER INTELLIGENCE</div><h1>Career Analytics</h1><p>Your personal career intelligence dashboard. Discover your strengths, understand skill gaps and prepare for your next opportunity.</p></div><div className="ca-user"><div className="ca-avatar">{profile.name.slice(0, 1).toUpperCase()}</div><div><strong>{profile.name}</strong><span>{profile.university || "Complete your profile"}</span><small>{saved.updatedAt ? `Updated ${new Date(saved.updatedAt).toLocaleDateString()}` : "Your private workspace"}</small></div></div></header>
    <nav className="ca-tabs" aria-label="Career analytics sections">{sections.map((item) => <button key={item} className={section === item ? "active" : ""} onClick={() => setSection(item)}>{item}</button>)}</nav>
    {saveError && <div className="ca-alert" role="alert">Your changes could not be saved in this browser. Check available storage and try again.</div>}
    <div className="ca-sample-note"><span>i</span><div><strong>{datasetMetadata.label}</strong><small>Unverified illustrative data · Reviewed {datasetMetadata.lastReviewed} · Not an official hiring criteria or live vacancy feed.</small></div></div>

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

    {section === "Company Matches" && <><div className="ca-section-title"><div><span>ROLE EXPLORER</span><h2>Find your strongest alignment</h2><p>Every score is recalculated from your self-assessed skills and the bundled sample role requirements.</p></div><span className="ca-compare-count">Compare up to 3 · {compareIds.length}/3 selected</span></div><div className="ca-filters"><label>Search companies or roles<input value={companyQuery} onChange={(event) => setCompanyQuery(event.target.value)} placeholder="e.g. Google, Frontend" /></label><label>Industry<select value={industry} onChange={(event) => setIndustry(event.target.value)}>{industries.map((item) => <option key={item}>{item}</option>)}</select></label><label>Role category<select value={roleCategory} onChange={(event) => setRoleCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label></div><div className="ca-company-grid">{visibleCompanies.map((company) => <article className="ca-company-card" key={company.id}><div className="ca-company-head"><span className="ca-company-mark">{company.name.slice(0, 1)}</span><div><h3>{company.name}</h3><small>{company.industry}</small></div><a href={company.website} target="_blank" rel="noreferrer" aria-label={`Visit ${company.name} careers site`}>↗</a></div><p>{company.description}</p><div className="ca-role-list">{company.roles.filter((role) => roleCategory === "All roles" || role.category === roleCategory).map((role) => { const result = analyzeRole(role, assessments); return <div className="ca-role-card" key={role.id}><button className="ca-role-select" onClick={() => chooseRole(role.id)}><strong>{role.title}</strong><span>{result.overall === null ? "Assess skills" : `${Math.round(result.overall)}% match`}</span></button><small>{result.missingSkills.length} missing · {result.improvementSkills.length} to improve</small><button className={`ca-compare ${compareIds.includes(role.id) ? "selected" : ""}`} onClick={() => toggledCompare(role.id)}>{compareIds.includes(role.id) ? "✓ Added" : "＋ Compare"}</button><button className="ca-detail-link" onClick={() => viewRole(role.id)}>View skill breakdown</button></div>; })}</div></article>)}</div>{visibleCompanies.length === 0 && <div className="ca-empty">No companies or roles match those filters.</div>}
      {selectedComparisons.length > 0 && <section className="ca-card ca-comparison"><div className="ca-card-heading"><div><span>ROLE COMPARISON</span><h3>Compare your selected roles</h3></div></div><div className="ca-comparison-grid">{selectedComparisons.map(({ company, role, result }) => <article key={role.id}><small>{company.name}</small><h4>{role.title}</h4><strong>{result.overall === null ? "—" : `${result.overall}%`}</strong><span>Overall match</span><p>Must-have {result.mustScore ?? "—"}% · Preferred {result.preferredScore ?? "—"}%</p><p><b>Matched:</b> {result.matchedSkills.map((id) => normalizeSkill(id).name).join(", ") || "None"}</p><p><b>Missing:</b> {result.missingSkills.map((id) => normalizeSkill(id).name).join(", ") || "None"}</p><p><b>Improve:</b> {result.improvementSkills.map((id) => normalizeSkill(id).name).join(", ") || "None"}</p><button className="ca-link" onClick={() => chooseRole(role.id)}>Open gaps</button></article>)}</div><p className="ca-muted">Scores reflect weighted proficiency alignment. Missing or unassessed skills receive zero credit.</p></section>}</>}

    {section === "Skill Gap Analysis" && <><div className="ca-section-title"><div><span>PERSONALIZED SKILL GAP</span><h2>See what each role requires</h2><p>Self-assessments affect your match immediately. They are not independently verified.</p></div></div><div className="ca-card ca-role-picker"><label>Selected role<select value={selectedRole.id} onChange={(event) => selectRoleId(event.target.value)}>{rankedRoles.map(({ company, role }) => <option value={role.id} key={role.id}>{company.name} — {role.title}</option>)}</select></label><div className="ca-score-pills"><span>Overall <b>{analysis.overall ?? "—"}%</b></span><span>Must-have <b>{analysis.mustScore ?? "—"}%</b></span><span>Preferred <b>{analysis.preferredScore ?? "—"}%</b></span></div></div><section className="ca-card"><div className="ca-card-heading"><div><span>{selectedCompany.name.toUpperCase()}</span><h3>{selectedRole.title}</h3></div><span className="ca-role-reason">Weighted score: matched proficiency points ÷ total requirement weight</span></div><div className="ca-filters ca-compact-filters"><label>Show<select value={skillFilter} onChange={(event) => setSkillFilter(event.target.value)}>{["All", "Matched", "Exceeds Requirement", "Needs Improvement", "Missing", "must-have", "preferred"].map((item) => <option key={item}>{item}</option>)}</select></label><label>Sort by<select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>{["Importance", "Skill name", "Gap severity"].map((item) => <option key={item}>{item}</option>)}</select></label></div><div className="ca-skill-table"><div className="ca-table-head"><span>Skill / Weight</span><span>Your level</span><span>Required</span><span>Type</span><span>Status</span></div>{filteredRequirements.map((requirement) => { const row = analysis.requirements.find((item) => item.skillId === requirement.skillId); return <div className="ca-table-row" key={requirement.skillId}><span><strong>{normalizeSkill(requirement.skillId).name}</strong><small>Importance weight {requirement.weight}</small></span><label><span className="ca-sr-only">Assess {normalizeSkill(requirement.skillId).name}</span><select value={assessments[requirement.skillId] || ""} onChange={(event) => setAssessment(requirement.skillId, event.target.value)}><option value="">Unassessed</option>{proficiencyLevels.map((level, index) => <option key={level} value={index + 1}>{level}</option>)}</select><small>{assessments[requirement.skillId] ? "Self-assessed" : "Assess your level"}</small></label><span>{levelNames[requirement.requiredLevel]}</span><span><i className={`ca-type-dot ${requirement.type}`} />{requirement.type}</span><span className={`ca-status ${row.status.toLowerCase().replaceAll(" ", "-")}`}>{row.status}</span></div>; })}</div><p className="ca-muted ca-assessment-help">{Object.entries(proficiencyDescriptions).map(([level, description]) => `${level}: ${description}`).join(" ")} Assessments are self-reported. Existing projects do not automatically grant proficiency.</p></section></>}

    {section === "Career Roadmap" && <><div className="ca-section-title"><div><span>YOUR NEXT STEPS</span><h2>A practical roadmap for {selectedRole.title}</h2><p>Prioritized from actual missing and below-target skills. Completing a task never changes your proficiency assessment.</p></div><label className="ca-inline-select">Role<select value={selectedRole.id} onChange={(event) => selectRoleId(event.target.value)}>{rankedRoles.map(({ company, role }) => <option value={role.id} key={role.id}>{company.name} — {role.title}</option>)}</select></label></div>{roadmap.length ? <div className="ca-roadmap">{roadmap.map((task, index) => <article className="ca-roadmap-card" key={task.id}><span className="ca-roadmap-number">{String(index + 1).padStart(2, "0")}</span><div className="ca-roadmap-content"><div><span className={`ca-priority ${task.priority.toLowerCase()}`}>{task.priority} priority</span><span className="ca-task-skill">{normalizeSkill(task.skillId).name}</span></div><h3>{task.title}</h3><p>{task.description}</p><div className="ca-roadmap-meta"><span>◷ {task.duration}</span><a href={task.resource} target="_blank" rel="noreferrer">Learning resources ↗</a></div></div><label>Status<select value={task.status} onChange={(event) => updateTask(task.id, event.target.value)}>{["Not Started", "In Progress", "Completed"].map((status) => <option key={status}>{status}</option>)}</select></label></article>)}</div> : <div className="ca-empty"><strong>No gaps for this role based on your current assessment.</strong><p>Reassess your skills when you have new evidence; tasks do not update proficiency automatically.</p></div>}</>}

    {section === "Project Evidence" && <><div className="ca-section-title"><div><span>LEARNING THROUGH BUILDING</span><h2>Your project evidence</h2><p>Projects are read from your MOSAIQ profile and are treated as self-reported, not verified.</p></div></div>{profile.projects.length ? <div className="ca-project-grid">{profile.projects.map((project, index) => { const detected = normalizeSkillList([...(project.technologies || []), project.stack]).map((skill) => skill.id); const key = project.id || project.title || `project-${index}`; const associated = saved.evidence?.[key] || detected; return <article className="ca-card ca-project-card" key={key}><div className="ca-project-top"><span className="ca-company-mark">⌘</span><span className="ca-evidence-state">Self-reported evidence</span></div><h3>{project.title || "Untitled project"}</h3><p>{project.description || "No project description provided."}</p><label>Associate skills<div className="ca-check-list">{skillTaxonomy.map((skill) => <label key={skill.id}><input type="checkbox" checked={associated.includes(skill.id)} onChange={(event) => { const next = event.target.checked ? [...associated, skill.id] : associated.filter((id) => id !== skill.id); persist({ ...saved, evidence: { ...saved.evidence, [key]: next } }); }} />{skill.name}</label>)}</div></label><div className="ca-chips">{associated.map((id) => <span key={id}>{normalizeSkill(id)?.name || id}</span>)}</div><div className="ca-project-links">{project.link || project.repositoryUrl || project.githubUrl ? <a href={project.link || project.repositoryUrl || project.githubUrl} target="_blank" rel="noreferrer">Project link ↗</a> : <span>No project link</span>}{project.liveUrl || project.deploymentUrl ? <a href={project.liveUrl || project.deploymentUrl} target="_blank" rel="noreferrer">Live project ↗</a> : <span>No live URL</span>}</div></article>; })}</div> : <div className="ca-empty"><strong>Add your projects to demonstrate your practical experience.</strong><p>Projects added to your MOSAIQ profile will appear here.</p></div>}</>}

    {section === "Skill Demand" && <><div className="ca-section-title"><div><span>DATASET EXPLORER</span><h2>Skill demand insights</h2><p>Insights from MOSAIQ’s sample company requirements dataset. These are not live hiring statistics or current market demand.</p></div></div><section className="ca-card ca-demand-card"><div className="ca-card-heading"><div><span>{companiesDataset.length} COMPANIES · {rankedRoles.length} ROLE PROFILES</span><h3>Most frequently listed skills</h3></div></div><div className="ca-demand-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={demand} layout="vertical" margin={{ left: 8, right: 24, top: 5, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" allowDecimals={false} /><YAxis type="category" dataKey="name" width={155} tick={{ fontSize: 12 }} /><Tooltip formatter={(value, name) => [value, name === "total" ? "Role profiles" : name]} /><Bar dataKey="total" name="Role profiles" fill="var(--ca-accent)" radius={[0, 5, 5, 0]} /></BarChart></ResponsiveContainer></div><div className="ca-demand-list">{demand.map((item) => <div key={item.skillId}><strong>{item.name}</strong><span>{item.total} requirements</span><span>{item.roles} roles</span><span>{item.must} must-have</span><span>{item.preferred} preferred</span></div>)}</div><div className="ca-demand-breakdown"><label>Inspect skill by industry and role<select value={demandSkillId} onChange={(event) => setDemandSkillId(event.target.value)}>{skillTaxonomy.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}</select></label><div><strong>{selectedSkill.name} by industry</strong>{industryDemand.map((item) => <span key={item.name}>{item.name}<b>{item.count} roles</b></span>)}</div><div><strong>{selectedSkill.name} by role category</strong>{roleDemand.map((item) => <span key={item.name}>{item.name}<b>{item.count} roles</b></span>)}</div></div></section><section className="ca-card ca-data-disclosure"><strong>About this dataset</strong><p>{datasetMetadata.sourceDescription} Dataset type: {datasetMetadata.type}. Verification status: {datasetMetadata.verificationStatus}. Last reviewed: {datasetMetadata.lastReviewed}. Company websites link to their careers pages; no active vacancy is asserted here.</p></section></>}
  </div>;
}

export default CareerAnalytics;
