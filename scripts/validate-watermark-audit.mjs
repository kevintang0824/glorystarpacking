import fs from "node:fs";
import path from "node:path";

const reportPath = path.resolve(process.argv[2] || "/private/tmp/glorystar-watermark-final.json");
const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
const matches = Array.isArray(report.matches) ? report.matches : [];
const failures = Array.isArray(report.failures) ? report.failures : [];
const expectedMinimum = 2100;

if (Number(report.scanned || 0) < expectedMinimum) {
  throw new Error(`Watermark audit scanned ${report.scanned || 0} images; expected at least ${expectedMinimum}`);
}
if (failures.length > 0) {
  throw new Error(`Watermark audit has ${failures.length} OCR failure(s): ${failures.slice(0, 5).join(" | ")}`);
}
if (matches.length > 0) {
  throw new Error(`Legacy storefront branding remains in ${matches.length} image(s): ${matches.slice(0, 10).map((match) => match.path).join(", ")}`);
}

process.stdout.write(`Legacy-brand watermark audit passed: ${report.scanned} published images scanned with 0 matches and 0 OCR failures\n`);
