import { auth } from "../../../../../config/firebase";

const API_BASE = (import.meta.env.VITE_ANALYTICS_API_URL || "http://localhost:4000").replace(/\/$/, "");

async function apiRequest(path, { method = "GET", body, authenticated = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (authenticated) {
    const user = auth.currentUser;
    if (!user) throw new Error("Sign in with your Firebase account to use Google matching.");
    headers.Authorization = `Bearer ${await user.getIdToken()}`;
  }
  let response;
  try { response = await fetch(`${API_BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined }); }
  catch { throw new Error("The Google Analytics backend could not be reached. Start the backend service and try again."); }
  let result;
  try { result = await response.json(); } catch { throw new Error("The Analytics service returned an invalid response."); }
  if (!response.ok) throw new Error(result.error || "The Analytics request failed.");
  return result;
}

export const getGoogleRequirements = () => apiRequest("/api/analytics/google/requirements");
export const getGoogleStatus = () => apiRequest("/api/analytics/google/status");
export const getGoogleJobs = (location = "", page = 1) => {
  const query = new URLSearchParams();
  if (location.trim()) query.set("location", location.trim());
  if (page > 1) query.set("page", String(page));
  return apiRequest(`/api/analytics/google/jobs${query.size ? `?${query}` : ""}`);
};
export const getGoogleJob = (job) => apiRequest(`/api/analytics/google/jobs/${encodeURIComponent(job.jobId)}?url=${encodeURIComponent(job.officialUrl)}`, { authenticated: true });
export const matchGoogleJob = (jobId, profile) => apiRequest(`/api/analytics/google/jobs/${encodeURIComponent(jobId)}/match`, { method: "POST", body: { profile }, authenticated: true });
export const extractGoogleRequirements = (url) => apiRequest("/api/analytics/google/extract", { method: "POST", body: { url }, authenticated: true });
export const matchGoogleProfile = (profile) => apiRequest("/api/analytics/google/match", { method: "POST", body: { profile }, authenticated: true });
