import assert from "node:assert/strict";
import fs from "node:fs";

const { default: worker } = await import(`data:text/javascript;base64,${fs.readFileSync("dist/cloudflare/_worker.js").toString("base64")}`);
const originalFetch = globalThis.fetch;
let emails = [];
globalThis.fetch = async (url, options) => {
  assert.equal(url, "https://api.resend.com/emails");
  emails.push(JSON.parse(options.body));
  return Response.json({ id: "migration-test-email" });
};
const env = {
  RESEND_API_KEY: "test-key",
  QUOTE_FROM_EMAIL: "Quotes <quotes@example.com>",
  QUOTE_TO_EMAIL: "sales@example.com",
  ASSETS: {
    fetch: async (request) => new Response(new URL(request.url).pathname, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }),
  },
};
const valid = { name: "Migration test", email: "buyer@example.com", product: "mailer-boxes", quantity: "500", country: "China", sourcePage: "/fr/custom-mailer-boxes.html" };
const post = (host, body, origin = `https://${host}`, media = "application/json") => worker.fetch(new Request(`https://${host}/api/quote`, {
  method: "POST",
  headers: { "Content-Type": media, Origin: origin, "Sec-Fetch-Site": "same-origin" },
  body: media === "application/json" ? JSON.stringify(body) : new URLSearchParams(body),
}), env);
try {
  const success = await post("glorystarpacking.com", valid);
  assert.equal(success.status, 200);
  assert.equal((await success.json()).id, "migration-test-email");
  assert.equal(success.headers.get("Cache-Control"), "no-store");
  assert.equal(emails[0].to[0], env.QUOTE_TO_EMAIL);
  assert.equal((await post("glorystarpacking.com", valid, "https://evil.example")).status, 403);
  assert.equal(emails.length, 1);
  assert.equal((await post("glorystarpacking.pages.dev", valid)).status, 200);
  const native = await post("glorystarpacking.com", valid, "https://glorystarpacking.com", "application/x-www-form-urlencoded");
  assert.equal(native.status, 200);
  assert.match(await native.text(), /<html lang="fr"/);
  assert.equal((await worker.fetch(new Request("https://glorystarpacking.com/api/health"), env)).status, 200);
  assert.equal((await worker.fetch(new Request("https://glorystarpacking.com/api/health"), { ...env, RESEND_API_KEY: undefined })).status, 503);
  const page = await worker.fetch(new Request("https://glorystarpacking.com/about.html?ref=keep"), env);
  assert.equal(page.status, 200);
  assert.equal(await page.text(), "/about");
  assert.ok(page.headers.get("Content-Security-Policy"));
  const language = await worker.fetch(new Request("https://glorystarpacking.com/fr"), env);
  assert.equal(await language.text(), "/fr/");
  const www = await worker.fetch(new Request("https://www.glorystarpacking.com/about.html?ref=keep"), env);
  assert.equal(www.status, 308);
  assert.equal(www.headers.get("Location"), "https://glorystarpacking.com/about.html?ref=keep");
  const wwwIndex = await worker.fetch(new Request("https://www.glorystarpacking.com/index.html?ref=keep"), env);
  assert.equal(wwwIndex.status, 308);
  assert.equal(wwwIndex.headers.get("Location"), "https://glorystarpacking.com/?ref=keep");
  const validationPath = "/.well-known/acme-challenge/test-validation-token";
  const validation = await worker.fetch(new Request(`http://www.glorystarpacking.com${validationPath}`), env);
  assert.equal(validation.status, 200);
  assert.equal(validation.headers.get("Location"), null);
  assert.equal(await validation.text(), validationPath);
  assert.ok(JSON.parse(fs.readFileSync("dist/cloudflare/_routes.json", "utf8")).exclude.includes("/.well-known/acme-challenge/*"));
  const canonical = await worker.fetch(new Request("https://glorystarpacking.com/about?ref=keep"), env);
  assert.equal(canonical.headers.get("Location"), "https://glorystarpacking.com/about.html?ref=keep");
  const preview = await worker.fetch(new Request("https://test.glorystarpacking.pages.dev/about.html"), env);
  assert.equal(preview.headers.get("X-Robots-Tag"), "noindex, nofollow");
  const oversized = await worker.fetch(new Request("https://glorystarpacking.com/api/quote", {
    method: "POST", headers: { "Content-Type": "application/json", "Content-Length": "5000000" }, body: "{}",
  }), env);
  assert.equal(oversized.status, 413);
  assert.equal((await worker.fetch(new Request("https://glorystarpacking.com/api/quote.js"), env)).status, 404);
  console.log("Cloudflare worker tests passed: mail adapter, native French result, origin guards, Pages origin, injected secrets, health, exact HTML/language paths, canonical/query redirects, ACME validation passthrough, preview noindex, request limit and API source protection.");
} finally {
  globalThis.fetch = originalFetch;
}
