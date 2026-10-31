import { extractSkills, normalizeSkill } from "../utils/skillTaxonomy.js";

function normalizedEntries(entries) {
  const result = new Map();
  for (const value of Array.isArray(entries) ? entries : []) {
    const raw = typeof value === "string" ? value : value?.name ?? value?.normalizedName ?? value?.skill ?? value?.skillId ?? "";
    const canonical = normalizeSkill(raw);
    if (canonical && !result.has(canonical.id)) result.set(canonical.id, { ...(typeof value === "object" ? value : {}), ...canonical, raw: typeof value === "object" ? value.raw : raw, proficiency: typeof value === "object" ? value.proficiency ?? null : null });
  }
  return result;
}

export function matchGoogleRequirements(requirements, studentProfile) {
  if (!studentProfile || typeof studentProfile !== "object") return { available: false, percentage: null, matchedCount: 0, totalRequired: 0, error: "Student profile is unavailable." };
  const required = normalizedEntries(requirements?.requiredSkills ?? []);
  const preferred = normalizedEntries(requirements?.preferredSkills ?? []);
  if (!required.size) return { available: true, percentage: null, matchedCount: 0, totalRequired: 0, error: "Matching percentage cannot be calculated because no valid required skills were extracted.", required: [], preferred: [] };
  const directSkills = normalizedEntries(studentProfile.skills);
  const projectSkills = normalizedEntries((studentProfile.projects ?? []).flatMap((item) => [
    ...(item.technologies ?? []), ...extractSkills(item.description ?? "").map((skill) => skill.name),
  ]));
  const experienceSkills = normalizedEntries((studentProfile.experience ?? []).flatMap((item) => [
    ...(item.skills ?? []), ...extractSkills(item.description ?? "").map((skill) => skill.name),
  ]));
  const classify = (skill) => {
    const direct = directSkills.get(skill.id); const project = projectSkills.get(skill.id); const experience = experienceSkills.get(skill.id);
    if (direct) return { ...skill, status: "matched", matched: true, evidenceType: "self-reported profile skill", proficiency: direct.proficiency ?? "unassessed", reason: "Explicitly listed in the MOSAIQ profile. Proficiency is not independently verified." };
    if (project || experience) return { ...skill, status: "insufficient-evidence", matched: false, evidenceType: project && experience ? "project and experience mention" : project ? "project technology mention" : "experience mention", proficiency: "unassessed", reason: "Mentioned in project or experience data, but not listed as a profile skill." };
    return { ...skill, status: "missing", matched: false, evidenceType: null, proficiency: "unassessed", reason: "Not found in profile skills, project technologies, or experience." };
  };
  const requiredResults = [...required.values()].map(classify); const preferredResults = [...preferred.values()].map(classify);
  const matchedCount = requiredResults.filter((item) => item.matched).length;
  return {
    available: true, percentage: Number((matchedCount / requiredResults.length * 100).toFixed(2)), matchedCount,
    totalRequired: requiredResults.length, required: requiredResults, preferred: preferredResults,
    scoringPolicy: "Matched distinct required profile skills divided by total distinct required skills, multiplied by 100. Project and experience mentions are disclosed as supporting evidence and do not count as a direct profile match. No proficiency, weights, or employer eligibility decision is inferred.",
    evidenceSummary: {
      selfReportedSkills: [...directSkills.values()].map(({ name, proficiency }) => ({ name, proficiency: proficiency ?? "unassessed" })),
      projectMentions: [...projectSkills.values()].map(({ name }) => name),
      experienceMentions: [...experienceSkills.values()].map(({ name }) => name), verifiedSkills: [],
      education: studentProfile.education ?? [],
      certifications: studentProfile.certifications ?? [],
    },
  };
}
