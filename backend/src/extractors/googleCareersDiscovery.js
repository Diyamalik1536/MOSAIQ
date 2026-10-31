import * as cheerio from "cheerio";
import { Buffer } from "node:buffer";
import { validateGoogleJobId, validateGoogleJobUrl } from "../utils/googleJobUrl.js";

const CAREERS_ORIGIN = "https://www.google.com";
const SEARCH_PATH = "/about/careers/applications/jobs/results/";
const REQUEST_TIMEOUT_MS = 15000;
const MAX_HTML_BYTES = 5_000_000;
const MAX_REDIRECTS = 4;
const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

function searchUrl(location, page) {
  const url = new URL(SEARCH_PATH, CAREERS_ORIGIN);
  url.searchParams.set("q", "software engineer");
  if (location) url.searchParams.set("location", location);
  if (page > 1) url.searchParams.set("page", String(page));
  return url;
}

function validateSearchUrl(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.hostname !== "www.google.com" || url.port || url.username || url.password || !url.pathname.startsWith("/about/careers/")) {
    throw new Error("Google Careers returned a redirect outside its official Careers pages.");
  }
  return url;
}

async function fetchSearchPage(inputUrl, fetchImpl) {
  let url = validateSearchUrl(inputUrl);
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    const response = await fetchImpl(url, {
      redirect: "manual", signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { "User-Agent": "TalentForgeCareerAnalytics/1.0 (+official Google Careers job discovery)", Accept: "text/html,application/xhtml+xml" },
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      if (redirects === MAX_REDIRECTS) throw new Error("Google Careers redirected too many times.");
      const target = response.headers.get("location");
      if (!target) throw new Error("Google Careers returned an invalid redirect.");
      url = validateSearchUrl(new URL(target, url).href);
      continue;
    }
    if (!response.ok) throw new Error(response.status === 403 || response.status === 429 ? "Google Careers blocked automated job discovery. Try again later or open Google Careers in your browser." : `Google Careers returned HTTP ${response.status} while searching jobs.`);
    if (!(response.headers.get("content-type") ?? "").includes("text/html")) throw new Error("Google Careers did not return an HTML search page.");
    const declaredLength = Number(response.headers.get("content-length"));
    if (declaredLength > MAX_HTML_BYTES) throw new Error("The Google Careers search response is larger than the allowed size.");
    const html = await response.text();
    if (Buffer.byteLength(html) > MAX_HTML_BYTES) throw new Error("The Google Careers search response is larger than the allowed size.");
    return { html, finalUrl: url.href };
  }
  throw new Error("Unable to retrieve Google Careers job listings.");
}

function resultCard($, anchor) {
  const knownCard = anchor.closest(".sMn82b");
  if (knownCard.length) return knownCard;
  let node = anchor;
  for (let depth = 0; depth < 8 && node.length; depth += 1, node = node.parent()) {
    if (node.find("h3").length) return node;
  }
  return $();
}

export function parseGoogleJobListings(html, searchPageUrl, fetchedAt = new Date().toISOString()) {
  const $ = cheerio.load(html);
  const pageText = clean($("body").text());
  if (/unusual traffic|captcha|robot check|access denied|verify you are human/i.test(pageText)) {
    throw new Error("Google Careers blocked automated job discovery (CAPTCHA or anti-bot response). Open Google Careers in a browser; discovery will not bypass that restriction.");
  }
  validateSearchUrl(searchPageUrl);
  const jobs = new Map();
  $("a[href]").each((_, element) => {
    const href = $(element).attr("href") || "";
    if (!/jobs\/results\/\d+/i.test(href)) return;
    let officialUrl;
    try {
      officialUrl = validateGoogleJobUrl(new URL(href, `${CAREERS_ORIGIN}/about/careers/applications/`).href);
    } catch { return; }
    const jobId = validateGoogleJobId(officialUrl.pathname.match(/jobs\/results\/(\d+)/i)?.[1]);
    const card = resultCard($, $(element));
    const title = clean(card.find("h3").first().text());
    if (!title || !/software engineer/i.test(title) || jobs.has(jobId)) return;
    const location = clean(card.find(".r0wTof").first().text()) || null;
    const experienceLabel = clean(card.find("[aria-label*='experience filters']").first().attr("aria-label")).split(",")[0]
      || clean(card.find(".wVSTAb").first().text()) || null;
    const preview = clean(card.find(".Xsxa1e li").first().text()) || null;
    officialUrl.search = "";
    officialUrl.hash = "";
    jobs.set(jobId, {
      title, jobId, location, experienceLevel: experienceLabel,
      shortDescription: preview, shortDescriptionType: preview ? "minimum-qualification-preview" : null,
      officialUrl: officialUrl.href, sourceUrl: officialUrl.href,
      discoveredAt: fetchedAt, source: "Google Careers",
    });
  });
  if (!jobs.size && !/no (?:matching )?(?:jobs|results)|there are no jobs/i.test(pageText)) {
    throw new Error("Google Careers returned no readable Software Engineer listings. Its page structure may have changed; no fallback listings were used.");
  }
  return [...jobs.values()];
}

export function parseGoogleNextPage(html, searchPageUrl) {
  validateSearchUrl(searchPageUrl);
  const $ = cheerio.load(html);
  const href = $("a[aria-label*='next page' i]").first().attr("href");
  if (!href) return null;
  try {
    const next = validateSearchUrl(new URL(href, searchPageUrl).href);
    if (next.pathname !== SEARCH_PATH || next.searchParams.get("q")?.toLowerCase() !== "software engineer") return null;
    if ((next.searchParams.get("location") || "") !== (new URL(searchPageUrl).searchParams.get("location") || "")) return null;
    const page = Number(next.searchParams.get("page"));
    return Number.isInteger(page) && page > 1 && page <= 100 ? page : null;
  } catch { return null; }
}

export async function discoverGoogleJobs({ location = "", page = 1, fetchImpl = fetch, clock = () => new Date().toISOString() } = {}) {
  if (typeof location !== "string" || location.length > 100 || /\p{Cc}/u.test(location)) throw new Error("Location filter must be 100 characters or fewer.");
  if (!Number.isInteger(Number(page)) || Number(page) < 1 || Number(page) > 100) throw new Error("Page must be a number from 1 to 100.");
  const normalizedLocation = location.trim();
  const { html, finalUrl } = await fetchSearchPage(searchUrl(normalizedLocation, Number(page)), fetchImpl);
  return {
    sourceUrl: finalUrl,
    location: normalizedLocation || null,
    page: Number(page),
    nextPage: parseGoogleNextPage(html, finalUrl),
    discoveredAt: clock(),
    jobs: parseGoogleJobListings(html, finalUrl, clock()),
  };
}
