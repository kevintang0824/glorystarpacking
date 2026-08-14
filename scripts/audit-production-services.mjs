import process from "node:process";

const siteOrigin = new URL(process.argv[2] || "https://glorystarpacking.com").origin;
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

if (response.status !== 200 || !payload.ok || !emailConfigured || !noStore) {
  console.error("Production service audit failed:");
  console.error(`- Health endpoint: HTTP ${response.status}`);
  console.error(`- Quote email configured: ${emailConfigured ? "yes" : "no"}`);
  console.error(`- Cache-Control no-store: ${noStore ? "yes" : "no"}`);
  process.exit(1);
}

console.log(`Production service audit passed: ${healthUrl} reports quote email delivery configured with no-store caching.`);
