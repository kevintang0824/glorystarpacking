import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const siteOrigin = "https://glorystarpacking.com";
const checkMode = process.argv.includes("--check");
const outputPath = path.join(root, "sitemap.xml");
const xmlEscape = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const routeFor = (file) => file === "index.html" ? `${siteOrigin}/` : `${siteOrigin}/${file}`;
const previousXml = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, "utf8") : "";
const previousEntries = new Map([...previousXml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>([\s\S]*?)<\/url>/g)]
  .map((match) => [match[1].trim(), {
    lastmod: match[2],
    changefreq: match[3].match(/<changefreq>([^<]+)<\/changefreq>/)?.[1] || "monthly",
    priority: match[3].match(/<priority>([^<]+)<\/priority>/)?.[1] || "0.85",
  }]));
const previousOrder = new Map([...previousXml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>/g)].map((match, index) => [match[1].trim(), index]));

const entries = fs.readdirSync(root)
  .filter((file) => file.endsWith(".html") && !/ \d+\.html$/i.test(file))
  .map((file) => {
    const html = fs.readFileSync(path.join(root, file), "utf8");
    const robots = html.match(/<meta\s+name="robots"\s+content="([^"]+)"/i)?.[1] || "";
    if (!/\bindex\b/i.test(robots) || /\bnoindex\b/i.test(robots)) return null;
    const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1] || "";
    if (canonical !== routeFor(file)) throw new Error(`${file}: canonical does not match its root route`);
    const dates = [...html.matchAll(/"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})"/g)].map((match) => match[1]);
    const uniqueDates = [...new Set(dates)];
    const previous = previousEntries.get(canonical);
    const lastmod = uniqueDates.length === 1 ? uniqueDates[0] : previous?.lastmod;
    if (!lastmod || uniqueDates.length > 1) throw new Error(`${file}: expected one structured dateModified or an existing Sitemap lastmod, found ${uniqueDates.join(", ") || "none"}`);
    return {
      file,
      canonical,
      lastmod,
      changefreq: previous?.changefreq || "monthly",
      priority: previous?.priority || (file === "index.html" ? "1.0" : file === "blog.html" ? "0.75" : "0.85"),
    };
  })
  .filter(Boolean)
  .sort((left, right) => (previousOrder.get(left.canonical) ?? Number.MAX_SAFE_INTEGER) - (previousOrder.get(right.canonical) ?? Number.MAX_SAFE_INTEGER) || left.canonical.localeCompare(right.canonical));

if (!entries.length) throw new Error("No indexable canonical pages found");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((entry) => `  <url>\n    <loc>${xmlEscape(entry.canonical)}</loc>\n    <lastmod>${entry.lastmod}</lastmod>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`).join("\n")}
</urlset>
`;

if (checkMode) {
  if (!fs.existsSync(outputPath) || fs.readFileSync(outputPath, "utf8") !== sitemap) {
    throw new Error("sitemap.xml is stale; run node scripts/generate-sitemap.mjs and commit the generated sitemap");
  }
  console.log(`Verified sitemap.xml with ${entries.length} indexable canonical pages.`);
} else {
  fs.writeFileSync(outputPath, sitemap);
  console.log(`Generated sitemap.xml with ${entries.length} indexable canonical pages.`);
}
