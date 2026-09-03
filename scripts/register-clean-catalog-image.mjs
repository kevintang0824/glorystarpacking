import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const [productId, inputImage, sourcePositionArgument = "1", method = "AI-assisted removal of legacy storefront URL and third-party branding"] = process.argv.slice(2);
if (!/^\d+$/.test(productId || "")) throw new Error("A numeric product ID is required");
if (!inputImage) throw new Error("An input image path is required");
const sourceImagePosition = Number(sourcePositionArgument);
if (!Number.isInteger(sourceImagePosition) || sourceImagePosition < 1) throw new Error("Source position must be a positive integer");

const projectRoot = path.resolve(import.meta.dirname, "..");
const cleanSourceRoot = path.join(projectRoot, "assets", "catalog", "clean-sources");
const manifestPath = path.join(cleanSourceRoot, "manifest.json");
const outputName = `${productId}.jpg`;
const outputPath = path.join(cleanSourceRoot, outputName);
await fs.mkdir(cleanSourceRoot, { recursive: true });
await fs.access(inputImage);

await new Promise((resolve, reject) => {
  const child = spawn("sips", [
    "--resampleHeightWidthMax", "1200",
    "--setProperty", "format", "jpeg",
    "--setProperty", "formatOptions", "88",
    inputImage,
    "--out", outputPath,
  ], { stdio: ["ignore", "ignore", "pipe"] });
  let stderr = "";
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  child.on("error", reject);
  child.on("close", (code) => code === 0 ? resolve() : reject(new Error(stderr.trim() || `sips exited ${code}`)));
});

let manifest = { version: "legacy-brand-cleanup-20260827", products: {} };
try {
  manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
manifest.products ||= {};
manifest.products[productId] = {
  file: outputName,
  sourceImagePosition,
  method,
};
manifest.products = Object.fromEntries(Object.entries(manifest.products).sort(([left], [right]) => left.localeCompare(right, undefined, { numeric: true })));
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(`${productId}: ${outputPath}\n`);
