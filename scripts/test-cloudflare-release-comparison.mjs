import assert from "node:assert/strict";
import { normalizeCloudflareEmailObfuscation as normalize } from "./normalize-cloudflare-html.mjs";

const email = "kevin@GloryStarPack.com";
const encode = (key) => Buffer.from([key, ...Buffer.from(email)].map((byte, index) => index ? byte ^ key : byte)).toString("hex");
const source = `<h1>Buyer guide</h1><a href="mailto:${email}">${email}</a><a href="mailto:${email}" aria-label="Email">Icon</a>`;
for (const key of [1, 127, 255]) {
  const anchor = encode(key);
  const text = encode(256 - key);
  const live = `<h1>Buyer guide</h1><a href="/cdn-cgi/l/email-protection#${anchor}"><span class="__cf_email__" data-cfemail="${text}">[email&#160;protected]</span></a><a href="/cdn-cgi/l/email-protection#${anchor}" aria-label="Email">Icon</a><script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script>`;
  assert.equal(normalize(live), source);
  assert.notEqual(normalize(live.replace("Buyer guide", "Stale guide")), source);
  assert.notEqual(normalize(live.replace("Icon", "Different content")), source);
}
assert.equal(normalize(source), source);
const invalid = '<a href="/cdn-cgi/l/email-protection#00ff">[email protected]</a>';
assert.equal(normalize(invalid), invalid);
const otherScript = '<script src="/cdn-cgi/scripts/5c5dd728/other.js"></script>';
assert.equal(normalize(otherScript), otherScript);
console.log("Release comparison tests passed: documented email rewrite only; stale content, unrelated scripts and malformed encodings remain detectable.");
