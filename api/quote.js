const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024;
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

module.exports = async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed." });
  }

  let body;
  try {
    body = request.body || {};
  } catch {
    return response.status(400).json({ error: "The request body is not valid JSON." });
  }

  if (clean(body.website, 100)) {
    return response.status(200).json({ ok: true });
  }

  const quote = {
    name: clean(body.name, 120),
    email: clean(body.email, 180).toLowerCase(),
    phone: clean(body.phone, 80),
    product: clean(body.product, 120),
    quantity: clean(body.quantity, 80),
    dimensions: clean(body.dimensions, 160),
    country: clean(body.country, 120),
    targetDate: clean(body.targetDate, 120),
    details: clean(body.details, 3000),
    sourcePage: clean(body.sourcePage, 200),
    landingPage: clean(body.landingPage, 500),
    referrer: clean(body.referrer, 500),
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
    return response.status(400).json({
      error: "Name, a valid email, product type, quantity, and delivery country are required.",
    });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.QUOTE_TO_EMAIL || "kevin@GloryStarPack.com";
  const fromEmail = process.env.QUOTE_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    return response.status(503).json({
      error: "Email delivery is not configured.",
    });
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

  const attachment = body.attachment;
  if (attachment?.content && attachment?.filename) {
    if (attachmentSize(attachment.content) > MAX_ATTACHMENT_BYTES) {
      return response.status(413).json({ error: "The attachment must be under 3 MB." });
    }

    const filename = clean(attachment.filename, 180);
    const contentType = clean(attachment.contentType, 100).toLowerCase();
    const rule = ATTACHMENT_RULES[contentType];
    const lowerFilename = filename.toLowerCase();
    const decoded = decodeBase64(attachment.content);

    if (!rule || !rule.extensions.some((extension) => lowerFilename.endsWith(extension))) {
      return response.status(415).json({ error: "Attach a PDF, JPG, PNG, or WebP file." });
    }
    if (!decoded || decoded.length > MAX_ATTACHMENT_BYTES || !rule.hasValidSignature(decoded)) {
      return response.status(415).json({ error: "The attachment content does not match its file type." });
    }

    message.attachments = [
      {
        filename: filename.replace(/[^\w.\- ()]/g, "_"),
        content: decoded.toString("base64"),
      },
    ];
  }

  let resendResponse;
  try {
    resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `quote-${crypto.randomUUID()}`,
      },
      body: JSON.stringify(message),
    });
  } catch {
    return response.status(502).json({ error: "Email delivery is temporarily unavailable." });
  }

  if (!resendResponse.ok) {
    const resendError = await resendResponse.json().catch(() => ({}));
    console.error("Resend quote error", resendResponse.status, resendError);
    return response.status(502).json({ error: "Email delivery is temporarily unavailable." });
  }

  const result = await resendResponse.json();
  return response.status(200).json({ ok: true, id: result.id });
};
