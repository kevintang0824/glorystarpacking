import { execFileSync } from "node:child_process";

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const local = git("rev-parse", "HEAD");
const remote = git("ls-remote", "origin", "refs/heads/main").split(/\s+/)[0];
if (!/^[a-f0-9]{40}$/i.test(remote)) throw new Error("Cannot determine GitHub main revision");
const dirty = git("status", "--porcelain").split("\n").filter(Boolean).length;
let synchronized = local === remote && dirty === 0;
console.log(`Local HEAD: ${local}${dirty ? ` (${dirty} uncommitted path(s))` : ""}`);
console.log(`GitHub main: ${remote}${local === remote ? " (matches local commit)" : " (differs from local commit)"}`);
try {
  const response = await fetch("https://glorystarpacking.pages.dev/api/health", { cache: "no-store", signal: AbortSignal.timeout(20000) });
  const body = await response.json();
  const matches = response.ok && body.ok && body.release?.commit === remote;
  synchronized &&= matches;
  console.log(`Cloudflare: ${body.release?.commit || "unknown revision"} (HTTP ${response.status}; ${matches ? "matches GitHub" : "not verified against GitHub"})`);
} catch (error) {
  synchronized = false;
  console.log(`Cloudflare: ${error.message}`);
}
try {
  const result = JSON.parse(execFileSync("gh", ["api", `repos/kevintang0824/glorystarpacking/commits/${remote}/status`], { encoding: "utf8" }));
  const status = result.statuses.find((entry) => entry.context === "Vercel");
  synchronized &&= status?.state === "success";
  console.log(`Vercel GitHub deployment check: ${status?.state || "missing"} — ${status?.description || "No deployment result for this revision"}`);
  if (status?.target_url) console.log(`Vercel details: ${status.target_url}`);
} catch (error) {
  synchronized = false;
  console.log(`Vercel check could not be read: ${error.message}`);
}
console.log(synchronized ? "All committed release checks match." : "Synchronization is incomplete; see the pending state(s) above.");
if (!synchronized) process.exitCode = 1;
