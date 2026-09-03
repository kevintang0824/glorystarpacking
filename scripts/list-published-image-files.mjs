import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const assetsRoot = path.join(projectRoot, "assets");
const catalog = JSON.parse(fs.readFileSync(path.join(assetsRoot, "catalog", "catalog.json"), "utf8"));
const publishedImages = new Set();
const previewsOnly = process.argv.includes("--previews-only");

const addPublishedPath = (url) => {
  const relativePath = String(url || "").split(/[?#]/)[0];
  if (!relativePath) return;
  publishedImages.add(path.join(projectRoot, relativePath));
};

for (const product of catalog.products) {
  if (!previewsOnly) addPublishedPath(product.image);
  addPublishedPath(product.previewImage);
}

const imagePattern = /\.(?:avif|gif|jpe?g|png|webp)$/i;
const conflictCopyPattern = / \d+\.(?:avif|gif|jpe?g|png|webp)$/i;
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entryPath !== path.join(assetsRoot, "catalog")) walk(entryPath);
    } else if (imagePattern.test(entry.name) && !conflictCopyPattern.test(entry.name)) {
      publishedImages.add(entryPath);
    }
  }
};
walk(assetsRoot);

process.stdout.write(`${[...publishedImages].sort().join("\n")}\n`);
