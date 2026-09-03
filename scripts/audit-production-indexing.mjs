import process from "node:process";

const siteOrigin = new URL(process.argv[2] || "https://glorystarpacking.com").origin;
const sitemapUrlsToAudit = [`${siteOrigin}/sitemap.xml`, `${siteOrigin}/sitemap-languages.xml`];
const requestHeaders = {
  "user-agent": "GloryStarPackProductionAudit/1.0",
  accept: "text/html,application/xhtml+xml,application/xml,text/plain;q=0.9,*/*;q=0.8",
};
const errors = [];

const followRedirects = async (initialUrl, maximumHops = 5) => {
  let currentUrl = initialUrl;
  const redirects = [];

  for (let hop = 0; hop <= maximumHops; hop += 1) {
    const response = await fetch(currentUrl, {
      redirect: "manual",
      headers: requestHeaders,
    });
    const location = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && location) {
      const nextUrl = new URL(location, currentUrl).href;
      redirects.push({ status: response.status, from: currentUrl, to: nextUrl });
      currentUrl = nextUrl;
      continue;
    }

    return {
      response,
      body: await response.text(),
      finalUrl: currentUrl,
      redirects,
    };
  }

  throw new Error(`${initialUrl} exceeded ${maximumHops} redirects`);
};

const canonicalFrom = (html) =>
  html.match(/<link\b[^>]*rel=[\"']canonical[\"'][^>]*href=[\"']([^\"']+)[\"']/i)?.[1] ||
  html.match(/<link\b[^>]*href=[\"']([^\"']+)[\"'][^>]*rel=[\"']canonical[\"']/i)?.[1] ||
  "";

const robotsContentFrom = (html) => {
  const robotsTag = [...html.matchAll(/<meta\b[^>]*>/gi)].find((match) =>
    /\bname=[\"']robots[\"']/i.test(match[0])
  )?.[0];
  return robotsTag?.match(/\bcontent=[\"']([^\"']*)[\"']/i)?.[1] || "";
};

const auditSitemapUrl = async (url) => {
  try {
    const result = await followRedirects(url);
    if (result.response.status !== 200) {
      errors.push(`${url}: expected HTTP 200, received ${result.response.status}`);
      return;
    }
    if (result.redirects.length || result.finalUrl !== url) {
      errors.push(`${url}: sitemap URL redirects to ${result.finalUrl}`);
    }
    if (result.response.headers.get("x-robots-tag")?.toLowerCase().includes("noindex")) {
      errors.push(`${url}: production response has an X-Robots-Tag noindex directive`);
    }
    const contentType = result.response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      errors.push(`${url}: expected an HTML response, received ${contentType || "no content type"}`);
      return;
    }
    const canonical = canonicalFrom(result.body);
    if (canonical !== url) errors.push(`${url}: canonical is ${canonical || "missing"}`);
    if (!robotsContentFrom(result.body).toLowerCase().includes("index,follow")) {
      errors.push(`${url}: index,follow robots meta directive is missing`);
    }
  } catch (error) {
    errors.push(`${url}: ${error.message}`);
  }
};

const auditRedirectProbe = async ({ url, finalUrl, maximumRedirects }) => {
  try {
    const result = await followRedirects(url);
    if (result.response.status !== 200) errors.push(`${url}: final response is HTTP ${result.response.status}`);
    if (result.finalUrl !== finalUrl) errors.push(`${url}: final URL is ${result.finalUrl}, expected ${finalUrl}`);
    if (result.redirects.length > maximumRedirects) {
      errors.push(`${url}: uses ${result.redirects.length} redirects, expected no more than ${maximumRedirects}`);
    }
  } catch (error) {
    errors.push(`${url}: ${error.message}`);
  }
};

const auditNonPublicPath = async (pathname) => {
  const url = `${siteOrigin}${pathname}`;
  try {
    const response = await fetch(url, { redirect: "manual", headers: requestHeaders, cache: "no-store" });
    if (response.status !== 404) errors.push(`${url}: private build artifact must return HTTP 404, received ${response.status}`);
  } catch (error) {
    errors.push(`${url}: ${error.message}`);
  }
};

const sitemapResults = await Promise.all(sitemapUrlsToAudit.map(followRedirects));
for (let index = 0; index < sitemapResults.length; index += 1) {
  if (sitemapResults[index].response.status !== 200) errors.push(`${sitemapUrlsToAudit[index]}: expected HTTP 200, received ${sitemapResults[index].response.status}`);
}
const sitemapUrls = sitemapResults.flatMap((result) => [...result.body.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1].trim()));
if (!sitemapUrls.length) errors.push("sitemap.xml contains no URLs");
if (new Set(sitemapUrls).size !== sitemapUrls.length) errors.push("sitemap.xml contains duplicate URLs");
if (sitemapUrls.some((url) => new URL(url).origin !== siteOrigin)) errors.push("sitemap.xml contains a URL outside the canonical origin");

for (let index = 0; index < sitemapUrls.length; index += 8) {
  await Promise.all(sitemapUrls.slice(index, index + 8).map(auditSitemapUrl));
}

const robotsResult = await followRedirects(`${siteOrigin}/robots.txt`);
if (robotsResult.response.status !== 200) errors.push("robots.txt does not return HTTP 200");
for (const sitemapUrl of sitemapUrlsToAudit) {
  if (!robotsResult.body.includes(`Sitemap: ${sitemapUrl}`)) errors.push(`robots.txt does not declare ${sitemapUrl}`);
}
if (!robotsResult.body.includes("User-agent: OAI-SearchBot")) errors.push("robots.txt does not define OAI-SearchBot access");

await Promise.all([
  auditRedirectProbe({ url: `${siteOrigin}/index.html`, finalUrl: `${siteOrigin}/`, maximumRedirects: 1 }),
  auditRedirectProbe({ url: "https://www.glorystarpacking.com/", finalUrl: `${siteOrigin}/`, maximumRedirects: 1 }),
  auditRedirectProbe({ url: "https://www.glorystarpacking.com/index.html", finalUrl: `${siteOrigin}/`, maximumRedirects: 1 }),
]);

await Promise.all([
  "/tmp/authorized-catalog-image-selection.json",
  "/assets/catalog/clean-sources/manifest.json",
  "/assets/catalog/clean-sources/catalog-build-audit.json",
  "/assets/catalog/import-report.json",
  "/assets/catalog/curated-products.json",
  "/assets/catalog/categories/paper-bags.jpg",
  "/assets/catalog/previews/60697040446.jpg",
].map(auditNonPublicPath));

if (errors.length) {
  console.error(`Production indexing audit failed with ${errors.length} issue${errors.length === 1 ? "" : "s"}:`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Production indexing audit passed: ${sitemapUrls.length} sitemap URLs return direct HTTP 200 responses with matching canonicals and indexable robots directives; canonical-host probes use at most one redirect and private build artifacts return 404.`);
