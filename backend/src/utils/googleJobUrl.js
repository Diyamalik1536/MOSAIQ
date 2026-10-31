const HOSTS = new Set(["www.google.com"]);
const GOOGLE_PATHS = [/^\/about\/careers\/applications\/jobs\/results\/\d+(?:-[a-z0-9-]+)?\/?$/i];

export function validateGoogleJobUrl(input) {
  if (typeof input !== "string" || input.length > 2048) throw new Error("Enter a valid Google Careers job URL.");
  let url;
  try { url = new URL(input); } catch { throw new Error("Enter a valid Google Careers job URL."); }
  if (url.protocol !== "https:" || !HOSTS.has(url.hostname.toLowerCase()) || url.port) throw new Error("Only HTTPS links on the approved Google Careers hosts are allowed.");
  if (url.username || url.password || !GOOGLE_PATHS.some((pattern) => pattern.test(url.pathname))) throw new Error("The URL must point directly to a Google Careers job description.");
  if ([...url.searchParams.keys()].some((key) => /redirect|return|next|continue|url|target/i.test(key))) throw new Error("Redirect parameters are not allowed in a job URL.");
  url.hash = "";
  return url;
}

export function getGoogleJobId(url) {
  return url.pathname.match(/jobs\/results\/(\d+)/i)?.[1] ?? null;
}

export function validateGoogleJobId(input) {
  if (typeof input !== "string" || !/^\d{1,25}$/.test(input)) throw new Error("The Google Careers job ID is invalid.");
  return input;
}
