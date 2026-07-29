import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const handler = require("../api/quote.js");

const originalFetch = globalThis.fetch;
const originalEnvironment = {
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  QUOTE_FROM_EMAIL: process.env.QUOTE_FROM_EMAIL,
  QUOTE_TO_EMAIL: process.env.QUOTE_TO_EMAIL,
};

process.env.RESEND_API_KEY = "test-key";
process.env.QUOTE_FROM_EMAIL = "Website <quotes@example.com>";
process.env.QUOTE_TO_EMAIL = "sales@example.com";

let lastEmailRequest;
globalThis.fetch = async (_url, options = {}) => {
  lastEmailRequest = JSON.parse(options.body || "{}");
  return {
    ok: true,
    status: 200,
    json: async () => ({ id: "test-email-id" }),
  };
};

const validQuote = {
  name: "Test buyer",
  email: "buyer@example.com",
  product: "custom-wine-boxes",
  quantity: "1000",
  country: "United States",
  targetDate: "October 2026",
  sourcePage: "/custom-wine-boxes.html",
  landingPage: "/custom-wine-boxes.html?utm_source=chatgpt.com&utm_medium=referral",
  referrer: "https://chatgpt.com/",
  utmSource: "chatgpt.com",
  utmMedium: "referral",
};

const invoke = async (body, method = "POST") => {
  const result = {
    headers: new Map(),
    statusCode: 200,
    payload: null,
  };
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

  await handler({ method, body }, response);
  return result;
};

try {
  const valid = await invoke(validQuote);
  assert.equal(valid.statusCode, 200);
  assert.equal(valid.headers.get("cache-control"), "no-store");
  assert.match(lastEmailRequest.text, /UTM source: chatgpt\.com/);
  assert.match(lastEmailRequest.text, /Landing page: \/custom-wine-boxes\.html/);

  const missingCountry = await invoke({ ...validQuote, country: "" });
  assert.equal(missingCountry.statusCode, 400);

  const validPdf = await invoke({
    ...validQuote,
    attachment: {
      filename: "dieline.pdf",
      contentType: "application/pdf",
      content: Buffer.from("%PDF-1.7\nTest file").toString("base64"),
    },
  });
  assert.equal(validPdf.statusCode, 200);

  const unsupported = await invoke({
    ...validQuote,
    attachment: {
      filename: "reference.exe",
      contentType: "application/octet-stream",
      content: Buffer.from("MZ").toString("base64"),
    },
  });
  assert.equal(unsupported.statusCode, 415);

  const fakePng = await invoke({
    ...validQuote,
    attachment: {
      filename: "reference.png",
      contentType: "image/png",
      content: Buffer.from("not a PNG").toString("base64"),
    },
  });
  assert.equal(fakePng.statusCode, 415);

  const malformedBase64 = await invoke({
    ...validQuote,
    attachment: {
      filename: "reference.pdf",
      contentType: "application/pdf",
      content: "not%%%base64",
    },
  });
  assert.equal(malformedBase64.statusCode, 415);

  const wrongMethod = await invoke({}, "GET");
  assert.equal(wrongMethod.statusCode, 405);
  assert.equal(wrongMethod.headers.get("allow"), "POST");

  console.log("Quote API tests passed: valid request/PDF, attribution, required country, file allowlist, signature, Base64, no-store, and method guard.");
} finally {
  globalThis.fetch = originalFetch;
  Object.entries(originalEnvironment).forEach(([name, value]) => {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  });
}
