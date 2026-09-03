import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteOrigin = "https://glorystarpacking.com";
const checkMode = process.argv.includes("--check");
const blogPath = path.join(root, "blog.html");
const outputPath = path.join(root, "feed.xml");
const blogHtml = fs.readFileSync(blogPath, "utf8");

const escapeXml = (value) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&apos;");

const structuredData = [...blogHtml.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
  .map((match) => JSON.parse(match[1]));
const nodes = structuredData.flatMap((entry) => entry["@graph"] || [entry]);
const blog = nodes.find((entry) => entry["@type"] === "Blog");

if (!blog || !Array.isArray(blog.blogPost) || !blog.blogPost.length) {
  throw new Error("blog.html does not contain a Blog schema with blogPost entries");
}

const items = blog.blogPost.map((post) => {
  const postId = String(post?.["@id"] || "").trim();
  if (!postId.endsWith("#article")) throw new Error(`Blog post reference is invalid: ${postId || "missing @id"}`);
  const url = new URL(postId.slice(0, -"#article".length), siteOrigin);
  if (url.origin !== siteOrigin) throw new Error(`Feed item is outside the canonical origin: ${url.href}`);
  const file = url.pathname.replace(/^\//, "");
  const pagePath = path.join(root, file);
  if (!fs.existsSync(pagePath)) throw new Error(`Feed page is missing: ${file}`);
  const pageHtml = fs.readFileSync(pagePath, "utf8");
  const description = pageHtml.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1];
  if (!description) throw new Error(`Feed page has no meta description: ${file}`);
  const pageStructuredData = [...pageHtml.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => JSON.parse(match[1]));
  const pageNodes = pageStructuredData.flatMap((entry) => entry["@graph"] || [entry]);
  const article = pageNodes.find((entry) => entry["@type"] === "BlogPosting" && entry["@id"] === postId);
  if (!article) throw new Error(`Feed page has no matching BlogPosting schema: ${file}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(article.dateModified || "")) {
    throw new Error(`Feed page has no valid Article dateModified: ${file}`);
  }

  return {
    title: article.headline,
    url: url.href,
    published: new Date(`${article.datePublished}T00:00:00Z`),
    modified: new Date(`${article.dateModified}T00:00:00Z`),
    description,
  };
}).sort((a, b) => b.published - a.published);

const lastBuildDate = new Date(Math.max(...items.map((item) => item.modified.getTime()))).toUTCString();
const itemXml = items.map((item) => [
  "    <item>",
  `      <title>${escapeXml(item.title)}</title>`,
  `      <link>${escapeXml(item.url)}</link>`,
  `      <guid isPermaLink="true">${escapeXml(item.url)}</guid>`,
  `      <pubDate>${item.published.toUTCString()}</pubDate>`,
  `      <description>${escapeXml(item.description)}</description>`,
  "    </item>",
].join("\n")).join("\n");

const feed = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
  "  <channel>",
  "    <title>GloryStarPack Buyer Guides</title>",
  `    <link>${siteOrigin}/blog.html</link>`,
  "    <description>Practical guides for custom packaging structure, artwork, sampling, quality, cost, testing, sourcing, and delivery planning.</description>",
  "    <language>en</language>",
  `    <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
  `    <atom:link href="${siteOrigin}/feed.xml" rel="self" type="application/rss+xml"/>`,
  itemXml,
  "  </channel>",
  "</rss>",
  "",
].join("\n");

if (checkMode) {
  if (!fs.existsSync(outputPath) || fs.readFileSync(outputPath, "utf8") !== feed) {
    throw new Error("feed.xml is stale; run node scripts/generate-feed.mjs and commit the generated feed");
  }
  console.log(`Verified feed.xml with ${items.length} buyer-guide entries.`);
} else {
  fs.writeFileSync(outputPath, feed);
  console.log(`Generated feed.xml with ${items.length} buyer-guide entries.`);
}
