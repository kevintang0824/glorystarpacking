import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const handler = require("../api/health.js");

const originalEnvironment = {
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  QUOTE_FROM_EMAIL: process.env.QUOTE_FROM_EMAIL,
  QUOTE_TO_EMAIL: process.env.QUOTE_TO_EMAIL,
};

const invoke = async (method = "GET") => {
  const result = { headers: new Map(), statusCode: 200, payload: null };
  const response = {
    setHeader(name, value) {
      result.headers.set(name.toLowerCase(), value);
    },
    status(statusCode) {
      result.statusCode = statusCode;
      return response;
    },
    json(payload) {
      result.payload = payload;
      return result;
    },
  };

  await handler({ method }, response);
  return result;
};

try {
  delete process.env.RESEND_API_KEY;
  delete process.env.QUOTE_FROM_EMAIL;
  delete process.env.QUOTE_TO_EMAIL;

  const unconfigured = await invoke();
  assert.equal(unconfigured.statusCode, 503);
  assert.equal(unconfigured.payload.ok, false);
  assert.equal(unconfigured.payload.services.quoteEmail.configured, false);
  assert.equal(unconfigured.headers.get("cache-control"), "no-store");

  process.env.RESEND_API_KEY = "test-key";
  process.env.QUOTE_FROM_EMAIL = "Website <quotes@example.com>";
  process.env.QUOTE_TO_EMAIL = "sales@example.com";

  const configured = await invoke();
  assert.equal(configured.statusCode, 200);
  assert.equal(configured.payload.ok, true);
  assert.equal(configured.payload.services.quoteEmail.configured, true);

  const wrongMethod = await invoke("POST");
  assert.equal(wrongMethod.statusCode, 405);
  assert.equal(wrongMethod.headers.get("allow"), "GET");

  console.log("Service health tests passed: configured, unconfigured, no-store, and method guard states are correct.");
} finally {
  Object.entries(originalEnvironment).forEach(([name, value]) => {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  });
}
