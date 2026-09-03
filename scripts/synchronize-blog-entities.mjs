import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const siteOrigin = "https://glorystarpacking.com";
const blogId = `${siteOrigin}/blog.html#blog`;
const organizationId = `${siteOrigin}/#organization`;
const conflictCopyPattern = / \d+\.html$/i;
const blogPath = path.join(root, "blog.html");
const originalBlogHtml = fs.readFileSync(blogPath, "utf8");
const currentOrder = new Map();
const pendingWrites = new Map();

for (const match of originalBlogHtml.matchAll(/"(?:url|@id)": "(https:\/\/glorystarpacking\.com\/[^"#]+\.html)(?:#article)?"/g)) {
  if (!currentOrder.has(match[1])) currentOrder.set(match[1], currentOrder.size);
}

const parseGraph = (html, file) => {
  const blocks = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  return blocks.flatMap((match, index) => {
    try {
      const parsed = JSON.parse(match[1]);
      return Array.isArray(parsed?.["@graph"]) ? parsed["@graph"] : [parsed];
    } catch (error) {
      throw new Error(`${file}: JSON-LD block ${index + 1} is invalid (${error.message})`);
    }
  });
};

const posts = [];
const htmlFiles = fs.readdirSync(root)
  .filter((file) => file.endsWith(".html") && file !== "blog.html" && !conflictCopyPattern.test(file))
  .sort();

for (const file of htmlFiles) {
  const filePath = path.join(root, file);
  const originalHtml = fs.readFileSync(filePath, "utf8");
  let html = originalHtml;
  if (!/"@type"\s*:\s*"(?:Article|BlogPosting)"/.test(html) || !/#article"/.test(html)) continue;

  html = html.replace(/"@type"\s*:\s*"Article"/, '"@type": "BlogPosting"');
  if (!html.includes(`"isPartOf": {"@id": "${blogId}"}`)) {
    const articleTypeIndex = html.indexOf('"@type": "BlogPosting"');
    const publisherIndex = html.indexOf('"publisher":', articleTypeIndex);
    const objectStart = html.indexOf("{", publisherIndex);
    if (publisherIndex < 0 || objectStart < 0) throw new Error(`${file}: BlogPosting publisher is missing`);
    let depth = 0;
    let objectEnd = -1;
    for (let index = objectStart; index < html.length; index += 1) {
      if (html[index] === "{") depth += 1;
      if (html[index] === "}") depth -= 1;
      if (depth === 0) {
        objectEnd = index;
        break;
      }
    }
    const commaIndex = html.indexOf(",", objectEnd);
    const lineEnd = html.indexOf("\n", commaIndex);
    const lineStart = html.lastIndexOf("\n", publisherIndex) + 1;
    const indentation = html.slice(lineStart, publisherIndex);
    if (objectEnd < 0 || commaIndex !== objectEnd + 1 || lineEnd < 0) {
      throw new Error(`${file}: BlogPosting publisher property could not be bounded`);
    }
    html = `${html.slice(0, lineEnd + 1)}${indentation}"isPartOf": {"@id": "${blogId}"},\n${html.slice(lineEnd + 1)}`;
  }

  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
  if (canonical) {
    html = html.replace(
      `        "mainEntityOfPage": "${canonical}",`,
      `        "mainEntityOfPage": {\n          "@type": "WebPage",\n          "@id": "${canonical}"\n        },`,
    );
  }
  const post = parseGraph(html, file).find((node) => node?.["@type"] === "BlogPosting");
  if (!canonical || !post) throw new Error(`${file}: canonical or BlogPosting is missing`);
  if (post["@id"] !== `${canonical}#article`) throw new Error(`${file}: BlogPosting @id must match its canonical`);
  if (post.mainEntityOfPage?.["@type"] !== "WebPage" || post.mainEntityOfPage?.["@id"] !== canonical) {
    throw new Error(`${file}: BlogPosting mainEntityOfPage must identify its canonical WebPage`);
  }
  if (post.isPartOf?.["@id"] !== blogId) throw new Error(`${file}: BlogPosting isPartOf is mismatched`);
  if (!post.headline || !/^\d{4}-\d{2}-\d{2}$/.test(post.datePublished || "")) {
    throw new Error(`${file}: BlogPosting headline or datePublished is invalid`);
  }

  pendingWrites.set(filePath, { original: originalHtml, next: html });
  posts.push({ file, canonical, ...post });
}

if (posts.length !== 33) throw new Error(`Expected 33 BlogPosting pages, found ${posts.length}`);
posts.sort((left, right) => (
  right.datePublished.localeCompare(left.datePublished) ||
  (currentOrder.get(left.canonical) ?? Number.MAX_SAFE_INTEGER) - (currentOrder.get(right.canonical) ?? Number.MAX_SAFE_INTEGER) ||
  left.file.localeCompare(right.file)
));

const blogReferences = posts
  .map((post) => `          {"@id": "${post["@id"]}"}`)
  .join(",\n");
const blogPostPattern = /(        "blogPost": \[)\n[\s\S]*?\n(        \]\n      \},\n      \{\n        "@type": "BreadcrumbList")/;
if (!blogPostPattern.test(originalBlogHtml)) {
  throw new Error("blog.html: Blog blogPost list template is missing");
}
let blogHtml = originalBlogHtml.replace(blogPostPattern, `$1\n${blogReferences}\n$2`);
if (!blogHtml.includes(`"isPartOf": {"@id": "${siteOrigin}/#website"}`)) {
  const updatedBlogHtml = blogHtml.replace(
    `        "publisher": {"@id": "${organizationId}"},\n        "inLanguage": "en",`,
    `        "publisher": {"@id": "${organizationId}"},\n        "isPartOf": {"@id": "${siteOrigin}/#website"},\n        "inLanguage": "en",`,
  );
  if (updatedBlogHtml === blogHtml) throw new Error("blog.html: could not insert the Blog isPartOf relation");
  blogHtml = updatedBlogHtml;
}

const finalBlog = parseGraph(blogHtml, "blog.html").find((node) => node?.["@type"] === "Blog");
if (
  !finalBlog ||
  finalBlog["@id"] !== blogId ||
  finalBlog.url !== `${siteOrigin}/blog.html` ||
  finalBlog.publisher?.["@id"] !== organizationId ||
  finalBlog.isPartOf?.["@id"] !== `${siteOrigin}/#website`
) {
  throw new Error("blog.html: final Blog identity or entity relations are invalid");
}
const expectedPostIds = new Set(posts.map((post) => post["@id"]));
const finalPostIds = Array.isArray(finalBlog.blogPost)
  ? finalBlog.blogPost.map((post) => String(post?.["@id"] || ""))
  : [];
if (
  finalPostIds.length !== posts.length ||
  new Set(finalPostIds).size !== finalPostIds.length ||
  finalPostIds.some((postId) => !expectedPostIds.has(postId)) ||
  finalBlog.blogPost.some((post) => Object.keys(post).length !== 1)
) {
  throw new Error(`blog.html: final Blog blogPost references do not match the ${posts.length} guide pages`);
}
pendingWrites.set(blogPath, { original: originalBlogHtml, next: blogHtml });

let changedFiles = 0;
let writeIndex = 0;
for (const [filePath, { original, next }] of pendingWrites) {
  if (next === original) continue;
  const temporaryPath = `${filePath}.blog-sync-${process.pid}-${writeIndex++}`;
  try {
    fs.writeFileSync(temporaryPath, next, { mode: fs.statSync(filePath).mode });
    fs.renameSync(temporaryPath, filePath);
    changedFiles += 1;
  } finally {
    if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
  }
}

console.log(`Synchronized ${posts.length} BlogPosting pages with the Blog hub; ${changedFiles} file(s) changed.`);
