import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const origin = new URL(process.argv[2] || "https://glorystarpacking.com").origin;
const root = path.resolve(import.meta.dirname, "..");
const primaryTopline = "Factory-direct custom packaging · Technical project support";
const footerBrand = "Custom boxes, bags, inserts, and labels developed through one accountable sampling, production, and delivery workflow.";
const footerSignature = "Custom packaging · Boxes · Bags · Labels";
const footerHeadings = ["Products", "Explore", "Contact"];
const errors = [];

const digest = (value) => crypto.createHash("sha256").update(value).digest("hex");
const normalizeText = (value) => String(value || "")
  .replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/\s+/g, " ")
  .trim();
const fetchResponse = (url) => fetch(url, {
  cache: "no-store",
  redirect: "manual",
  headers: { "user-agent": "GloryStarPack production shell audit" },
  signal: AbortSignal.timeout(20_000),
});

const sitemapResponse = await fetchResponse(`${origin}/sitemap.xml`);
const sitemap = await sitemapResponse.text();
if (sitemapResponse.status !== 200) throw new Error(`sitemap.xml returned HTTP ${sitemapResponse.status}`);
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1].trim());
if (!urls.length) throw new Error("sitemap.xml contains no URLs");
urls.push(`${origin}/404.html`);

const localCss = fs.readFileSync(path.join(root, "assets", "site.css"));
const cssVersion = digest(localCss).slice(0, 12);
const localAnalytics = fs.readFileSync(path.join(root, "assets", "analytics.js"));
const analyticsVersion = digest(localAnalytics).slice(0, 12);
const localSiteScript = fs.readFileSync(path.join(root, "assets", "site.js"));
const siteScriptVersion = digest(localSiteScript).slice(0, 12);
const localCatalogScript = fs.readFileSync(path.join(root, "assets", "catalog.js"));
const catalogScriptVersion = digest(localCatalogScript).slice(0, 12);

let nextIndex = 0;
const auditPage = async () => {
  while (nextIndex < urls.length) {
    const url = urls[nextIndex++];
    try {
      const response = await fetchResponse(url);
      const html = await response.text();
      if (response.status !== 200) {
        errors.push(`${url}: HTTP ${response.status}`);
        continue;
      }
      const topline = normalizeText(html.match(/<div class="topline">\s*<div class="container topline__inner">\s*<span>([\s\S]*?)<\/span>/i)?.[1]);
      const footer = html.match(/<footer class="site-footer">([\s\S]*?)<\/footer>/i)?.[1] || "";
      const brand = normalizeText(footer.match(/<div class="footer-brand">[\s\S]*?<p>([\s\S]*?)<\/p>/i)?.[1]);
      const signature = normalizeText(footer.match(/<div class="footer-bottom">\s*<span>[\s\S]*?<\/span>\s*<span>([\s\S]*?)<\/span>/i)?.[1]);
      const headings = [...footer.matchAll(/<div class="footer-col">\s*<h2>([\s\S]*?)<\/h2>/gi)].map((match) => normalizeText(match[1]));
      const quickContacts = html.match(/<nav class="floating-contact floating-contact--home"[^>]*>[\s\S]*?<\/nav>/gi) || [];
      const pageCssVersion = html.match(/assets\/site\.css\?v=([a-f0-9]{12})/i)?.[1] || "";
      const pageAnalyticsVersion = html.match(/assets\/analytics\.js\?v=([a-f0-9]{12})/i)?.[1] || "";
      const pageSiteScriptVersion = html.match(/assets\/site\.js\?v=([a-f0-9]{12})/i)?.[1] || "";
      const pageCatalogScriptVersion = html.match(/assets\/catalog\.js\?v=([a-f0-9]{12})/i)?.[1] || "";
      if (topline !== primaryTopline) errors.push(`${url}: topline message mismatch`);
      if (brand !== footerBrand) errors.push(`${url}: footer brand mismatch`);
      if (signature !== footerSignature) errors.push(`${url}: footer signature mismatch`);
      if (JSON.stringify(headings) !== JSON.stringify(footerHeadings)) errors.push(`${url}: footer headings mismatch`);
      if (quickContacts.length !== 1 ||
          !/mailto:kevin@GloryStarPack\.com/i.test(quickContacts[0] || "") ||
          !/https:\/\/wa\.me\/8619577608248/i.test(quickContacts[0] || "") ||
          !/tel:\+8619577608248/i.test(quickContacts[0] || "")) {
        errors.push(`${url}: shared quick-contact toolbar mismatch`);
      }
      if (!/<main id="main-content" tabindex="-1">/i.test(html)) errors.push(`${url}: focusable main-content target mismatch`);
      if (html.includes('<form class="quote-form"') &&
          (!html.includes('aria-labelledby="quote-section-title" aria-describedby="quote-form-status"') ||
           !html.includes('id="quote-form-status" role="status" aria-live="polite"'))) {
        errors.push(`${url}: quote-form accessibility relationship mismatch`);
      }
      if (pageCssVersion !== cssVersion) errors.push(`${url}: expected site.css version ${cssVersion}`);
      if (pageAnalyticsVersion !== analyticsVersion) errors.push(`${url}: expected analytics.js version ${analyticsVersion}`);
      if (pageSiteScriptVersion !== siteScriptVersion) errors.push(`${url}: expected site.js version ${siteScriptVersion}`);
      if (new URL(url).pathname === "/products.html" && pageCatalogScriptVersion !== catalogScriptVersion) {
        errors.push(`${url}: expected catalog.js version ${catalogScriptVersion}`);
      }
    } catch (error) {
      errors.push(`${url}: ${error.message}`);
    }
  }
};
await Promise.all(Array.from({ length: Math.min(8, urls.length) }, auditPage));

try {
  const cssResponse = await fetchResponse(`${origin}/assets/site.css?v=${cssVersion}`);
  const productionCss = Buffer.from(await cssResponse.arrayBuffer());
  if (cssResponse.status !== 200) errors.push(`site.css: HTTP ${cssResponse.status}`);
  if (digest(productionCss) !== digest(localCss)) errors.push("site.css: production content differs from the local release");
  if (!productionCss.includes(Buffer.from(".catalog-library-dialog__content"))) errors.push("site.css: unified catalog preview styling is missing");
  if (!productionCss.includes(Buffer.from("body.analytics-consent-open .floating-contact"))) errors.push("site.css: mobile quick-contact collision guard is missing");
  if (!productionCss.includes(Buffer.from(".js .catalog-library__mobile-category"))) errors.push("site.css: mobile catalog selector styling is missing");
  if (!productionCss.includes(Buffer.from("body.catalog-dialog-open .floating-contact"))) errors.push("site.css: catalog-dialog collision guard is missing");
  if (!productionCss.includes(Buffer.from('.js .site-nav > a[aria-current]:not(.button)'))) errors.push("site.css: mobile current-navigation marker is missing");
  if (!productionCss.includes(Buffer.from('"media intro"')) ||
      !productionCss.includes(Buffer.from('"intro"\n      "media"\n      "details"')) ||
      !productionCss.includes(Buffer.from(".reference-hero__details .hero__actions"))) {
    errors.push("site.css: responsive product-reference reading order is missing");
  }
} catch (error) {
  errors.push(`site.css: ${error.message}`);
}

try {
  const analyticsResponse = await fetchResponse(`${origin}/assets/analytics.js?v=${analyticsVersion}`);
  const productionAnalytics = Buffer.from(await analyticsResponse.arrayBuffer());
  if (analyticsResponse.status !== 200) errors.push(`analytics.js: HTTP ${analyticsResponse.status}`);
  if (digest(productionAnalytics) !== digest(localAnalytics)) errors.push("analytics.js: production content differs from the local release");
  if (!productionAnalytics.includes(Buffer.from('document.body.classList.add("analytics-consent-open")'))) errors.push("analytics.js: consent collision state is missing");
  if (!productionAnalytics.includes(Buffer.from('document.body.classList.remove("analytics-consent-open")'))) errors.push("analytics.js: consent collision restoration is missing");
  if (!productionAnalytics.includes(Buffer.from('href.startsWith("tel:")'))) errors.push("analytics.js: phone-contact tracking is missing");
} catch (error) {
  errors.push(`analytics.js: ${error.message}`);
}

try {
  const siteScriptResponse = await fetchResponse(`${origin}/assets/site.js?v=${siteScriptVersion}`);
  const productionSiteScript = Buffer.from(await siteScriptResponse.arrayBuffer());
  if (siteScriptResponse.status !== 200) errors.push(`site.js: HTTP ${siteScriptResponse.status}`);
  if (digest(productionSiteScript) !== digest(localSiteScript)) errors.push("site.js: production content differs from the local release");
  if (!productionSiteScript.includes(Buffer.from("--navigation-viewport-height"))) errors.push("site.js: measured mobile-navigation height is missing");
  if (!productionSiteScript.includes(Buffer.from("aria-errormessage"))) errors.push("site.js: form error relationship is missing");
  if (!productionSiteScript.includes(Buffer.from("Choose another file, or remove it"))) errors.push("site.js: correctable attachment error is missing");
} catch (error) {
  errors.push(`site.js: ${error.message}`);
}

try {
  const catalogScriptResponse = await fetchResponse(`${origin}/assets/catalog.js?v=${catalogScriptVersion}`);
  const productionCatalogScript = Buffer.from(await catalogScriptResponse.arrayBuffer());
  if (catalogScriptResponse.status !== 200) errors.push(`catalog.js: HTTP ${catalogScriptResponse.status}`);
  if (digest(productionCatalogScript) !== digest(localCatalogScript)) errors.push("catalog.js: production content differs from the local release");
  if (!productionCatalogScript.includes(Buffer.from("readCatalogStateFromUrl"))) errors.push("catalog.js: restorable URL state is missing");
  if (!productionCatalogScript.includes(Buffer.from("product.searchText = normalize"))) errors.push("catalog.js: precomputed search index is missing");
  if (!productionCatalogScript.includes(Buffer.from("dialogReturnFocus"))) errors.push("catalog.js: dialog focus return is missing");
} catch (error) {
  errors.push(`catalog.js: ${error.message}`);
}

if (errors.length) {
  console.error(`Production shell audit failed (${errors.length}):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Production shell audit passed: ${urls.length} public pages share one accessible shell and direct-call toolbar; site.css ${cssVersion}, site.js ${siteScriptVersion}, analytics.js ${analyticsVersion}, and catalog.js ${catalogScriptVersion} are source-current.`);
