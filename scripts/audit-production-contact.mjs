import process from "node:process";

const origin = new URL(process.argv[2] || "https://glorystarpacking.com").origin;
const currentWhatsAppUrl = "https://wa.me/8619577608248";
const currentTelUrl = "tel:+8619577608248";
const currentStructuredPhone = "+86-195-7760-8248";
const retiredPhonePattern = /8618020755949|\+86[\s-]*180[\s-]*2075[\s-]*5949/i;
const errors = [];

const fetchText = async (url) => {
  const response = await fetch(url, {
    cache: "no-store",
    headers: { "user-agent": "GloryStarPack production contact audit" },
    signal: AbortSignal.timeout(20_000),
  });
  return { response, text: await response.text() };
};

const sitemap = await fetchText(`${origin}/sitemap.xml`);
if (!sitemap.response.ok) throw new Error(`sitemap.xml returned HTTP ${sitemap.response.status}`);
const urls = [...sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1].trim());
const pageHtml = new Map();

let nextIndex = 0;
const worker = async () => {
  while (nextIndex < urls.length) {
    const url = urls[nextIndex++];
    try {
      const result = await fetchText(url);
      if (!result.response.ok) {
        errors.push(`${url}: HTTP ${result.response.status}`);
        continue;
      }
      pageHtml.set(url, result.text);
      if (!result.text.includes(currentWhatsAppUrl)) errors.push(`${url}: current WhatsApp route is missing`);
      if (!result.text.includes(currentTelUrl)) errors.push(`${url}: direct-call route is missing`);
      if (retiredPhonePattern.test(result.text)) errors.push(`${url}: retired contact number is still present`);
    } catch (error) {
      errors.push(`${url}: ${error.message}`);
    }
  }
};
await Promise.all(Array.from({ length: Math.min(8, urls.length) }, worker));

const homeHtml = pageHtml.get(`${origin}/`) || "";
const structuredPhones = [...homeHtml.matchAll(/"telephone":\s*"([^"]+)"/g)].map((match) => match[1]);
if (structuredPhones.length !== 2 || structuredPhones.some((phone) => phone !== currentStructuredPhone)) {
  errors.push("Homepage Organization and ContactPoint telephone are not current");
}
const siteScriptAsset = "assets/site.js";
const siteScriptPath = homeHtml.match(/<script\b[^>]*src="(assets\/site\.js\?v=[a-f0-9]{12})"/i)?.[1] || "";
if (!siteScriptPath) {
  errors.push("Homepage versioned site.js reference is missing");
} else {
  try {
    const siteScript = await fetchText(`${origin}/${siteScriptPath}`);
    if (!siteScript.response.ok) errors.push(`site.js returned HTTP ${siteScript.response.status}`);
    if (!siteScript.text.includes(`${currentWhatsAppUrl}?text=`)) errors.push("site.js current WhatsApp fallback is missing");
    if (retiredPhonePattern.test(siteScript.text)) errors.push("site.js retains the retired contact number");
  } catch (error) {
    errors.push(`site.js: ${error.message}`);
  }
}

if (errors.length) {
  console.error(`Production contact audit failed (${errors.length}):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Production contact audit passed: ${urls.length} indexable pages use current WhatsApp and direct-call routes, no retired number remains, homepage structured telephone is ${currentStructuredPhone}, and the browser quote fallback is current.`);
