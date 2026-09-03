import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const root = path.resolve(process.cwd());
const referenceOutput = path.resolve(process.argv[2] || ".vercel/output");
const validator = path.join(root, "scripts", "validate-build-output.mjs");

if (!fs.existsSync(path.join(referenceOutput, "config.json"))) {
  throw new Error(`Provide a complete Vercel Build Output directory: ${referenceOutput}`);
}

const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "glorystar-build-output-test-"));
try {
  fs.cpSync(referenceOutput, fixtureRoot, { recursive: true });
  for (const functionName of ["health", "quote"]) {
    fs.copyFileSync(
      path.join(root, "api", `${functionName}.js`),
      path.join(fixtureRoot, "functions", "api", `${functionName}.func`, "api", `${functionName}.js`)
    );
  }

  execFileSync(process.execPath, [validator, fixtureRoot], { cwd: root, stdio: "pipe" });

  const unexpectedStaticFile = path.join(fixtureRoot, "static", "tmp", "internal-audit.json");
  fs.mkdirSync(path.dirname(unexpectedStaticFile), { recursive: true });
  fs.writeFileSync(unexpectedStaticFile, "{}\n");
  let unexpectedOutput = "";
  try {
    execFileSync(process.execPath, [validator, fixtureRoot], { cwd: root, stdio: "pipe" });
  } catch (error) {
    unexpectedOutput = String(error.stderr);
  }
  assert.match(unexpectedOutput, /Unexpected static file: tmp\/internal-audit\.json/);
  fs.rmSync(path.join(fixtureRoot, "static", "tmp"), { recursive: true, force: true });

  const quoteBundle = path.join(fixtureRoot, "functions", "api", "quote.func", "api", "quote.js");
  const healthConfig = path.join(fixtureRoot, "functions", "api", "health.func", ".vc-config.json");
  const originalHealthConfig = fs.readFileSync(healthConfig, "utf8");
  fs.writeFileSync(quoteBundle, "module.exports = () => {};\n");
  let staleOutput = "";
  try {
    execFileSync(process.execPath, [validator, fixtureRoot], { cwd: root, stdio: "pipe" });
  } catch (error) {
    staleOutput = String(error.stderr);
  }
  assert.match(staleOutput, /Function source mismatch: api\/quote/);

  fs.writeFileSync(healthConfig, "{");
  let invalidConfigOutput = "";
  try {
    execFileSync(process.execPath, [validator, fixtureRoot], { cwd: root, stdio: "pipe" });
  } catch (error) {
    invalidConfigOutput = String(error.stderr);
  }
  assert.match(invalidConfigOutput, /Function config is not valid JSON: api\/health/);

  fs.writeFileSync(healthConfig, originalHealthConfig);
  fs.renameSync(quoteBundle, `${quoteBundle}.missing`);
  let missingBundleOutput = "";
  try {
    execFileSync(process.execPath, [validator, fixtureRoot], { cwd: root, stdio: "pipe" });
  } catch (error) {
    missingBundleOutput = String(error.stderr);
  }
  assert.match(missingBundleOutput, /Missing function handler bundle: api\/quote/);

  console.log("Build output validation tests passed: current handlers, unexpected static file rejection, stale handler rejection, invalid function config rejection, and missing handler bundle rejection.");
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}
