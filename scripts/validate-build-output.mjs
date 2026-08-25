import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const sourceRoot = process.cwd();
const outputRoot = path.resolve(process.argv[2] || ".vercel/output");
const staticRoot = path.join(outputRoot, "static");
const errors = [];
const expectedFiles = new Set();

const conflictCopyPattern = / \d+\.(?:html|webmanifest)$/i;
const requiredRootFiles = ["robots.txt", "sitemap.xml", "feed.xml", "llms.txt", "site.webmanifest"];

const relativePath = (filePath) => path.relative(sourceRoot, filePath).split(path.sep).join("/");

const addExpectedFile = (filePath) => {
  const relative = relativePath(filePath);
  if (!relative || relative.startsWith("../")) {
    errors.push(`Source file is outside the repository: ${filePath}`);
    return;
  }
  expectedFiles.add(relative);
};

const walkFiles = (directory) => {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(entryPath));
    else if (entry.isFile()) files.push(entryPath);
  }
  return files;
};

const digest = (filePath) => createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
const contentVersion = (filePath) => digest(filePath).slice(0, 12);

if (!fs.existsSync(outputRoot) || !fs.statSync(outputRoot).isDirectory()) {
  errors.push(`Build output directory is missing: ${outputRoot}`);
}

const outputConfig = path.join(outputRoot, "config.json");
if (!fs.existsSync(outputConfig)) {
  errors.push(`Missing Build Output config: ${outputConfig}`);
} else {
  try {
    JSON.parse(fs.readFileSync(outputConfig, "utf8"));
  } catch (error) {
    errors.push(`Build Output config is not valid JSON: ${error.message}`);
  }
}

if (!fs.existsSync(staticRoot) || !fs.statSync(staticRoot).isDirectory()) {
  errors.push(`Missing static output directory: ${staticRoot}`);
}

const rootEntries = fs.readdirSync(sourceRoot, { withFileTypes: true });
const ignoredConflictCopies = rootEntries
  .filter((entry) => entry.isFile() && conflictCopyPattern.test(entry.name))
  .map((entry) => entry.name)
  .sort();

rootEntries
  .filter((entry) => entry.isFile() && entry.name.endsWith(".html") && !conflictCopyPattern.test(entry.name))
  .forEach((entry) => addExpectedFile(path.join(sourceRoot, entry.name)));

for (const fileName of requiredRootFiles) {
  const filePath = path.join(sourceRoot, fileName);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    errors.push(`Required public source file is missing: ${fileName}`);
  } else {
    addExpectedFile(filePath);
  }
}

rootEntries
  .filter((entry) => entry.isFile() && /^[a-f0-9]{32}\.txt$/i.test(entry.name))
  .forEach((entry) => addExpectedFile(path.join(sourceRoot, entry.name)));

const assetsRoot = path.join(sourceRoot, "assets");
if (!fs.existsSync(assetsRoot) || !fs.statSync(assetsRoot).isDirectory()) {
  errors.push("Required public assets directory is missing: assets");
} else {
  walkFiles(assetsRoot).forEach(addExpectedFile);
}

let verifiedFunctions = 0;
for (const functionName of ["health", "quote"]) {
  const functionRoot = path.join(outputRoot, "functions", "api", `${functionName}.func`);
  const functionConfig = path.join(functionRoot, ".vc-config.json");
  const sourceHandler = path.join(sourceRoot, "api", `${functionName}.js`);
  if (!fs.existsSync(functionConfig) || !fs.statSync(functionConfig).isFile()) {
    errors.push(`Missing built API function: api/${functionName}`);
    continue;
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(functionConfig, "utf8"));
  } catch (error) {
    errors.push(`Function config is not valid JSON: api/${functionName} (${error.message})`);
    continue;
  }

  const expectedHandler = `api/${functionName}.js`;
  if (!config || typeof config.handler !== "string" || config.handler !== expectedHandler) {
    errors.push(`Function handler is invalid: api/${functionName} (expected ${expectedHandler})`);
    continue;
  }

  const handlerPath = path.resolve(functionRoot, config.handler);
  if (!handlerPath.startsWith(`${functionRoot}${path.sep}`) || !fs.existsSync(handlerPath) || !fs.statSync(handlerPath).isFile()) {
    errors.push(`Missing function handler bundle: api/${functionName} (${config.handler})`);
    continue;
  }
  if (!fs.existsSync(sourceHandler) || !fs.statSync(sourceHandler).isFile()) {
    errors.push(`Missing source API handler: api/${functionName}`);
    continue;
  }
  if (digest(sourceHandler) !== digest(handlerPath)) {
    errors.push(`Function source mismatch: api/${functionName} (built handler is stale or altered)`);
    continue;
  }

  verifiedFunctions += 1;
}

let verifiedFiles = 0;
for (const relative of [...expectedFiles].sort()) {
  const sourceFile = path.join(sourceRoot, relative);
  const outputFile = path.join(staticRoot, relative);

  if (!fs.existsSync(outputFile) || !fs.statSync(outputFile).isFile()) {
    errors.push(`Missing static file: ${relative}`);
    continue;
  }

  const sourceSize = fs.statSync(sourceFile).size;
  const outputSize = fs.statSync(outputFile).size;
  if (sourceSize !== outputSize) {
    errors.push(`Size mismatch: ${relative} (source ${sourceSize} bytes, output ${outputSize} bytes)`);
    continue;
  }

  if (digest(sourceFile) !== digest(outputFile)) {
    errors.push(`Content mismatch: ${relative}`);
    continue;
  }

  verifiedFiles += 1;
}

const versionedAssets = ["site.css", "site.js", "analytics.js"];
for (const assetName of versionedAssets) {
  const sourceAsset = path.join(sourceRoot, "assets", assetName);
  if (!fs.existsSync(sourceAsset) || !fs.statSync(sourceAsset).isFile()) continue;

  const expectedVersion = contentVersion(sourceAsset);
  const escapedAssetName = assetName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const referencePattern = new RegExp(`(?:href|src)="/?assets/${escapedAssetName}\\?v=([^"]+)"`, "g");

  for (const relative of [...expectedFiles].filter((file) => file.endsWith(".html")).sort()) {
    const outputFile = path.join(staticRoot, relative);
    if (!fs.existsSync(outputFile) || !fs.statSync(outputFile).isFile()) continue;

    const html = fs.readFileSync(outputFile, "utf8");
    const versions = [...html.matchAll(referencePattern)].map((match) => match[1]);
    if (versions.length !== 1 || versions[0] !== expectedVersion) {
      errors.push(`${relative}: expected assets/${assetName} content version ${expectedVersion}`);
    }
  }
}

if (errors.length) {
  console.error(`Build output validation failed for ${outputRoot}: ${errors.length} issue(s).`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `Build output validation passed: ${verifiedFiles} public files (including ${[...expectedFiles].filter((file) => file.endsWith(".html")).length} HTML files), assets and ${verifiedFunctions} API handlers are complete and source-current.`
);
if (ignoredConflictCopies.length) {
  console.log(`Ignored ${ignoredConflictCopies.length} root conflict copy/copies: ${ignoredConflictCopies.join(", ")}`);
}
