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
    "With no URL arguments, the script submits every URL in sitemap.xml for initial launch.",
  ].join("\n"));
  process.exit(0);
}

const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1].trim());
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
