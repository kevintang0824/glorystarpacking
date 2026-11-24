import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const root = process.cwd();
const output = path.join(root, "dist/cloudflare");
const languages = ["fr", "es", "pt", "ru", "zh-CN"];
const skip = /(?:^|\/)\.DS_Store$| \d+\.(?:html|webmanifest)$|^assets\/catalog\/(?:clean-sources\/|categories\/|(?:import-report|curated-products)\.json$|previews\/60697040446\.jpg$)|^assets\/catalog\/(?:products|previews)\/.* \d+\.jpg$/;
const files = [];
const walk = (directory) => {
  for (const item of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
    const relative = path.posix.join(directory, item.name);
    if (skip.test(relative)) continue;
    if (item.isDirectory()) walk(relative);
    else if (item.isFile()) files.push(relative);
    else throw new Error(`Refusing non-regular deployment file: ${relative}`);
  }
};
for (const item of fs.readdirSync(root, { withFileTypes: true })) {
  if (item.isFile() && !skip.test(item.name) && (item.name.endsWith(".html") ||
    ["robots.txt", "sitemap.xml", "sitemap-languages.xml", "image-sitemap.xml", "feed.xml", "llms.txt", "site.webmanifest"].includes(item.name) || /^[a-f0-9]{32}\.txt$/.test(item.name))) files.push(item.name);
}
for (const folder of ["assets", ...languages]) walk(folder);
if (files.length >= 20000) throw new Error("Pages free plan file limit exceeded");
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const relative of files) {
  const source = path.join(root, relative);
  if (fs.statSync(source).size > 25 * 1024 * 1024) throw new Error(`Pages asset exceeds 25 MiB: ${relative}`);
  const target = path.join(output, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  if (createHash("sha256").update(fs.readFileSync(source)).digest("hex") !== createHash("sha256").update(fs.readFileSync(target)).digest("hex")) throw new Error(`Copy mismatch: ${relative}`);
}
const htmlPaths = files.filter((file) => file.endsWith(".html")).map((file) => `/${file}`).sort();
fs.writeFileSync(path.join(root, "cloudflare/generated-routes.json"), `${JSON.stringify({ htmlPaths }, null, 2)}\n`);
// Compile the worker separately before deployment; it must never be a public asset.
fs.writeFileSync(path.join(output, "_routes.json"), `${JSON.stringify({ version: 1, include: ["/*"], exclude: ["/assets/*", "/.well-known/acme-challenge/*"] }, null, 2)}\n`);
const settings = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
// Static assets bypass Functions. Collapse overlapping rules to avoid duplicate CSP/cache headers.
const globalHeaders = settings.headers.find(({ source }) => source === "/(.*)").headers;
const assetHeaders = new Map(globalHeaders.map(({ key, value }) => [key, value]));
for (const { key, value } of settings.headers.find(({ source }) => source === "/assets/(.*)").headers) assetHeaders.set(key, value);
fs.writeFileSync(path.join(output, "_headers"), `/assets/*\n${[...assetHeaders].map(([key, value]) => `  ${key}: ${value}`).join("\n")}\n\n/assets/fonts/*\n  Access-Control-Allow-Origin: *\n`);
console.log(`Pages assets ready: ${files.length} verified files, ${htmlPaths.length} HTML pages in ${output}`);
