module.exports = function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ ok: false, error: "Method not allowed." });
  }

  const quoteEmailConfigured = Boolean(
    process.env.RESEND_API_KEY && process.env.QUOTE_FROM_EMAIL && process.env.QUOTE_TO_EMAIL
  );

  return response.status(quoteEmailConfigured ? 200 : 503).json({
    ok: quoteEmailConfigured,
    services: {
      quoteEmail: {
        configured: quoteEmailConfigured,
      },
    },
  });
};
