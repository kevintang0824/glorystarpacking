const { createHash } = require("node:crypto");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024;
const RESEND_TIMEOUT_MS = 10000;
const ATTACHMENT_RULES = {
  "application/pdf": {
    extensions: [".pdf"],
    hasValidSignature: (buffer) => buffer.subarray(0, 5).toString("ascii") === "%PDF-",
  },
  "image/jpeg": {
    extensions: [".jpg", ".jpeg"],
    hasValidSignature: (buffer) =>
      buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
  },
  "image/png": {
    extensions: [".png"],
    hasValidSignature: (buffer) =>
      buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  "image/webp": {
    extensions: [".webp"],
    hasValidSignature: (buffer) =>
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP",
  },
};

const clean = (value, maximumLength = 500) =>
  String(value || "")
    .replace(/\0/g, "")
    .trim()
    .slice(0, maximumLength);

const cleanHeader = (value, maximumLength = 500) =>
  String(value || "")
    .replace(/\0/g, "")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maximumLength);

const attachmentSize = (base64) => Math.ceil((String(base64 || "").length * 3) / 4);

const decodeBase64 = (value) => {
  const normalized = String(value || "").replace(/\s+/g, "");
  if (!normalized || normalized.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)) {
    return null;
  }

  const buffer = Buffer.from(normalized, "base64");
  const decodedRoundTrip = buffer.toString("base64").replace(/=+$/, "");
  return decodedRoundTrip === normalized.replace(/=+$/, "") ? buffer : null;
};

const htmlEscape = (value) => String(value || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const limitCodePoints = (value, maximumLength) => Array.from(String(value || ""))
  .slice(0, maximumLength)
  .join("");

const quoteFormPaths = new Set([
  "/",
  "/box-labels.html",
  "/collapsible-rigid-boxes.html",
  "/cosmetic-packaging-boxes.html",
  "/custom-boxes.html",
  "/custom-clear-labels.html",
  "/custom-corrugated-shipping-boxes.html",
  "/custom-drawer-boxes.html",
  "/custom-hang-tags.html",
  "/custom-jewelry-boxes.html",
  "/custom-magnetic-boxes.html",
  "/custom-mailer-boxes.html",
  "/custom-packaging-inserts.html",
  "/custom-paper-bags.html",
  "/custom-perfume-boxes.html",
  "/custom-rigid-boxes.html",
  "/custom-tissue-paper.html",
  "/custom-tube-packaging.html",
  "/custom-waterproof-labels.html",
  "/custom-wine-boxes.html",
  "/custom-wine-labels.html",
  "/embossed-foil-labels.html",
  "/folding-carton-boxes.html",
  "/industries.html",
  "/lid-and-base-boxes.html",
  "/products.html",
]);

const buildProjectBrief = (quote, includeAttribution = true) => {
  const lines = [
    `Name: ${quote.name || ""}`,
    `Email: ${quote.email || ""}`,
    `Phone / WhatsApp: ${quote.phone || "Not provided"}`,
    `Product: ${quote.product || ""}`,
    `Quantity: ${quote.quantity || ""}`,
    `Dimensions: ${quote.dimensions || "Not provided"}`,
    `Delivery country / region: ${quote.country || ""}`,
    `Target in-hand date: ${quote.targetDate || "Flexible / not provided"}`,
  ];

  if (includeAttribution) {
    lines.push(
      `Source page: ${quote.sourcePage || "Not provided"}`,
      `Landing page: ${quote.landingPage || "Not provided"}`,
      `Referrer: ${quote.referrer || "Direct / not provided"}`,
      `Discovery channel: ${quote.discoveryChannel || "Not provided"}`,
      `Discovery source: ${quote.discoverySource || "Not provided"}`,
      `UTM source: ${quote.utmSource || "Not provided"}`,
      `UTM medium: ${quote.utmMedium || "Not provided"}`,
      `UTM campaign: ${quote.utmCampaign || "Not provided"}`,
      `UTM term: ${quote.utmTerm || "Not provided"}`,
      `UTM content: ${quote.utmContent || "Not provided"}`,
    );
  }

  return [...lines, "", "Project details:", quote.details || "Not provided"].join("\n");
};

const shortenForDirectChannel = (brief, encodedBudget) => {
  if (encodeURIComponent(brief).length <= encodedBudget) return brief;

  const suffix = "\n\n[This direct-channel brief was shortened. Return to the webpage and copy the complete project brief before sending.]";
  let shortened = "";
  for (const character of brief) {
    if (encodeURIComponent(`${shortened}${character}${suffix}`).length > encodedBudget) break;
    shortened += character;
  }
  return `${shortened.trimEnd()}${suffix}`;
};

const nativeReturnPath = (quote) => quoteFormPaths.has(quote?.sourcePage) ? `${quote.sourcePage}#quote` : "/#quote";

const nativeFallbackMarkup = (quote) => {
  if (!quote) return '<a href="/#quote">Return to the quote form</a><a class="secondary" href="mailto:kevin@GloryStarPack.com">Email Kevin</a><a class="secondary" href="https://wa.me/8618020755949">WhatsApp</a>';

  const fullBrief = buildProjectBrief(quote);
  const subject = `Packaging quote request — ${limitCodePoints(quote.product, 60) || "Custom project"}`;
  const emailUrlPrefix = `mailto:kevin@GloryStarPack.com?subject=${encodeURIComponent(subject)}&body=`;
  const emailFootnote = "\n\nPlease attach any artwork directly to this email before sending.";
  const emailBrief = shortenForDirectChannel(
    buildProjectBrief(quote, false),
    Math.max(300, 1900 - emailUrlPrefix.length - encodeURIComponent(emailFootnote).length)
  );
  const whatsAppUrlPrefix = "https://wa.me/8618020755949?text=";
  const whatsAppGreeting = "Hello Kevin, I would like a packaging quote.\n\n";
  const whatsAppBrief = shortenForDirectChannel(
    buildProjectBrief(quote, false),
    Math.max(300, 1900 - whatsAppUrlPrefix.length - encodeURIComponent(whatsAppGreeting).length)
  );
  const emailUrl = `${emailUrlPrefix}${encodeURIComponent(`${emailBrief}${emailFootnote}`)}`;
  const whatsAppUrl = `${whatsAppUrlPrefix}${encodeURIComponent(`${whatsAppGreeting}${whatsAppBrief}`)}`;

  return `<a href="${htmlEscape(nativeReturnPath(quote))}">Return to the quote form</a><a class="secondary" href="${htmlEscape(emailUrl)}">Continue by email</a><a class="secondary" href="${htmlEscape(whatsAppUrl)}">Send by WhatsApp</a><p>Direct channels may contain a shortened brief. Copy the full brief below to send every detail.</p><label for="project-brief">Complete project brief</label><textarea id="project-brief" readonly rows="12">${htmlEscape(fullBrief)}</textarea>`;
};

const respond = (response, nativeFormRequest, statusCode, payload, quote) => {
  if (!nativeFormRequest) return response.status(statusCode).json(payload);

  const successful = statusCode >= 200 && statusCode < 300;
  const title = successful ? "Quote request received" : "Quote request not sent";
  const message = successful
    ? "Thank you. Your packaging brief has been delivered, and we will reply with the next technical questions."
    : "We could not deliver this form. Return to review the required fields, or send the brief directly by email or WhatsApp.";
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  return response.status(statusCode).send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${title} | GloryStarPack</title><style>body{margin:0;background:#10100f;color:#f8f2e5;font:16px/1.65 system-ui,sans-serif}.card{max-width:660px;margin:12vh auto;padding:clamp(28px,6vw,64px);background:#1a1a18;border-top:4px solid #bdff3c}h1{margin:0 0 16px;font:600 clamp(2rem,6vw,4rem)/1.02 Georgia,serif}p,label{color:#d8d2c7}a{display:inline-block;margin:12px 14px 0 0;color:#10100f;background:#bdff3c;padding:12px 18px;font-weight:700;text-decoration:none}.secondary{color:#f8f2e5;background:transparent;border:1px solid #777}textarea{display:block;box-sizing:border-box;width:100%;margin-top:8px;padding:12px;background:#10100f;color:#f8f2e5;border:1px solid #777;font:14px/1.45 ui-monospace,monospace}</style></head><body><main class="card"><p>GloryStarPack packaging project support</p><h1>${title}</h1><p>${message}</p>${successful ? `<a href="${htmlEscape(nativeReturnPath(quote))}">Return to the quote form</a>` : nativeFallbackMarkup(quote)}</main></body></html>`);
};

module.exports = async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  const contentType = String(
    request.headers?.["content-type"] || request.headers?.get?.("content-type") || ""
  ).toLowerCase();
  const mediaType = contentType.split(";", 1)[0].trim();
  const nativeFormRequest = mediaType === "application/x-www-form-urlencoded";
  const jsonRequest = mediaType === "application/json";

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return respond(response, nativeFormRequest, 405, { error: "Method not allowed." });
  }

  if (!jsonRequest && !nativeFormRequest) {
    return respond(response, false, 415, { error: "Use a JSON or form-urlencoded request body." });
  }

  let body;
  try {
    body = request.body || {};
    if (typeof body === "string") {
      if (jsonRequest) body = JSON.parse(body);
      else if (nativeFormRequest) {
        body = Object.fromEntries(new URLSearchParams(body));
      }
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Invalid body");
  } catch {
    return respond(response, nativeFormRequest, 400, { error: "The request body is not valid." });
  }

  if (clean(body.website, 100)) {
    return respond(response, nativeFormRequest, 200, { ok: true });
  }

  const quote = {
    name: cleanHeader(body.name, 120),
    email: clean(body.email, 180).toLowerCase(),
    phone: clean(body.phone, 80),
    product: cleanHeader(body.product, 120),
    quantity: clean(body.quantity, 80),
    dimensions: clean(body.dimensions, 160),
    country: clean(body.country, 120),
    targetDate: clean(body.targetDate, 120),
    details: clean(body.details, 3000),
    sourcePage: clean(body.sourcePage, 200),
    landingPage: clean(body.landingPage, 500),
    referrer: clean(body.referrer, 500),
    discoveryChannel: clean(body.discoveryChannel, 80),
    discoverySource: clean(body.discoverySource, 160),
    utmSource: clean(body.utmSource, 160),
    utmMedium: clean(body.utmMedium, 160),
    utmCampaign: clean(body.utmCampaign, 240),
    utmTerm: clean(body.utmTerm, 240),
    utmContent: clean(body.utmContent, 240),
  };

  if (
    !quote.name ||
    !EMAIL_PATTERN.test(quote.email) ||
    !quote.product ||
    !quote.quantity ||
    !quote.country
  ) {
    return respond(response, nativeFormRequest, 400, {
      error: "Name, a valid email, product type, quantity, and delivery country are required.",
    }, quote);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.QUOTE_TO_EMAIL;
  const fromEmail = process.env.QUOTE_FROM_EMAIL;

  if (!apiKey || !fromEmail || !toEmail) {
    return respond(response, nativeFormRequest, 503, {
      code: "EMAIL_NOT_CONFIGURED",
      error: "Email delivery is not configured.",
    }, quote);
  }

  const message = {
    from: fromEmail,
    to: [toEmail],
    reply_to: quote.email,
    subject: `New packaging quote — ${quote.product} — ${quote.name}`,
    text: [
      "New quote request from glorystarpacking.com",
      "",
      `Name: ${quote.name}`,
      `Email: ${quote.email}`,
      `Phone / WhatsApp: ${quote.phone || "Not provided"}`,
      `Product: ${quote.product}`,
      `Quantity: ${quote.quantity}`,
      `Dimensions: ${quote.dimensions || "Not provided"}`,
      `Delivery country / region: ${quote.country}`,
      `Target in-hand date: ${quote.targetDate || "Flexible / not provided"}`,
      `Source page: ${quote.sourcePage || "Not provided"}`,
      `Landing page: ${quote.landingPage || "Not provided"}`,
      `Referrer: ${quote.referrer || "Direct / not provided"}`,
      `Discovery channel: ${quote.discoveryChannel || "Not provided"}`,
      `Discovery source: ${quote.discoverySource || "Not provided"}`,
      `UTM source: ${quote.utmSource || "Not provided"}`,
      `UTM medium: ${quote.utmMedium || "Not provided"}`,
      `UTM campaign: ${quote.utmCampaign || "Not provided"}`,
      `UTM term: ${quote.utmTerm || "Not provided"}`,
      `UTM content: ${quote.utmContent || "Not provided"}`,
      "",
      "Project details:",
      quote.details || "Not provided",
    ].join("\n"),
  };

  const attachment = body.attachment && typeof body.attachment === "object" && !Array.isArray(body.attachment)
    ? body.attachment
    : null;
  if (attachment?.content && attachment?.filename) {
    if (attachmentSize(attachment.content) > MAX_ATTACHMENT_BYTES) {
      return respond(response, nativeFormRequest, 413, { error: "The attachment must be under 3 MB." }, quote);
    }

    const filename = clean(attachment.filename, 180);
    const contentType = clean(attachment.contentType, 100).toLowerCase();
    const rule = ATTACHMENT_RULES[contentType];
    const lowerFilename = filename.toLowerCase();
    const decoded = decodeBase64(attachment.content);

    if (!rule || !rule.extensions.some((extension) => lowerFilename.endsWith(extension))) {
      return respond(response, nativeFormRequest, 415, { error: "Attach a PDF, JPG, PNG, or WebP file." }, quote);
    }
    if (!decoded || decoded.length > MAX_ATTACHMENT_BYTES || !rule.hasValidSignature(decoded)) {
      return respond(response, nativeFormRequest, 415, { error: "The attachment content does not match its file type." }, quote);
    }

    message.attachments = [
      {
        filename: filename.replace(/[^\w.\- ()]/g, "_"),
        content: decoded.toString("base64"),
      },
    ];
  }

  const submissionFingerprint = createHash("sha256")
    .update(JSON.stringify({ quote, attachment: message.attachments?.[0] || null }))
    .digest("hex");
  const resendController = new AbortController();
  const resendTimeout = setTimeout(() => resendController.abort(), RESEND_TIMEOUT_MS);
  let resendResponse;
  try {
    resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `quote-${submissionFingerprint}`,
      },
      body: JSON.stringify(message),
      signal: resendController.signal,
    });
  } catch {
    return respond(response, nativeFormRequest, 502, { error: "Email delivery is temporarily unavailable." }, quote);
  } finally {
    clearTimeout(resendTimeout);
  }

  if (!resendResponse.ok) {
    const resendError = await resendResponse.json().catch(() => ({}));
    console.error("Resend quote error", resendResponse.status, resendError);
    return respond(response, nativeFormRequest, 502, { error: "Email delivery is temporarily unavailable." }, quote);
  }

  let result;
  try {
    result = await resendResponse.json();
  } catch {
    console.error("Resend quote success response was not valid JSON", resendResponse.status);
    return respond(response, nativeFormRequest, 502, { error: "Email delivery is temporarily unavailable." }, quote);
  }

  if (!result || typeof result.id !== "string" || !result.id.trim()) {
    console.error("Resend quote success response was missing an email ID", resendResponse.status);
    return respond(response, nativeFormRequest, 502, { error: "Email delivery is temporarily unavailable." }, quote);
  }

  return respond(response, nativeFormRequest, 200, { ok: true, id: result.id.trim() }, quote);
};
