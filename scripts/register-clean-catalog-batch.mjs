import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const [batchPath, method = "AI-assisted removal of legacy storefront URL and third-party branding"] = process.argv.slice(2);
if (!batchPath) throw new Error("A TSV batch path is required");

const projectRoot = path.resolve(import.meta.dirname, "..");
const cleanSourceRoot = path.join(projectRoot, "assets", "catalog", "clean-sources");
const manifestPath = path.join(cleanSourceRoot, "manifest.json");
const lines = (await fs.readFile(batchPath, "utf8"))
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);
const entries = lines.map((line) => {
  const [id, inputImage, sourcePositionValue = "1"] = line.split("\t");
  const sourceImagePosition = Number(sourcePositionValue);
  if (!/^\d+$/.test(id || "") || !inputImage) throw new Error(`Invalid TSV row: ${line}`);
  if (!Number.isInteger(sourceImagePosition) || sourceImagePosition < 1) throw new Error(`Invalid source position for ${id}`);
  return { id, inputImage, sourceImagePosition, outputName: `${id}.jpg` };
});
if (new Set(entries.map((entry) => entry.id)).size !== entries.length) throw new Error("The TSV batch contains duplicate product IDs");

await fs.mkdir(cleanSourceRoot, { recursive: true });
await Promise.all(entries.map((entry) => fs.access(entry.inputImage)));

const convert = (entry) => new Promise((resolve, reject) => {
  const child = spawn("sips", [
    "--resampleHeightWidthMax", "1200",
    "--setProperty", "format", "jpeg",
    "--setProperty", "formatOptions", "88",
    entry.inputImage,
    "--out", path.join(cleanSourceRoot, entry.outputName),
  ], { stdio: ["ignore", "ignore", "pipe"] });
  let stderr = "";
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  child.on("error", reject);
  child.on("close", (code) => code === 0 ? resolve() : reject(new Error(`${entry.id}: ${stderr.trim() || `sips exited ${code}`}`)));
});

let nextIndex = 0;
const worker = async () => {
  while (nextIndex < entries.length) {
    const entry = entries[nextIndex++];
    await convert(entry);
  }
};
await Promise.all(Array.from({ length: Math.min(4, entries.length) }, worker));

const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
manifest.products ||= {};
for (const entry of entries) {
  manifest.products[entry.id] = {
    file: entry.outputName,
    sourceImagePosition: entry.sourceImagePosition,
    method,
  };
}
manifest.products = Object.fromEntries(Object.entries(manifest.products).sort(([left], [right]) => left.localeCompare(right, undefined, { numeric: true })));
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(`Registered ${entries.length} clean catalog image(s) from ${batchPath}\n`);
