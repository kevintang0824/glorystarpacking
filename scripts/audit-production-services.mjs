import process from "node:process";

const siteOrigin = new URL(process.argv[2] || "https://glorystarpacking.com").origin;
const expectedCommit = process.argv.find((argument) => argument.startsWith("--commit="))?.slice("--commit=".length);
const healthUrl = `${siteOrigin}/api/health`;

let response;
try {
  response = await fetch(healthUrl, {
    headers: {
      accept: "application/json",
      "user-agent": "GloryStarPackProductionAudit/1.0",
    },
  });
} catch (error) {
  console.error(`${healthUrl}: ${error.message}`);
  process.exit(1);
}

const payload = await response.json().catch(() => ({}));
const noStore = (response.headers.get("cache-control") || "").toLowerCase().includes("no-store");
const emailConfigured = payload.services?.quoteEmail?.configured === true;
const commitMatches = !expectedCommit || payload.release?.commit === expectedCommit;

if (response.status !== 200 || !payload.ok || !emailConfigured || !noStore || !commitMatches) {
  console.error("Production service audit failed:");
  console.error(`- Health endpoint: HTTP ${response.status}`);
  console.error(`- Quote email configured: ${emailConfigured ? "yes" : "no"}`);
  console.error(`- Cache-Control no-store: ${noStore ? "yes" : "no"}`);
  if (!commitMatches) console.error(`- Deployed commit: ${payload.release?.commit || "unknown"}; expected ${expectedCommit}`);
  process.exit(1);
}

console.log(`Production service audit passed: ${healthUrl} reports quote email delivery configured with no-store caching.`);
if (expectedCommit) console.log(`Deployed revision verified: ${expectedCommit}`);
