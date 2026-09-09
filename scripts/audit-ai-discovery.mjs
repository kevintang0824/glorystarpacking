import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const requestedOrigin = process.argv.find((argument) => argument.startsWith("--origin="))?.slice("--origin=".length);
const origin = (requestedOrigin || "https://glorystarpacking.com").replace(/\/$/, "");
const errors = [];

const requiredFiles = [
  "assets/templates/phase-4-outreach-tracker.csv",
  "assets/templates/ai-search-visibility-log.csv",
  "PHASE_4_OFFSITE_AI_PROGRAM.md",
];
for (const relativePath of requiredFiles) {
  if (!fs.existsSync(path.join(root, relativePath))) errors.push(`Missing local Phase 4 asset: ${relativePath}`);
}

const csvHeader = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8").split(/\r?\n/, 1)[0];
if (!csvHeader("assets/templates/phase-4-outreach-tracker.csv").includes("placement_url")) {
  errors.push("Outreach tracker is missing placement_url");
}
if (!csvHeader("assets/templates/ai-search-visibility-log.csv").includes("citation_accuracy")) {
  errors.push("AI visibility log is missing citation_accuracy");
}

const liveChecks = [
  {
    path: "/robots.txt",
    test: (body) => body.includes("OAI-SearchBot") && body.includes("Sitemap: https://glorystarpacking.com/sitemap.xml"),
    label: "robots AI crawler and sitemap directives",
  },
  {
    path: "/sitemap.xml",
    test: (body) => (body.match(/<loc>/g) || []).length >= 78 && body.includes("packaging-supplier-qualification-checklist.html"),
    label: "canonical sitemap coverage",
  },
  {
    path: "/image-sitemap.xml",
    test: (body) => (body.match(/<image:loc>/g) || []).length >= 37,
    label: "image sitemap coverage",
  },
  {
    path: "/feed.xml",
    test: (body) => (body.match(/<item>/g) || []).length >= 37 && body.includes("packaging-test-records-guide.html"),
    label: "RSS article discovery",
  },
  {
    path: "/llms.txt",
    test: (body) => body.includes("## Company identity and evidence")
      && body.includes("## High-intent buyer guides")
      && body.includes("## Attribution")
      && body.includes("packaging-supplier-qualification-checklist.html"),
    label: "machine-readable citation map",
  },
];

for (const check of liveChecks) {
  try {
    const response = await fetch(`${origin}${check.path}`, { redirect: "manual" });
    const body = await response.text();
    if (response.status !== 200) {
      errors.push(`${check.path}: expected HTTP 200, got ${response.status}`);
    } else if (!check.test(body)) {
      errors.push(`${check.path}: failed ${check.label}`);
    } else {
      console.log(`PASS ${check.path} · ${check.label}`);
    }
  } catch (error) {
    errors.push(`${check.path}: ${error.message}`);
  }
}

const articlePaths = [
  "/packaging-supplier-qualification-checklist.html",
  "/custom-packaging-development-case-study.html",
  "/packaging-test-records-guide.html",
  "/beauty-packaging-industry-guide.html",
];
for (const articlePath of articlePaths) {
  try {
    const response = await fetch(`${origin}${articlePath}`, { redirect: "manual" });
    const body = await response.text();
    const canonical = body.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1] || "";
    const robots = body.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)/i)?.[1] || "";
    const hasBlogPosting = body.includes('"@type":"BlogPosting"') || body.includes('"@type": "BlogPosting"');
    if (response.status !== 200 || canonical !== `${origin}${articlePath}` || /noindex/i.test(robots) || !hasBlogPosting) {
      errors.push(`${articlePath}: article discovery contract failed`);
    } else {
      console.log(`PASS ${articlePath} · article discovery contract`);
    }
  } catch (error) {
    errors.push(`${articlePath}: ${error.message}`);
  }
}

if (errors.length) {
  console.error(`AI discovery audit failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`AI discovery audit passed for ${origin}; result visibility still requires manual prompt checks recorded in ai-search-visibility-log.csv.`);
}
