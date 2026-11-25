import { spawnSync } from "node:child_process";
import fs from "node:fs";

const run = (command, args) => {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
};
const wrangler = "tmp/cloudflare-tools/node_modules/wrangler/bin/wrangler.js";
if (!fs.existsSync(wrangler)) run("npm", ["install", "--prefix", "tmp/cloudflare-tools", "--no-audit", "--no-fund", "wrangler@4.168.0"]);
for (const script of ["validate-site.mjs", "test-quote-api.mjs", "test-service-health.mjs", "test-cloudflare-release-comparison.mjs", "build-cloudflare.mjs", "compile-cloudflare-worker.mjs", "test-cloudflare-worker.mjs"]) run(process.execPath, [`scripts/${script}`]);
if (process.argv.includes("--build-only")) process.exit(0);
run(process.execPath, [wrangler, "pages", "deploy", "dist/cloudflare", "--project-name", "glorystarpacking", "--branch", "main", ...process.argv.slice(2)]);
