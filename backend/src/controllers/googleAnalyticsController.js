import { extractGoogleJob } from "../extractors/googleJobExtractor.js";
import { matchGoogleRequirements } from "../matching/googleMatcher.js";
import { readRequirements, requirementsStatus, writeRequirementsAtomically } from "../services/requirementsStorage.js";
import { normalizeStudentProfile } from "../services/studentProfile.js";
import { discoverGoogleJobs } from "../extractors/googleCareersDiscovery.js";
import { readRequirementsForJobOrLegacy, writeJobRequirementsAtomically, listSavedJobStatuses } from "../services/requirementsStorage.js";
import { getGoogleJobId, validateGoogleJobId, validateGoogleJobUrl } from "../utils/googleJobUrl.js";

export async function getStatus(_req, res) {
  try {
    const data = await readRequirements();
    const savedJobs = await listSavedJobStatuses();
    return res.json({ backend: { available: true }, savedDataAvailable: savedJobs.length > 0, savedJobs, ...requirementsStatus(data), hasValidJobDescription: Boolean(data?.job?.title) });
  } catch { return res.status(500).json({ error: "Saved Google requirements could not be read." }); }
}

export async function discoverJobs(req, res, dependencies = {}) {
  try {
    const discover = dependencies.discover ?? discoverGoogleJobs;
    const savedStatuses = dependencies.savedStatuses ?? listSavedJobStatuses;
    const data = await discover({ location: typeof req.query?.location === "string" ? req.query.location : "", page: Number(req.query?.page || 1) });
    const savedById = new Map((await savedStatuses()).map((item) => [item.jobId, item]));
    return res.json({ sourceUrl: data.sourceUrl, location: data.location, page: data.page, nextPage: data.nextPage, discoveredAt: data.discoveredAt, jobs: data.jobs.map((job) => ({ ...job, savedData: savedById.get(job.jobId) ?? null })) });
  } catch (error) {
    const status = /filter must|Page must/i.test(error.message) ? 400 : 502;
    return res.status(status).json({ error: error.message || "Google Careers job discovery failed. No fallback listings were used." });
  }
}

export async function getJobById(req, res, dependencies = {}) {
  let jobId;
  let url;
  try {
    jobId = validateGoogleJobId(req.params?.jobId);
    url = validateGoogleJobUrl(req.query?.url);
    if (getGoogleJobId(url) !== jobId) return res.status(400).json({ error: "The Google Careers URL does not match the selected job ID." });
  } catch (error) { return res.status(400).json({ error: error.message }); }
  const read = dependencies.read ?? readRequirementsForJobOrLegacy;
  const write = dependencies.write ?? writeJobRequirementsAtomically;
  const extract = dependencies.extract ?? extractGoogleJob;
  let previous = null;
  try {
    previous = await read(jobId);
    const requirements = await extract(url.href);
    if (requirements.job.jobId !== jobId || requirements.sourceUrl !== url.href) throw new Error("Google Careers returned a different job than the selected listing.");
    await write(requirements);
    return res.json({ requirements, status: requirementsStatus(requirements), refreshError: null });
  } catch (error) {
    if (/different job|Google Careers URL|job ID is invalid|HTTPS links|must point directly|Redirect parameters/i.test(error.message)) return res.status(400).json({ error: error.message });
    const safeMessage = error.code
      ? "Google data could not be saved. The last successful extraction, if any, remains available."
      : error.message || "Google Careers could not refresh this job.";
    if (previous) return res.json({ requirements: previous, status: { ...requirementsStatus(previous), stale: true, extractionStatus: "stale" }, refreshError: safeMessage });
    return res.status(error.code ? 500 : 502).json({ error: safeMessage || "Google Careers could not extract this selected listing. No requirements were saved." });
  }
}

export async function matchJob(req, res, dependencies = {}) {
  let jobId;
  try { jobId = validateGoogleJobId(req.params?.jobId); }
  catch (error) { return res.status(400).json({ error: error.message }); }
  try {
    const read = dependencies.read ?? readRequirementsForJobOrLegacy;
    const requirements = await read(jobId);
    if (!requirements) return res.status(409).json({ error: "Select and successfully extract this Google Careers job before calculating a match." });
    const profile = normalizeStudentProfile(req.body?.profile, req.student.uid);
    const match = matchGoogleRequirements(requirements, profile);
    if (!match.available) return res.status(422).json({ error: match.error });
    return res.json({ studentUid: req.student.uid, requirementsStatus: requirementsStatus(requirements), sourceUrl: requirements.sourceUrl, job: requirements.job, match });
  } catch (error) {
    if (error.code === "PROFILE_UID_MISMATCH") return res.status(403).json({ error: error.message });
    if (/student profile is required/i.test(error.message)) return res.status(400).json({ error: error.message });
    return res.status(500).json({ error: "The match could not be calculated. Try again later." });
  }
}

export async function getRequirements(_req, res) {
  try {
    const data = await readRequirements();
    if (!data) return res.json({ available: false, requirements: null, status: requirementsStatus(null) });
    const status = requirementsStatus(data);
    return res.json({ available: true, requirements: { ...data, extractionStatus: status.extractionStatus }, status });
  } catch { return res.status(500).json({ error: "Saved Google requirements could not be read." }); }
}

export async function extractRequirements(req, res, dependencies = {}) {
  const extract = dependencies.extract ?? extractGoogleJob;
  const read = dependencies.read ?? readRequirements;
  const write = dependencies.write ?? writeRequirementsAtomically;
  const getStatus = dependencies.status ?? requirementsStatus;
  const url = req.body?.url;
  try {
    const previous = await read();
    const data = await extract(url);
    await write(data);
    return res.status(201).json({ success: true, requirements: data, status: getStatus(data), hadPreviousExtraction: Boolean(previous) });
  } catch (error) {
    const validation = /valid Google Careers|HTTPS links|must point directly|Redirect parameters|URL must/i.test(error.message);
    if (validation) return res.status(400).json({ error: error.message });
    const storageError = Boolean(error.code);
    const safeMessage = storageError
      ? "Google data was retrieved but could not be saved. The last successful extraction, if any, remains available."
      : error.message || "Google job extraction failed. The last successful extraction, if any, remains available.";
    return res.status(storageError ? 500 : 502).json({ error: safeMessage });
  }
}

export async function matchRequirements(req, res) {
  try {
    const requirements = await readRequirements();
    if (!requirements) return res.status(409).json({ error: "Extract a Google job description before calculating a match." });
    const profile = normalizeStudentProfile(req.body?.profile, req.student.uid);
    const match = matchGoogleRequirements(requirements, profile);
    if (!match.available) return res.status(422).json({ error: match.error });
    return res.json({ studentUid: req.student.uid, requirementsStatus: requirementsStatus(requirements), sourceUrl: requirements.sourceUrl, job: requirements.job, match });
  } catch (error) {
    if (error.code === "PROFILE_UID_MISMATCH") return res.status(403).json({ error: error.message });
    if (/student profile is required/i.test(error.message)) return res.status(400).json({ error: error.message });
    return res.status(500).json({ error: "The match could not be calculated. Try again later." });
  }
}
