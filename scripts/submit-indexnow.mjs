import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const siteOrigin = "https://glorystarpacking.com";
const siteHost = new URL(siteOrigin).hostname;
const indexNowKey = "22368291acb50c0fb4b3a1ab806495d4";
const keyLocation = `${siteOrigin}/${indexNowKey}.txt`;
const endpoint = "https://api.indexnow.org/indexnow";
const root = path.resolve(import.meta.dirname, "..");
const cliArguments = process.argv.slice(2);
const dryRun = cliArguments.includes("--dry-run");
const showHelp = cliArguments.includes("--help") || cliArguments.includes("-h");

if (showHelp) {
  console.log([
    "Submit changed GloryStarPack URLs to the IndexNow network.",
    "",
    "Usage:",
    "  node scripts/submit-indexnow.mjs --dry-run",
    "  node scripts/submit-indexnow.mjs / custom-rigid-boxes.html",
    "  INDEXNOW_URLS='/ custom-rigid-boxes.html' node scripts/submit-indexnow.mjs",
    "",
    "With no URL arguments, the script submits every URL in the English and language sitemaps.",
  ].join("\n"));
  process.exit(0);
}

const sitemapFiles = ["sitemap.xml", "sitemap-languages.xml"];
const sitemaps = sitemapFiles.map((file) => ({ file, body: fs.readFileSync(path.join(root, file), "utf8") }));
const sitemapUrls = sitemaps.flatMap(({ body }) => [...body.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1].trim()));
const sitemapUrlSet = new Set(sitemapUrls);
const environmentUrls = String(process.env.INDEXNOW_URLS || "").split(/\s+/).filter(Boolean);
const requestedUrls = [
  ...cliArguments.filter((argument) => !argument.startsWith("--")),
  ...environmentUrls,
];

const normalizeUrl = (value) => {
  const url = new URL(value, `${siteOrigin}/`);
  if (url.origin !== siteOrigin) throw new Error(`Refusing to submit a URL outside ${siteOrigin}: ${url.href}`);
  url.hash = "";
  return url.href;
};

const urlList = [...new Set((requestedUrls.length ? requestedUrls : sitemapUrls).map(normalizeUrl))];
if (!urlList.length) throw new Error("No URLs were found to submit.");
if (urlList.length > 10000) throw new Error("IndexNow accepts at most 10,000 URLs per request.");
const urlsOutsideSitemap = urlList.filter((url) => !sitemapUrlSet.has(url));
if (urlsOutsideSitemap.length) {
  throw new Error(`Refusing to submit URL(s) missing from the site maps: ${urlsOutsideSitemap.join(", ")}`);
}

const payload = {
  host: siteHost,
  key: indexNowKey,
  keyLocation,
  urlList,
};

if (dryRun) {
  console.log(`IndexNow dry run: ${urlList.length} URL${urlList.length === 1 ? "" : "s"} ready.`);
  urlList.forEach((url) => console.log(`- ${url}`));
  process.exit(0);
}

const keyResponse = await fetch(keyLocation, { redirect: "manual", cache: "no-store" });
const liveKey = (await keyResponse.text()).trim();
if (keyResponse.status !== 200 || liveKey !== indexNowKey) {
  throw new Error(`IndexNow key preflight failed with HTTP ${keyResponse.status}`);
}

for (const sitemap of sitemaps) {
  const liveSitemapResponse = await fetch(`${siteOrigin}/${sitemap.file}`, { redirect: "manual", cache: "no-store" });
  const liveSitemap = await liveSitemapResponse.text();
  if (liveSitemapResponse.status !== 200 || liveSitemap !== sitemap.body) {
    throw new Error(`Production sitemap does not exactly match the local release (${sitemap.file}); deploy and verify the current build before submitting IndexNow.`);
  }
}

const digest = (value) => createHash("sha256").update(value).digest("hex");
const canonicalFrom = (html) =>
  html.match(/<link\b[^>]*rel=[\"']canonical[\"'][^>]*href=[\"']([^\"']+)[\"']/i)?.[1] ||
  html.match(/<link\b[^>]*href=[\"']([^\"']+)[\"'][^>]*rel=[\"']canonical[\"']/i)?.[1] ||
  "";

let nextPreflightIndex = 0;
const preflightFailures = [];
const preflightWorker = async () => {
  while (nextPreflightIndex < urlList.length) {
    const url = urlList[nextPreflightIndex++];
    try {
      const response = await fetch(url, { redirect: "manual", cache: "no-store" });
      const html = await response.text();
      if (response.status !== 200) {
        preflightFailures.push(`${url} returned HTTP ${response.status}`);
      } else if (canonicalFrom(html) !== url) {
        preflightFailures.push(`${url} has no matching canonical`);
      } else {
        const parsedUrl = new URL(url);
        let relativeFile = parsedUrl.pathname === "/"
          ? "index.html"
          : decodeURIComponent(parsedUrl.pathname.replace(/^\//, ""));
        if (!relativeFile.endsWith(".html")) relativeFile += "/index.html";
        const localPath = path.join(root, relativeFile);
        if (!relativeFile.endsWith(".html") || !fs.existsSync(localPath)) {
          preflightFailures.push(`${url} has no matching local HTML release file`);
        } else {
          const localHtml = fs.readFileSync(localPath, "utf8");
          if (digest(html) !== digest(localHtml)) {
            preflightFailures.push(`${url} production HTML does not match the local release`);
          }
        }
      }
    } catch (error) {
      preflightFailures.push(`${url} failed: ${error.message}`);
    }
  }
};
await Promise.all(Array.from({ length: Math.min(8, urlList.length) }, preflightWorker));
if (preflightFailures.length) {
  throw new Error(`Production preflight failed:\n- ${preflightFailures.join("\n- ")}`);
}

const response = await fetch(endpoint, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});

if (![200, 202].includes(response.status)) {
  const details = (await response.text()).trim();
  throw new Error(`IndexNow rejected the submission with HTTP ${response.status}${details ? `: ${details}` : "."}`);
}

console.log(`IndexNow accepted ${urlList.length} URL${urlList.length === 1 ? "" : "s"} with HTTP ${response.status}.`);
