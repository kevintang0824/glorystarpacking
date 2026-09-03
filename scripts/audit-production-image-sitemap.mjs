import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { inspectJpegMetadata } from "./jpeg-metadata.mjs";

const origin = new URL(process.argv[2] || "https://glorystarpacking.com").origin;
const sitemapUrl = `${origin}/image-sitemap.xml`;
const errors = [];
const localImageSitemap = fs.readFileSync(path.resolve(import.meta.dirname, "..", "image-sitemap.xml"), "utf8");

const response = await fetch(sitemapUrl, {
  cache: "no-store",
  headers: { "user-agent": "GloryStarPack production image sitemap audit" },
  signal: AbortSignal.timeout(20_000),
});

if (!response.ok) {
  console.error(`Image sitemap audit failed: ${sitemapUrl} returned ${response.status}.`);
  process.exit(1);
}

const contentType = response.headers.get("content-type") || "";
if (!/(?:application|text)\/xml/i.test(contentType)) {
  errors.push(`image-sitemap.xml has unexpected content type: ${contentType || "missing"}`);
}
if (/noindex/i.test(response.headers.get("x-robots-tag") || "")) {
  errors.push("image-sitemap.xml is blocked by X-Robots-Tag");
}

const xml = await response.text();
if (xml !== localImageSitemap) errors.push("image-sitemap.xml differs from the validated local release");
if (!xml.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"')) {
  errors.push("image-sitemap.xml is missing the Google image namespace");
}
const parseEntries = (source) => [...source.matchAll(/<url>([\s\S]*?)<\/url>/g)]
  .map((match) => ({
    page: match[1].match(/<loc>([^<]+)<\/loc>/)?.[1]?.trim() || "",
    lastmod: match[1].match(/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/)?.[1] || "",
    image: match[1].match(/<image:loc>([^<]+)<\/image:loc>/)?.[1]?.trim() || "",
  }));
const entries = parseEntries(xml);
const expectedEntryCount = parseEntries(localImageSitemap).length;

if (entries.length !== expectedEntryCount) errors.push(`expected ${expectedEntryCount} image sitemap entries, found ${entries.length}`);
if (entries.some((entry) => !entry.lastmod)) errors.push("image sitemap entry is missing lastmod");
if (new Set(entries.map((entry) => entry.page)).size !== entries.length) errors.push("duplicate page URL in image sitemap");
if (new Set(entries.map((entry) => entry.image)).size !== entries.length) errors.push("duplicate image URL in image sitemap");
if (/finerpackaging\.en\.alibaba\.com/i.test(xml)) errors.push("legacy source URL appears in image sitemap");

try {
  const robotsResponse = await fetch(`${origin}/robots.txt`, { cache: "no-store", signal: AbortSignal.timeout(20_000) });
  if (!robotsResponse.ok) {
    errors.push(`robots.txt returned ${robotsResponse.status}`);
  } else {
    const robots = await robotsResponse.text();
    if (!robots.includes(`Sitemap: ${sitemapUrl}`)) errors.push("robots.txt does not declare image-sitemap.xml");
    if (/Disallow:\s*\/assets\//i.test(robots)) errors.push("robots.txt blocks image assets");
  }
} catch (error) {
  errors.push(`robots.txt request failed (${error.message})`);
}

let imageBytes = 0;
let referencePageCount = 0;
const auditEntry = async (entry) => {
  const label = entry.page.replace(`${origin}/`, "");
  if (!entry.page.startsWith(`${origin}/`)) errors.push(`${label}: page URL is outside ${origin}`);
  if (!entry.image.startsWith(`${origin}/assets/`) || !/\.jpe?g$/i.test(new URL(entry.image).pathname)) {
    errors.push(`${label}: image URL is outside the canonical JPEG asset path`);
  }

  try {
    const [pageResponse, imageResponse] = await Promise.all([
      fetch(entry.page, { cache: "no-store", signal: AbortSignal.timeout(20_000) }),
      fetch(entry.image, { cache: "no-store", signal: AbortSignal.timeout(20_000) }),
    ]);

    if (!pageResponse.ok) {
      errors.push(`${label}: detail page returned ${pageResponse.status}`);
    } else {
      if (/noindex/i.test(pageResponse.headers.get("x-robots-tag") || "")) errors.push(`${label}: detail page is blocked by X-Robots-Tag`);
      const html = await pageResponse.text();
      if (!html.includes(`<link rel="canonical" href="${entry.page}">`)) errors.push(`${label}: canonical is missing or mismatched`);
      const relativeImage = entry.image.replace(`${origin}/`, "");
      if (!html.includes(`<meta property="og:image" content="${entry.image}">`)) {
        errors.push(`${label}: page primary-image metadata does not match the sitemap image`);
      }
      if (/class="[^"]*\breference-hero__grid\b[^"]*"/i.test(html)) {
        referencePageCount += 1;
        const heroStart = html.indexOf('<section class="reference-hero">');
        const heroEnd = heroStart >= 0 ? html.indexOf("</section>", heroStart) : -1;
        const heroHtml = heroStart >= 0 && heroEnd > heroStart ? html.slice(heroStart, heroEnd) : "";
        const classCount = (className) => (heroHtml.match(new RegExp(`class="[^"]*\\b${className}\\b[^"]*"`, "g")) || []).length;
        const introIndex = heroHtml.indexOf('class="reference-hero__intro"');
        const mediaIndex = heroHtml.indexOf('class="reference-hero__media"');
        const detailsIndex = heroHtml.indexOf('class="reference-hero__details"');
        if (classCount("reference-hero__intro") !== 1 ||
            classCount("reference-hero__media") !== 1 ||
            classCount("reference-hero__details") !== 1 ||
            !(introIndex >= 0 && mediaIndex > introIndex && detailsIndex > mediaIndex)) {
          errors.push(`${label}: detail page title-image-details order is missing`);
        }
        if (/reference-hero__copy/i.test(heroHtml)) errors.push(`${label}: legacy monolithic reference hero remains`);
        const introHtml = introIndex >= 0 && mediaIndex > introIndex ? heroHtml.slice(introIndex, mediaIndex) : "";
        const mediaHtml = mediaIndex >= 0 && detailsIndex > mediaIndex ? heroHtml.slice(mediaIndex, detailsIndex) : "";
        const detailsHtml = detailsIndex >= 0 ? heroHtml.slice(detailsIndex) : "";
        if (!/breadcrumbs/i.test(introHtml) || !/<h1\b/i.test(introHtml) || !/reference-hero__lead/i.test(introHtml)) {
          errors.push(`${label}: detail page intro content is incomplete`);
        }
        if (!mediaHtml.includes(`src="${relativeImage}"`) || !/<figcaption\b/i.test(mediaHtml)) {
          errors.push(`${label}: detail page primary media content is incomplete`);
        }
        if (!/hero__actions/i.test(detailsHtml) || !/reference-facts/i.test(detailsHtml) || !/reference-note/i.test(detailsHtml)) {
          errors.push(`${label}: detail page commercial details are incomplete`);
        }
      }
    }

    if (!imageResponse.ok) {
      errors.push(`${label}: image returned ${imageResponse.status}`);
    } else {
      if (/noindex/i.test(imageResponse.headers.get("x-robots-tag") || "")) errors.push(`${label}: image is blocked by X-Robots-Tag`);
      const imageType = imageResponse.headers.get("content-type") || "";
      if (!/^image\/jpeg(?:;|$)/i.test(imageType)) errors.push(`${label}: image has unexpected content type ${imageType || "missing"}`);
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      const bytes = imageBuffer.byteLength;
      imageBytes += bytes;
      if (bytes < 1024) errors.push(`${label}: image response is unexpectedly small (${bytes} bytes)`);
      try {
        const metadata = inspectJpegMetadata(imageBuffer);
        if (metadata.length) errors.push(`${label}: image retains removable JPEG metadata (${metadata.map((segment) => segment.name).join(", ")})`);
      } catch (error) {
        errors.push(`${label}: image metadata audit failed (${error.message})`);
      }
    }
  } catch (error) {
    errors.push(`${label}: request failed (${error.message})`);
  }
};

for (let index = 0; index < entries.length; index += 4) {
  await Promise.all(entries.slice(index, index + 4).map(auditEntry));
}
if (referencePageCount !== 12) errors.push(`expected 12 curated reference pages in image sitemap, found ${referencePageCount}`);

const sensitiveMetadataPaths = [
  "/assets/catalog/products/1600082295707.jpg",
  "/assets/catalog/previews/1600082295707.jpg",
  "/assets/catalog/products/1600727801473.jpg",
  "/assets/catalog/previews/1600727801473.jpg",
];
await Promise.all(sensitiveMetadataPaths.map(async (pathname) => {
  try {
    const metadataResponse = await fetch(`${origin}${pathname}`, { cache: "no-store", signal: AbortSignal.timeout(20_000) });
    if (!metadataResponse.ok) {
      errors.push(`${pathname}: metadata probe returned ${metadataResponse.status}`);
      return;
    }
    const metadata = inspectJpegMetadata(Buffer.from(await metadataResponse.arrayBuffer()));
    if (metadata.length) errors.push(`${pathname}: known metadata-sensitive image retains ${metadata.map((segment) => segment.name).join(", ")}`);
  } catch (error) {
    errors.push(`${pathname}: metadata probe failed (${error.message})`);
  }
}));

if (errors.length) {
  console.error(`Production image sitemap audit failed (${errors.length}):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Production image sitemap audit passed: ${entries.length} unique primary JPEG images (${imageBytes.toLocaleString()} bytes) are live on matching indexable pages, including 12 curated references; all are free of removable JPEG metadata and four known metadata-sensitive derivatives are also clean.`);
