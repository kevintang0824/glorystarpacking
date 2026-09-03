import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { inspectJpegMetadata, stripJpegMetadata } from "./jpeg-metadata.mjs";

const root = path.resolve(import.meta.dirname, "..");
const assetsRoot = path.join(root, "assets");
const checkMode = process.argv.includes("--check");
const conflictCopyPattern = / \d+\.jpe?g$/i;
const cleanSourceRoot = path.join(assetsRoot, "catalog", "clean-sources");
const unusedCategoryRoot = path.join(assetsRoot, "catalog", "categories");
const supersededPreview = path.join(assetsRoot, "catalog", "previews", "60697040446.jpg");

const publicJpegs = [];
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entryPath !== cleanSourceRoot && entryPath !== unusedCategoryRoot) walk(entryPath);
    } else if (entryPath !== supersededPreview && /\.jpe?g$/i.test(entry.name) && !conflictCopyPattern.test(entry.name)) {
      publicJpegs.push(entryPath);
    }
  }
};
walk(assetsRoot);

let affectedFiles = 0;
let removedSegments = 0;
let removedBytes = 0;
const failures = [];

for (const filePath of publicJpegs.sort()) {
  try {
    const source = fs.readFileSync(filePath);
    const metadata = inspectJpegMetadata(source);
    if (!metadata.length) continue;
    affectedFiles += 1;
    removedSegments += metadata.length;
    removedBytes += metadata.reduce((total, segment) => total + segment.bytes, 0);
    if (checkMode) continue;

    const stripped = stripJpegMetadata(source).buffer;
    const temporaryPath = `${filePath}.metadata-clean-${process.pid}`;
    fs.writeFileSync(temporaryPath, stripped, { mode: fs.statSync(filePath).mode });
    fs.renameSync(temporaryPath, filePath);
  } catch (error) {
    failures.push(`${path.relative(root, filePath)}: ${error.message}`);
  }
}

if (failures.length) {
  throw new Error(`JPEG metadata processing failed:\n- ${failures.join("\n- ")}`);
}
if (checkMode && affectedFiles) {
  throw new Error(`${affectedFiles} public JPEG files still contain ${removedSegments} removable metadata segments (${removedBytes} bytes)`);
}

const action = checkMode ? "Verified" : "Processed";
console.log(`${action} ${publicJpegs.length} public JPEG files; ${affectedFiles} file(s), ${removedSegments} metadata segment(s), ${removedBytes} byte(s) ${checkMode ? "remain" : "removed"}.`);
