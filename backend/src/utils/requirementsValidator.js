import { validateGoogleJobUrl } from "./googleJobUrl.js";

export function validateRequirements(data) {
  if (!data || data.company?.name !== "Google" || typeof data.sourceUrl !== "string") return false;
  try { validateGoogleJobUrl(data.sourceUrl); } catch { return false; }
  if (!data.job || typeof data.job.title !== "string" || !data.job.title.trim() || data.job.title.toLowerCase() === "job details") return false;
  if (!Array.isArray(data.qualifications?.minimum) || !Array.isArray(data.qualifications?.preferred)) return false;
  for (const key of ["requiredSkills", "preferredSkills"]) {
    if (!Array.isArray(data[key])) return false;
    for (const skill of data[key]) if (!skill.normalizedName || !skill.originalWording?.length || !skill.evidenceSnippets?.length || skill.sourceUrl !== data.sourceUrl) return false;
  }
  return ["successful", "stale"].includes(data.extractionStatus) && ["unverified", "source-verified"].includes(data.verificationStatus);
}
