import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteOrigin = "https://glorystarpacking.com";
const checkMode = process.argv.includes("--check");
const sitemapPath = path.join(root, "sitemap.xml");
const outputPath = path.join(root, "image-sitemap.xml");

const sitemap = fs.readFileSync(sitemapPath, "utf8");
const sitemapEntries = [...sitemap.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>[\s\S]*?<\/url>/g)]
  .map((match) => ({ page: match[1].trim(), lastmod: match[2] }));

if (!sitemapEntries.length) throw new Error("sitemap.xml contains no page entries with lastmod");

const uniqueImages = new Set();
const imageEntries = [];

for (const entry of sitemapEntries) {
  const pageUrl = new URL(entry.page);
  if (pageUrl.origin !== siteOrigin) throw new Error(`Sitemap page is outside the canonical origin: ${entry.page}`);
  const file = pageUrl.pathname === "/" ? "index.html" : decodeURIComponent(pageUrl.pathname.replace(/^\//, ""));
  const pagePath = path.join(root, file);
  if (!fs.existsSync(pagePath) || !fs.statSync(pagePath).isFile()) throw new Error(`Sitemap page is missing: ${file}`);
  const html = fs.readFileSync(pagePath, "utf8");
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1] || "";
  const image = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)?.[1] || "";
  if (canonical !== entry.page) throw new Error(`${file}: canonical does not match sitemap.xml`);
  if (!image) throw new Error(`${file}: og:image is missing`);
  const imageUrl = new URL(image);
  if (imageUrl.origin !== siteOrigin || !imageUrl.pathname.startsWith("/assets/") || !/\.jpe?g$/i.test(imageUrl.pathname)) {
    throw new Error(`${file}: og:image must be a canonical-site JPEG asset`);
  }
  const imagePath = path.join(root, decodeURIComponent(imageUrl.pathname.replace(/^\//, "")));
  if (!fs.existsSync(imagePath) || !fs.statSync(imagePath).isFile()) throw new Error(`${file}: og:image asset is missing`);
  if (uniqueImages.has(imageUrl.href)) continue;
  uniqueImages.add(imageUrl.href);
  imageEntries.push({ ...entry, image: imageUrl.href });
}

const imageSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${imageEntries.map((entry) => `  <url>
    <loc>${entry.page}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <image:image>
      <image:loc>${entry.image}</image:loc>
    </image:image>
  </url>`).join("\n")}
</urlset>
`;

if (checkMode) {
  if (!fs.existsSync(outputPath) || fs.readFileSync(outputPath, "utf8") !== imageSitemap) {
    throw new Error("image-sitemap.xml is stale; run node scripts/generate-image-sitemap.mjs and commit the generated sitemap");
  }
  console.log(`Verified image-sitemap.xml with ${imageEntries.length} unique primary images from ${sitemapEntries.length} canonical pages.`);
} else {
  fs.writeFileSync(outputPath, imageSitemap);
  console.log(`Generated image-sitemap.xml with ${imageEntries.length} unique primary images from ${sitemapEntries.length} canonical pages.`);
}
