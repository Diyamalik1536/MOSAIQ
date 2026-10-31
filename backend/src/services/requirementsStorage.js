import { mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { validateRequirements } from "../utils/requirementsValidator.js";
import { validateGoogleJobId } from "../utils/googleJobUrl.js";

const here = path.dirname(fileURLToPath(import.meta.url));
export const defaultDataDirectory = path.resolve(here, "../../data");
export const jsonFilePath = (directory = defaultDataDirectory) => path.join(directory, "google_requirements.json");
export const textFilePath = (directory = defaultDataDirectory) => path.join(directory, "google_requirements.txt");
export const jobRequirementsDirectory = (jobId, root = defaultDataDirectory) => path.join(root, "google_jobs", validateGoogleJobId(jobId));

export async function readRequirementsForJob(jobId, root = defaultDataDirectory) {
  const directory = jobRequirementsDirectory(jobId, root);
  return readRequirements(directory);
}

export async function readRequirementsForJobOrLegacy(jobId, root = defaultDataDirectory) {
  const saved = await readRequirementsForJob(jobId, root);
  if (saved) return saved;
  const legacy = await readRequirements(root);
  return legacy?.job?.jobId === jobId ? legacy : null;
}

export async function writeJobRequirementsAtomically(data, root = defaultDataDirectory) {
  const jobId = validateGoogleJobId(data?.job?.jobId);
  if (!validateRequirements(data)) throw new Error("Refusing to save invalid Google requirements data.");
  return writeRequirementsAtomically(data, jobRequirementsDirectory(jobId, root));
}

export async function listSavedJobStatuses(root = defaultDataDirectory) {
  const saved = new Map();
  try {
    const entries = await readdir(path.join(root, "google_jobs"), { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || !/^\d{1,25}$/.test(entry.name)) continue;
      try {
        const data = await readRequirements(path.join(root, "google_jobs", entry.name));
        if (data) saved.set(entry.name, requirementsStatus(data));
      } catch { /* An invalid saved record is not exposed as available. */ }
    }
  } catch (error) { if (error.code !== "ENOENT") throw error; }
  const legacy = await readRequirements(root);
  if (legacy?.job?.jobId && !saved.has(legacy.job.jobId)) saved.set(legacy.job.jobId, requirementsStatus(legacy));
  return [...saved.entries()].map(([jobId, status]) => ({ jobId, ...status }));
}

export function toHumanReadableText(data) {
  const bulletLines = (items) => items.length ? items.map((item) => `- ${item}`).join("\n") : "- Not listed on the source page";
  const skillLines = (items) => items.length ? items.flatMap((item) => item.evidenceSnippets.map((snippet) => `- ${item.normalizedName} | Original wording: ${snippet} | Category: ${item.requirementCategory} | Proficiency: unspecified | Source: ${item.sourceUrl}`)).join("\n") : "- No directly extracted technical skills";
  return ["Google Careers job requirements (source extraction)", `Company: ${data.company.name}`, `Job title: ${data.job.title}`, `Job ID: ${data.job.jobId ?? "Not available"}`, `Location: ${data.job.location ?? "Not available"}`, `Official source URL: ${data.sourceUrl}`, `Extraction timestamp: ${data.extractedAt}`, `Last verification timestamp: ${data.lastVerifiedAt}`, `Data status: ${data.extractionStatus}; ${data.verificationStatus}`, "", "Original job description:", data.job.description || "Not separately identified on the page.", "", "Minimum qualifications:", bulletLines(data.qualifications.minimum), "", "Preferred qualifications:", bulletLines(data.qualifications.preferred), "", "Responsibilities:", bulletLines(data.responsibilities), "", "Extracted required skills:", skillLines(data.requiredSkills), "", "Extracted preferred skills:", skillLines(data.preferredSkills), ""].join("\n");
}

export async function readRequirements(directory = defaultDataDirectory) {
  try {
    const data = JSON.parse(await readFile(jsonFilePath(directory), "utf8"));
    if (!validateRequirements(data)) throw new Error("Saved Google requirements data failed validation.");
    return data;
  } catch (error) { if (error.code === "ENOENT") return null; throw error; }
}

export async function writeRequirementsAtomically(data, directory = defaultDataDirectory) {
  if (!validateRequirements(data)) throw new Error("Refusing to save invalid Google requirements data.");
  await mkdir(directory, { recursive: true });
  const id = `${process.pid}-${Date.now()}`; const json = jsonFilePath(directory); const txt = textFilePath(directory);
  const jsonTemp = `${json}.${id}.tmp`; const txtTemp = `${txt}.${id}.tmp`; const jsonBackup = `${json}.${id}.bak`; const txtBackup = `${txt}.${id}.bak`;
  const existedJson = await readFile(json).then(() => true, () => false); const existedTxt = await readFile(txt).then(() => true, () => false);
  let jsonBackedUp = false; let txtBackedUp = false; let jsonInstalled = false; let txtInstalled = false;
  try {
    await Promise.all([writeFile(jsonTemp, `${JSON.stringify(data, null, 2)}\n`, { encoding: "utf8", flag: "wx" }), writeFile(txtTemp, toHumanReadableText(data), { encoding: "utf8", flag: "wx" })]);
    if (existedJson) { await rename(json, jsonBackup); jsonBackedUp = true; }
    if (existedTxt) { await rename(txt, txtBackup); txtBackedUp = true; }
    await rename(jsonTemp, json); jsonInstalled = true;
    await rename(txtTemp, txt); txtInstalled = true;
  } catch (error) {
    if (jsonInstalled) await rm(json, { force: true }); if (txtInstalled) await rm(txt, { force: true });
    if (jsonBackedUp) await rename(jsonBackup, json).catch(() => {}); if (txtBackedUp) await rename(txtBackup, txt).catch(() => {});
    await Promise.all([rm(jsonTemp, { force: true }), rm(txtTemp, { force: true })]);
    throw error;
  }
  await Promise.all([rm(jsonBackup, { force: true }).catch(() => {}), rm(txtBackup, { force: true }).catch(() => {})]);
  return { jsonPath: json, textPath: txt };
}

export function requirementsStatus(data, now = Date.now(), ttlDays = Number(process.env.GOOGLE_REQUIREMENTS_TTL_DAYS || 7)) {
  if (!data) return { available: false, extractedAt: null, lastVerifiedAt: null, stale: true, extractionStatus: "not-extracted" };
  const ageMs = now - Date.parse(data.lastVerifiedAt || data.extractedAt); const stale = !Number.isFinite(ageMs) || ageMs > ttlDays * 86400000;
  return { available: true, extractedAt: data.extractedAt, lastVerifiedAt: data.lastVerifiedAt, stale, extractionStatus: stale ? "stale" : data.extractionStatus, sourceUrl: data.sourceUrl, jobTitle: data.job.title, jobId: data.job.jobId };
}
