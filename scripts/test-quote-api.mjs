import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const handler = require("../api/quote.js");

const originalFetch = globalThis.fetch;
const originalConsoleError = console.error;
const originalEnvironment = {
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  QUOTE_FROM_EMAIL: process.env.QUOTE_FROM_EMAIL,
  QUOTE_TO_EMAIL: process.env.QUOTE_TO_EMAIL,
  VERCEL_ENV: process.env.VERCEL_ENV,
};

process.env.RESEND_API_KEY = "test-key";
process.env.QUOTE_FROM_EMAIL = "Website <quotes@example.com>";
process.env.QUOTE_TO_EMAIL = "sales@example.com";
process.env.VERCEL_ENV = "production";

let lastEmailRequest;
let lastEmailOptions;
let emailRequestCount = 0;
let mockResendResponse = {
  ok: true,
  status: 200,
  json: async () => ({ id: "test-email-id" }),
};
globalThis.fetch = async (_url, options = {}) => {
  emailRequestCount += 1;
  lastEmailOptions = options;
  lastEmailRequest = JSON.parse(options.body || "{}");
  return mockResendResponse;
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
  discoveryChannel: "ai-search",
  discoverySource: "ChatGPT",
  utmSource: "chatgpt.com",
  utmMedium: "referral",
};

const invoke = async (body, method = "POST", headers = { "content-type": "application/json" }) => {
  const result = {
    headers: new Map(),
    statusCode: 200,
    payload: null,
    body: "",
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
    send(body) {
      result.body = String(body);
      return result;
    },
  };

  await handler({ method, body, headers }, response);
  return result;
};

try {
  const valid = await invoke(validQuote);
  assert.equal(valid.statusCode, 200);
  assert.equal(valid.headers.get("cache-control"), "no-store");
  assert.match(lastEmailRequest.text, /UTM source: chatgpt\.com/);
  assert.match(lastEmailRequest.text, /Discovery channel: ai-search/);
  assert.match(lastEmailRequest.text, /Discovery source: ChatGPT/);
  assert.match(lastEmailRequest.text, /Landing page: \/custom-wine-boxes\.html/);
  assert.equal(lastEmailOptions.signal instanceof AbortSignal, true);
  const validIdempotencyKey = lastEmailOptions.headers["Idempotency-Key"];
  assert.match(validIdempotencyKey, /^quote-[a-f0-9]{64}$/);

  const headerSafeQuote = await invoke({
    ...validQuote,
    name: "Test buyer\r\nBcc: victim@example.com",
    product: "custom-wine-boxes\nX-Test: injected",
  });
  assert.equal(headerSafeQuote.statusCode, 200);
  assert.equal(
    lastEmailRequest.subject,
    "New packaging quote — custom-wine-boxes X-Test: injected — Test buyer Bcc: victim@example.com"
  );
  assert.doesNotMatch(lastEmailRequest.subject, /[\r\n]/);

  const nativeForm = await invoke(
    new URLSearchParams({ ...validQuote, attachment: "reference.pdf" }).toString(),
    "POST",
    { "content-type": "application/x-www-form-urlencoded" }
  );
  assert.equal(nativeForm.statusCode, 200);
  assert.match(lastEmailRequest.text, /Name: Test buyer/);
  assert.equal(lastEmailRequest.attachments, undefined);
  assert.equal(nativeForm.headers.get("content-type"), "text/html; charset=utf-8");
  assert.match(nativeForm.body, /Quote request received/);
  assert.match(nativeForm.body, /href="\/custom-wine-boxes\.html#quote"/);
  assert.equal(lastEmailOptions.headers["Idempotency-Key"], validIdempotencyKey);

  const malformedJson = await invoke("{not-json", "POST", { "content-type": "application/json" });
  assert.equal(malformedJson.statusCode, 400);

  const unsupportedContentType = await invoke(validQuote, "POST", { "content-type": "text/plain" });
  assert.equal(unsupportedContentType.statusCode, 415);
  assert.equal(unsupportedContentType.payload.error, "Use a JSON or form-urlencoded request body.");

  const emailRequestsBeforeCrossSiteRequests = emailRequestCount;
  const crossSiteJson = await invoke(validQuote, "POST", {
    "content-type": "application/json",
    origin: "https://attacker.example",
    "sec-fetch-site": "cross-site",
  });
  assert.equal(crossSiteJson.statusCode, 403);
  assert.equal(emailRequestCount, emailRequestsBeforeCrossSiteRequests);

  const crossSiteNative = await invoke(
    new URLSearchParams(validQuote).toString(),
    "POST",
    { "content-type": "application/x-www-form-urlencoded", "sec-fetch-site": "cross-site" }
  );
  assert.equal(crossSiteNative.statusCode, 403);
  assert.equal(crossSiteNative.headers.get("content-type"), "text/html; charset=utf-8");
  assert.equal(emailRequestCount, emailRequestsBeforeCrossSiteRequests);

  const sameOrigin = await invoke(validQuote, "POST", {
    "content-type": "application/json",
    origin: "https://glorystarpacking.com",
    "sec-fetch-site": "same-origin",
  });
  assert.equal(sameOrigin.statusCode, 200);

  const emailRequestsBeforeOriginRejections = emailRequestCount;
  const httpProductionOrigin = await invoke(validQuote, "POST", {
    "content-type": "application/json",
    host: "glorystarpacking.com",
    origin: "http://glorystarpacking.com",
    "sec-fetch-site": "same-origin",
  });
  assert.equal(httpProductionOrigin.statusCode, 403);
  assert.equal(emailRequestCount, emailRequestsBeforeOriginRejections);

  const productionAliasOrigin = await invoke(validQuote, "POST", {
    "content-type": "application/json",
    host: "glorystarpacking-production.vercel.app",
    origin: "https://glorystarpacking-production.vercel.app",
    "sec-fetch-site": "same-origin",
  });
  assert.equal(productionAliasOrigin.statusCode, 403);
  assert.equal(emailRequestCount, emailRequestsBeforeOriginRejections);

  process.env.VERCEL_ENV = "preview";
  const previewOrigin = await invoke(validQuote, "POST", {
    "content-type": "application/json",
    host: "glorystarpacking-preview.vercel.app",
    origin: "https://glorystarpacking-preview.vercel.app",
    "sec-fetch-site": "same-origin",
  });
  assert.equal(previewOrigin.statusCode, 200);

  const httpPreviewOrigin = await invoke(validQuote, "POST", {
    "content-type": "application/json",
    host: "glorystarpacking-preview.vercel.app",
    origin: "http://glorystarpacking-preview.vercel.app",
    "sec-fetch-site": "same-origin",
  });
  assert.equal(httpPreviewOrigin.statusCode, 403);

  process.env.VERCEL_ENV = "development";
  const localDevelopmentOrigin = await invoke(validQuote, "POST", {
    "content-type": "application/json",
    host: "localhost:3000",
    origin: "http://localhost:3000",
    "sec-fetch-site": "same-origin",
  });
  assert.equal(localDevelopmentOrigin.statusCode, 200);
  process.env.VERCEL_ENV = "production";

  const invalidOrigin = await invoke(validQuote, "POST", {
    "content-type": "application/json",
    host: "glorystarpacking.com",
    origin: "not a valid origin",
  });
  assert.equal(invalidOrigin.statusCode, 403);

  const missingCountry = await invoke({ ...validQuote, country: "" });
  assert.equal(missingCountry.statusCode, 400);

  const emailRequestsBeforeInvalidTextFields = emailRequestCount;
  for (const field of [
    "name", "email", "phone", "product", "quantity", "dimensions", "country", "targetDate", "details", "website",
    "sourcePage", "landingPage", "referrer", "discoveryChannel", "discoverySource", "utmSource", "utmMedium", "utmCampaign", "utmTerm", "utmContent",
  ]) {
    const invalidTextField = await invoke({ ...validQuote, [field]: { invalid: true } });
    assert.equal(invalidTextField.statusCode, 400, `${field} object value must be rejected`);
    assert.equal(emailRequestCount, emailRequestsBeforeInvalidTextFields, `${field} object value must not call Resend`);
  }

  const nullAttachment = await invoke({ ...validQuote, attachment: null });
  assert.equal(nullAttachment.statusCode, 200);

  const emailRequestsBeforeMalformedAttachments = emailRequestCount;
  for (const [label, attachment] of [
    ["string", "reference.pdf"],
    ["array", []],
    ["empty object", {}],
    ["missing content", { filename: "reference.pdf", contentType: "application/pdf" }],
    ["missing content type", { filename: "reference.pdf", content: Buffer.from("%PDF-1.7").toString("base64") }],
    ["non-string fields", { filename: 1, contentType: {}, content: [] }],
  ]) {
    const malformedAttachment = await invoke({ ...validQuote, attachment });
    assert.equal(malformedAttachment.statusCode, 415, `${label} JSON attachment must be rejected`);
    assert.equal(emailRequestCount, emailRequestsBeforeMalformedAttachments, `${label} JSON attachment must not call Resend`);
  }

  const validPdf = await invoke({
    ...validQuote,
    attachment: {
      filename: "dieline.pdf",
      contentType: "application/pdf",
      content: Buffer.from("%PDF-1.7\nTest file").toString("base64"),
    },
  });
  assert.equal(validPdf.statusCode, 200);
  assert.notEqual(lastEmailOptions.headers["Idempotency-Key"], validIdempotencyKey);

  const providerErrorLogs = [];
  console.error = (...parts) => providerErrorLogs.push(parts.join(" "));
  mockResendResponse = {
    ok: false,
    status: 400,
    json: async () => ({ message: "Rejected buyer@example.com payload" }),
  };
  const providerFailure = await invoke(validQuote);
  assert.equal(providerFailure.statusCode, 502);
  assert.equal(providerFailure.payload.error, "Email delivery is temporarily unavailable.");

  mockResendResponse = {
    ok: true,
    status: 202,
    json: async () => {
      throw new SyntaxError("Unexpected end of JSON input");
    },
  };
  const invalidSuccessJson = await invoke(validQuote);
  assert.equal(invalidSuccessJson.statusCode, 502);
  assert.equal(invalidSuccessJson.payload.error, "Email delivery is temporarily unavailable.");

  mockResendResponse = {
    ok: true,
    status: 202,
    json: async () => ({}),
  };
  const missingSuccessId = await invoke(validQuote);
  assert.equal(missingSuccessId.statusCode, 502);
  assert.equal(missingSuccessId.payload.error, "Email delivery is temporarily unavailable.");
  console.error = originalConsoleError;
  assert.equal(providerErrorLogs.length, 3);
  assert.equal(providerErrorLogs[0], "Resend quote error 400");
  assert.doesNotMatch(providerErrorLogs[0], /buyer@example\.com/);
  assert.match(providerErrorLogs[1], /not valid JSON/);
  assert.match(providerErrorLogs[2], /missing an email ID/);

  mockResendResponse = {
    ok: true,
    status: 200,
    json: async () => ({ id: "test-email-id" }),
  };

  const emailRequestsBeforeMissingRecipient = emailRequestCount;
  delete process.env.QUOTE_TO_EMAIL;
  const missingRecipient = await invoke(validQuote);
  assert.equal(missingRecipient.statusCode, 503);
  assert.equal(missingRecipient.payload.code, "EMAIL_NOT_CONFIGURED");
  assert.equal(emailRequestCount, emailRequestsBeforeMissingRecipient);
  process.env.QUOTE_TO_EMAIL = "sales@example.com";

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

  delete process.env.RESEND_API_KEY;
  delete process.env.QUOTE_FROM_EMAIL;
  const unconfigured = await invoke(validQuote);
  assert.equal(unconfigured.statusCode, 503);
  assert.equal(unconfigured.payload.code, "EMAIL_NOT_CONFIGURED");

  const emailRequestsBeforeUnconfiguredMalformedAttachment = emailRequestCount;
  const unconfiguredMalformedAttachment = await invoke({
    ...validQuote,
    attachment: { filename: "reference.pdf", contentType: "application/pdf" },
  });
  assert.equal(unconfiguredMalformedAttachment.statusCode, 415);
  assert.equal(emailRequestCount, emailRequestsBeforeUnconfiguredMalformedAttachment);

  const nativeUnconfigured = await invoke(
    new URLSearchParams(validQuote).toString(),
    "POST",
    { "content-type": "application/x-www-form-urlencoded" }
  );
  assert.equal(nativeUnconfigured.statusCode, 503);
  assert.match(nativeUnconfigured.body, /Quote request not sent/);
  assert.match(nativeUnconfigured.body, /href="\/custom-wine-boxes\.html#quote"/);
  assert.match(nativeUnconfigured.body, /mailto:kevin@GloryStarPack\.com/);
  assert.match(nativeUnconfigured.body, /https:\/\/wa\.me\/8618020755949/);
  assert.match(nativeUnconfigured.body, /Complete project brief/);
  assert.match(nativeUnconfigured.body, /Test%20buyer/);

  const nativeEscapedBrief = await invoke(
    new URLSearchParams({ ...validQuote, details: '<img src=x onerror="alert(1)">', sourcePage: "/not-a-quote-form.html" }).toString(),
    "POST",
    { "content-type": "application/x-www-form-urlencoded" }
  );
  assert.match(nativeEscapedBrief.body, /href="\/#quote"/);
  assert.match(nativeEscapedBrief.body, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
  assert.doesNotMatch(nativeEscapedBrief.body, /<img src=x onerror=/);

  const nativeLongBrief = await invoke(
    new URLSearchParams({ ...validQuote, product: "测".repeat(120), details: "测".repeat(3000) }).toString(),
    "POST",
    { "content-type": "application/x-www-form-urlencoded" }
  );
  const mailtoHref = nativeLongBrief.body.match(/href="(mailto:[^"]+)"/)?.[1].replace(/&amp;/g, "&") || "";
  const whatsAppHref = nativeLongBrief.body.match(/href="(https:\/\/wa\.me\/8618020755949\?text=[^"]+)"/)?.[1] || "";
  assert.ok(mailtoHref.length > 0 && mailtoHref.length <= 1900);
  assert.ok(whatsAppHref.length > 0 && whatsAppHref.length <= 1900);
  assert.match(nativeLongBrief.body, /Direct channels may contain a shortened brief/);

  const emojiProduct = `${"💥".repeat(59)}${"测".repeat(62)}`;
  const nativeEmojiSubject = await invoke(
    new URLSearchParams({ ...validQuote, product: emojiProduct, details: "测".repeat(3000) }).toString(),
    "POST",
    { "content-type": "application/x-www-form-urlencoded" }
  );
  const emojiMailtoHref = nativeEmojiSubject.body.match(/href="(mailto:[^"]+)"/)?.[1].replace(/&amp;/g, "&") || "";
  const emojiSubject = new URL(emojiMailtoHref).searchParams.get("subject") || "";
  const emojiSubjectProduct = emojiSubject.replace("Packaging quote request — ", "");
  assert.equal(Array.from(emojiSubjectProduct).length, 60);
  assert.equal(emojiSubjectProduct, `${"💥".repeat(59)}测`);
  assert.ok(emojiMailtoHref.length > 0 && emojiMailtoHref.length <= 1900);

  console.log("Quote API tests passed: JSON/native form requests and result pages, safe native recovery links and brief escaping, bounded direct-channel URLs, strict request media types, production/preview/development origin guards, string-only text fields, complete JSON attachment contract, header-safe subject fields, required recipient configuration, bounded delivery, stable deduplication, validated provider success responses, valid PDF, attribution, required country, file allowlist/signature/Base64, no-store, method guard, and missing-configuration diagnostics.");
} finally {
  globalThis.fetch = originalFetch;
  console.error = originalConsoleError;
  Object.entries(originalEnvironment).forEach(([name, value]) => {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  });
}
