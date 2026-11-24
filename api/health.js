module.exports = function handler(request, response, environment = process.env) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ ok: false, error: "Method not allowed." });
  }

  const quoteEmailConfigured = Boolean(
    environment.RESEND_API_KEY && environment.QUOTE_FROM_EMAIL && environment.QUOTE_TO_EMAIL
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
