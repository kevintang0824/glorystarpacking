import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const [auditPath, overridePath, outputDirectory, sourceRoot = "/Users/kevintang/Documents/HERMES/GLORYSTARWEAR-YOGA/finerpackaging"] = process.argv.slice(2);
if (!auditPath || !overridePath || !outputDirectory) {
  throw new Error("usage: prepare-url-clean-catalog audit.json overrides.json output-directory [source-root]");
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const cleanSourceRoot = path.join(projectRoot, "assets", "catalog", "clean-sources");
const activeManifest = JSON.parse(await fs.readFile(path.join(cleanSourceRoot, "manifest.json"), "utf8"));
const audit = JSON.parse(await fs.readFile(auditPath, "utf8"));
const overrides = JSON.parse(await fs.readFile(overridePath, "utf8"));
const hits = Array.isArray(audit.hits) ? audit.hits : [];
if (!hits.length) throw new Error("The audit has no product hits");

await fs.mkdir(outputDirectory, { recursive: true });

const primarySource = async (id) => {
  const directory = path.join(sourceRoot, "images", id);
  const names = (await fs.readdir(directory)).filter((name) => /^01_.*\.(?:jpe?g|png|webp)$/i.test(name));
  if (names.length !== 1) throw new Error(`${id}: expected one source primary image, found ${names.length}`);
  return path.join(directory, names[0]);
};

const runFfmpeg = (input, filter, output) => new Promise((resolve, reject) => {
  const child = spawn("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-i", input,
    "-vf", filter,
    "-frames:v", "1",
    output,
  ], { stdio: ["ignore", "ignore", "pipe"] });
  let stderr = "";
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  child.on("error", reject);
  child.on("close", (code) => code === 0 ? resolve() : reject(new Error(`${input}: ${stderr.trim() || `ffmpeg exited ${code}`}`)));
});

const entries = [];
for (const hit of hits) {
  const id = String(hit.id);
  if (activeManifest.products?.[id]) continue;
  const override = overrides[id];
  if (override?.input) await fs.access(override.input);
  entries.push({
    id,
    input: override?.input || await primarySource(id),
    filter: override?.filter || (override?.input ? null : "crop=iw:trunc(ih*0.955/2)*2:0:0"),
    sourceImagePosition: Number(override?.sourceImagePosition || 1),
    preparation: override?.preparation || (override?.input ? "provided-clean-edit" : "bottom-edge-url-trim"),
  });
}

let nextIndex = 0;
const worker = async () => {
  while (nextIndex < entries.length) {
    const entry = entries[nextIndex++];
    if (!entry.filter) {
      entry.preparedInput = entry.input;
      continue;
    }
    entry.preparedInput = path.join(outputDirectory, `${entry.id}.png`);
    await runFfmpeg(entry.input, entry.filter, entry.preparedInput);
  }
};
await Promise.all(Array.from({ length: Math.min(4, entries.length) }, worker));

const batchPath = path.join(outputDirectory, "batch.tsv");
await fs.writeFile(batchPath, `${entries.map((entry) => [entry.id, entry.preparedInput, entry.sourceImagePosition].join("\t")).join("\n")}\n`);
await fs.writeFile(path.join(outputDirectory, "provenance.json"), `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  auditPath,
  sourceRoot,
  skippedAlreadyClean: hits.length - entries.length,
  prepared: entries.map(({ id, input, preparedInput, filter, preparation, sourceImagePosition }) => ({
    id, input, preparedInput, filter, preparation, sourceImagePosition,
  })),
}, null, 2)}\n`);
process.stdout.write(`Prepared ${entries.length} URL-clean product image(s); batch: ${batchPath}\n`);
