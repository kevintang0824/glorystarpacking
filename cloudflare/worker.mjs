import quoteHandler from "../api/quote.js";
import healthHandler from "../api/health.js";
import settings from "../vercel.json";
import routes from "./generated-routes.json";

const canonicalHost = "glorystarpacking.com";
const languages = new Set(["fr", "es", "pt", "ru", "zh-CN"]);
const htmlPaths = new Set(routes.htmlPaths);
const escapePattern = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const headerRules = settings.headers.map(({ source, headers }) => ({
  pattern: new RegExp(`^${source.split("(.*)").map(escapePattern).join(".*")}$`),
  headers,
}));

const applyHeaders = (response, pathname, hostname) => {
  const result = new Response(response.body, response);
  for (const rule of headerRules) {
    if (!rule.pattern.test(pathname)) continue;
    for (const { key, value } of rule.headers) result.headers.set(key, value);
  }
  if (hostname.endsWith(".pages.dev")) result.headers.set("X-Robots-Tag", "noindex, nofollow");
  return result;
};

const redirect = (url, target) => {
  const destination = new URL(target, url);
  if (!destination.search) destination.search = url.search;
  return Response.redirect(destination.href, 308);
};

// Adapt the existing Vercel handlers without duplicating validation or mail logic.
export const invokeApi = async (request, env, handler) => {
  const headers = new Headers({ "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" });
  let status = 200;
  let output;
  const response = {
    setHeader(name, value) { headers.set(name, value); },
    status(value) { status = value; return response; },
    json(value) { headers.set("Content-Type", "application/json; charset=utf-8"); output = JSON.stringify(value); },
    send(value) { output = String(value); },
  };
  const requestHeaders = Object.fromEntries(request.headers);
  requestHeaders.host = new URL(request.url).host;
  // Limit the whole request, including a base64-encoded 3 MiB artwork attachment.
  const maximumBodyBytes = 4.3 * 1024 * 1024;
  if (Number(request.headers.get("content-length")) > maximumBodyBytes) {
    return Response.json({ error: "The request body is too large." }, { status: 413, headers });
  }
  let body = "";
  if (request.method !== "GET" && request.method !== "HEAD") {
    const reader = request.body?.getReader();
    const chunks = [];
    let size = 0;
    if (reader) {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > maximumBodyBytes) {
          await reader.cancel();
          return Response.json({ error: "The request body is too large." }, { status: 413, headers });
        }
        chunks.push(value);
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
      body = new TextDecoder().decode(bytes);
    }
  }
  const host = new URL(request.url).hostname;
  const environment = {
    ...env,
    VERCEL_ENV: host.endsWith(".pages.dev") ? "preview" : "production",
  };
  await handler({ method: request.method, headers: requestHeaders, body }, response, environment);
  return new Response(output, { status, headers });
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let response;
    if (url.pathname.startsWith("/.well-known/acme-challenge/")) {
      // Preserve HTTP domain validation and certificate renewal before redirects.
      response = await env.ASSETS.fetch(request);
    } else if (url.hostname === `www.${canonicalHost}`) {
      response = redirect(url, `https://${canonicalHost}${url.pathname}`);
    } else {
      const rule = settings.redirects.find(({ source, has }) => !has && source === url.pathname);
      if (rule) response = redirect(url, rule.destination);
      else if (url.pathname === "/api/quote") response = await invokeApi(request, env, quoteHandler);
      else if (url.pathname === "/api/health") response = await invokeApi(request, env, healthHandler);
      else if (url.pathname.startsWith("/api/")) response = Response.json({ error: "Not found." }, { status: 404 });
      else {
        const language = url.pathname.split("/")[1];
        if (languages.has(language) && url.pathname === `/${language}/`) {
          response = redirect(url, `/${language}`);
        } else if (htmlPaths.has(`${url.pathname}.html`)) {
          response = redirect(url, `${url.pathname}.html`);
        } else {
          const assetUrl = new URL(url);
          if (htmlPaths.has(url.pathname) && url.pathname !== "/index.html") {
            // ASSETS serves the extensionless lookup without Pages' .html redirect.
            assetUrl.pathname = url.pathname.slice(0, -5);
          } else if (languages.has(language) && url.pathname === `/${language}`) {
            assetUrl.pathname = `/${language}/`;
          }
          response = await env.ASSETS.fetch(new Request(assetUrl, request));
        }
      }
    }
    return applyHeaders(response, url.pathname, url.hostname);
  },
};
