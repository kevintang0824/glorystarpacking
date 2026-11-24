module.exports = function handler(request, response, environment = process.env) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ ok: false, error: "Method not allowed." });
  }

  const quoteEmailConfigured = Boolean(
    environment.RESEND_API_KEY && environment.QUOTE_FROM_EMAIL && environment.QUOTE_TO_EMAIL
  );
  const commit = environment.CF_PAGES_COMMIT_SHA || environment.VERCEL_GIT_COMMIT_SHA || "";

  return response.status(quoteEmailConfigured ? 200 : 503).json({
    ok: quoteEmailConfigured,
    release: {
      commit: /^[a-f0-9]{40}$/i.test(commit) ? commit : null,
      provider: environment.CF_PAGES === "1" ? "cloudflare" :
        environment.VERCEL === "1" ? "vercel" : "local",
    },
    services: {
      quoteEmail: {
        configured: quoteEmailConfigured,
      },
    },
  });
};
