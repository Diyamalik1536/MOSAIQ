import * as cheerio from "cheerio";
import { Buffer } from "node:buffer";
import { validateGoogleJobUrl, getGoogleJobId } from "../utils/googleJobUrl.js";
import { extractSkills } from "../utils/skillTaxonomy.js";

const REQUEST_TIMEOUT_MS = 15000;
const MAX_REDIRECTS = 4;
const MAX_HTML_BYTES = 5_000_000;
const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

export async function fetchGooglePage(inputUrl, fetchImpl = fetch) {
  let url = validateGoogleJobUrl(inputUrl);
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    const response = await fetchImpl(url, {
      redirect: "manual", signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { "User-Agent": "MOSAIQCareerAnalytics/1.0 (+job-description extraction)", Accept: "text/html,application/xhtml+xml" },
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      if (redirects === MAX_REDIRECTS) throw new Error("Google Careers redirected too many times.");
      const location = response.headers.get("location");
      if (!location) throw new Error("Google Careers returned an invalid redirect.");
      url = validateGoogleJobUrl(new URL(location, url).href);
      continue;
    }
    if (!response.ok) throw new Error(response.status === 404 ? "The Google job listing is no longer available." : `Google Careers returned HTTP ${response.status}.`);
    if (!(response.headers.get("content-type") ?? "").includes("text/html")) throw new Error("Google Careers did not return an HTML job page.");
    const declaredLength = Number(response.headers.get("content-length"));
    if (declaredLength > MAX_HTML_BYTES) throw new Error("The Google job page is larger than the allowed response size.");
    const html = await response.text();
    if (Buffer.byteLength(html) > MAX_HTML_BYTES) throw new Error("The Google job page is larger than the allowed response size.");
    return { html, finalUrl: url.href };
  }
  throw new Error("Unable to fetch the Google job page.");
}

function bulletsAfterHeading($, title) {
  const heading = $("h1,h2,h3,h4").filter((_, el) => clean($(el).text()).replace(/:$/, "").toLowerCase() === title.toLowerCase()).first();
  if (!heading.length) return [];
  let node = heading.next();
  while (node.length && !/^h[1-4]$/i.test(node[0]?.tagName ?? "")) {
    if (node.is("ul,ol")) return node.find("li").toArray().map((el) => clean($(el).text())).filter(Boolean);
    node = node.next();
  }
  return [];
}

function descriptionAfterHeading($) {
  const heading = $("h1,h2,h3,h4").filter((_, el) => clean($(el).text()).replace(/:$/, "").toLowerCase() === "about the job").first();
  if (!heading.length) return null;
  const parts = [];
  let node = heading.next();
  while (node.length && !/^h[1-4]$/i.test(node[0]?.tagName ?? "")) {
    if (node.is("p")) { const value = clean(node.text()); if (value) parts.push(value); }
    node = node.next();
  }
  return parts.length ? [...new Set(parts)].join("\n\n") : null;
}

function extractedSkills(bullets, category, sourceUrl) {
  const found = new Map();
  for (const wording of bullets) for (const skill of extractSkills(wording)) {
    const existing = found.get(skill.id);
    if (existing) {
      if (!existing.originalWording.includes(wording)) existing.originalWording.push(wording);
      if (!existing.evidenceSnippets.includes(wording)) existing.evidenceSnippets.push(wording);
    } else found.set(skill.id, {
      skillId: skill.id, normalizedName: skill.name, originalWording: [wording],
      requirementCategory: category, proficiency: "unspecified", sourceUrl,
      evidenceSnippets: [wording], extractionBasis: "direct-text-match",
    });
  }
  return [...found.values()];
}

export function parseGoogleJob(html, sourceUrl, extractedAt = new Date().toISOString()) {
  const $ = cheerio.load(html);
  const pageText = clean($("body").text());
  if (/unusual traffic|captcha|robot check|access denied|verify you are human/i.test(pageText)) throw new Error("Google Careers blocked automated access (CAPTCHA or anti-bot response). Open the listing in a browser; extraction will not bypass that restriction.");
  const ogTitle = clean($("meta[property='og:title']").attr("content")).replace(/\s*[|—-]\s*Google Careers.*$/i, "");
  const matchingHeading = $("h1,h2,h3").filter((_, el) => clean($(el).text()) === ogTitle).first();
  const title = ogTitle && ogTitle.toLowerCase() !== "job details" ? ogTitle : clean(matchingHeading.text()) || clean($("h1").first().text());
  const minimum = bulletsAfterHeading($, "Minimum qualifications");
  const preferred = bulletsAfterHeading($, "Preferred qualifications");
  if (!title || (!minimum.length && !preferred.length)) throw new Error("The page did not contain a readable Google job description and qualifications. No data was saved.");
  const url = validateGoogleJobUrl(sourceUrl);
  const detailHeading = $("h1,h2,h3").filter((_, el) => clean($(el).text()) === title).first();
  const detailText = detailHeading.parent().parent().text();
  const locMatch = detailText.match(/Google\s*place\s*(.+?)\s*bar_chart/i);
  const jobId = getGoogleJobId(url);
  return {
    schemaVersion: 1,
    company: { name: "Google", officialCareersDomain: url.hostname },
    job: { title, jobId, location: locMatch?.[1]?.trim() || null, description: descriptionAfterHeading($) },
    qualifications: { minimum, preferred },
    responsibilities: bulletsAfterHeading($, "Responsibilities"),
    requiredSkills: extractedSkills(minimum, "required", url.href),
    preferredSkills: extractedSkills(preferred, "preferred", url.href),
    sourceUrl: url.href,
    extractedAt,
    lastVerifiedAt: extractedAt,
    extractionStatus: "successful",
    verificationStatus: "source-verified",
    extractionNotes: { skillNormalization: "Controlled term matches retain the exact source bullet; no proficiency or weights are inferred.", pageAccess: "direct-http" },
  };
}

export async function extractGoogleJob(inputUrl, fetchImpl = fetch, clock = () => new Date().toISOString()) {
  const result = await fetchGooglePage(inputUrl, fetchImpl);
  return parseGoogleJob(result.html, result.finalUrl, clock());
}
