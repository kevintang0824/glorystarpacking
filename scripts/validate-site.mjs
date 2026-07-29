import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = path.resolve(process.argv[2] || ".");
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith(".html")).sort();
const errors = [];
const warnings = [];
const canonicalOwners = new Map();
const titleOwners = new Map();
const pageCache = new Map();
const siteOrigin = "https://glorystarpacking.com";
const quoteFieldNames = ["name", "email", "product", "quantity", "country", "targetDate", "details", "attachment", "website"];
const newProductPages = [
  "custom-wine-boxes.html",
  "custom-perfume-boxes.html",
  "custom-clear-labels.html",
  "custom-waterproof-labels.html",
  "packaging-sample-approval-checklist.html",
];
const requiredRobotsDirective = "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";

const values = (source, pattern) => [...source.matchAll(pattern)].map((match) => match[1]);
const attribute = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`, "i"))?.[1] || "";
const plainText = (source) => source
  .replace(/<[^>]+>/g, " ")
  .replace(/&(?:amp|#38);/g, "&")
  .replace(/&(?:quot|#34);/g, "\"")
  .replace(/&(?:apos|#39);/g, "'")
  .replace(/&(?:lt|#60);/g, "<")
  .replace(/&(?:gt|#62);/g, ">")
  .replace(/&nbsp;/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const readPage = (file) => {
  if (!pageCache.has(file)) {
    const fullPath = path.join(root, file);
    if (!fs.existsSync(fullPath)) return null;
    const html = fs.readFileSync(fullPath, "utf8");
    pageCache.set(file, {
      html,
      ids: new Set(values(html, /\sid="([^"]+)"/g)),
    });
  }
  return pageCache.get(file);
};

for (const file of htmlFiles) {
  const page = readPage(file);
  const { html, ids } = page;
  const titles = values(html, /<title>([\s\S]*?)<\/title>/gi);
  const h1s = values(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi);
  const descriptions = values(html, /<meta\s+name="description"\s+content="([^"]*)"/gi);
  const robotsDirectives = values(html, /<meta\s+name="robots"\s+content="([^"]*)"/gi);
  const canonicals = values(html, /<link\s+rel="canonical"\s+href="([^"]+)"/gi);
  const ogUrls = values(html, /<meta\s+property="og:url"\s+content="([^"]*)"/gi);
  const ogImages = values(html, /<meta\s+property="og:image"\s+content="([^"]*)"/gi);
  const twitterImages = values(html, /<meta\s+name="twitter:image"\s+content="([^"]*)"/gi);

  if (titles.length !== 1) errors.push(`${file}: expected 1 title, found ${titles.length}`);
  if (h1s.length !== 1) errors.push(`${file}: expected 1 H1, found ${h1s.length}`);
  if (descriptions.length !== 1) errors.push(`${file}: expected 1 meta description, found ${descriptions.length}`);
  if (robotsDirectives.length !== 1) errors.push(`${file}: expected 1 robots meta tag, found ${robotsDirectives.length}`);
  if (robotsDirectives[0] && robotsDirectives[0] !== requiredRobotsDirective) {
    errors.push(`${file}: robots meta directives are inconsistent`);
  }
  if (canonicals.length !== 1) errors.push(`${file}: expected 1 canonical, found ${canonicals.length}`);
  if (ogUrls.length !== 1) errors.push(`${file}: expected 1 og:url, found ${ogUrls.length}`);
  if (ogImages.length !== 1) errors.push(`${file}: expected 1 og:image, found ${ogImages.length}`);
  if (twitterImages.length !== 1) errors.push(`${file}: expected 1 twitter:image, found ${twitterImages.length}`);
  if (canonicals[0] && ogUrls[0] && canonicals[0] !== ogUrls[0]) {
    errors.push(`${file}: og:url does not match canonical`);
  }

  for (const tagName of ["article", "section", "main", "nav", "form"]) {
    const openingCount = (html.match(new RegExp(`<${tagName}\\b`, "gi")) || []).length;
    const closingCount = (html.match(new RegExp(`</${tagName}>`, "gi")) || []).length;
    if (openingCount !== closingCount) {
      errors.push(`${file}: unbalanced <${tagName}> tags (${openingCount} opening, ${closingCount} closing)`);
    }
  }

  if (titles[0]) {
    if (titleOwners.has(titles[0])) errors.push(`${file}: duplicate title also used by ${titleOwners.get(titles[0])}`);
    titleOwners.set(titles[0], file);
    const plainTitle = titles[0].replace(/<[^>]+>/g, "").trim();
    if (plainTitle.length > 65) warnings.push(`${file}: title is ${plainTitle.length} characters`);
  }
  if (descriptions[0] && descriptions[0].length > 165) {
    warnings.push(`${file}: meta description is ${descriptions[0].length} characters`);
  }
  if (canonicals[0]) {
    const expectedCanonical = file === "index.html" ? `${siteOrigin}/` : `${siteOrigin}/${file}`;
    if (canonicals[0] !== expectedCanonical) {
      errors.push(`${file}: canonical should be ${expectedCanonical}`);
    }
    if (canonicalOwners.has(canonicals[0])) errors.push(`${file}: duplicate canonical also used by ${canonicalOwners.get(canonicals[0])}`);
    canonicalOwners.set(canonicals[0], file);
  }

  for (const socialImage of [...ogImages, ...twitterImages]) {
    try {
      const imageUrl = new URL(socialImage);
      if (imageUrl.origin === siteOrigin) {
        const imagePath = path.join(root, decodeURIComponent(imageUrl.pathname.replace(/^\//, "")));
        if (!fs.existsSync(imagePath)) errors.push(`${file}: social image is missing "${socialImage}"`);
      }
    } catch {
      errors.push(`${file}: invalid social image URL "${socialImage}"`);
    }
  }

  const idValues = values(html, /\sid="([^"]+)"/g);
  const seenIds = new Set();
  for (const id of idValues) {
    if (seenIds.has(id)) errors.push(`${file}: duplicate id "${id}"`);
    seenIds.add(id);
  }

  for (const control of values(html, /\saria-controls="([^"]+)"/g)) {
    if (!ids.has(control)) errors.push(`${file}: aria-controls target "#${control}" is missing`);
  }

  const faqButtons = html.match(/<button\b[^>]*class="[^"]*\bfaq-question\b[^"]*"[^>]*>/gi) || [];
  for (const button of faqButtons) {
    if (!/\saria-controls="[^"]+"/i.test(button)) errors.push(`${file}: FAQ button is missing aria-controls`);
    if (!/\saria-expanded="(?:true|false)"/i.test(button)) errors.push(`${file}: FAQ button is missing aria-expanded`);
  }

  const primaryNav = html.match(/<nav\b[^>]*aria-label="Primary navigation"[^>]*>([\s\S]*?)<\/nav>/i)?.[1] || "";
  const currentNavItems = primaryNav.match(/\saria-current="page"/gi) || [];
  if (currentNavItems.length > 1) errors.push(`${file}: primary navigation has ${currentNavItems.length} current-page links`);

  const jsonLdBlocks = values(html, /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
  const schemaFaqItems = [];
  const schemaItemLists = [];
  if (!jsonLdBlocks.length) warnings.push(`${file}: no JSON-LD block`);
  jsonLdBlocks.forEach((block, index) => {
    try {
      const data = JSON.parse(block);
      const visit = (value) => {
        if (!value || typeof value !== "object") return;
        if (value["@type"] === "FAQPage" && Array.isArray(value.mainEntity)) {
          value.mainEntity.forEach((item) => {
            schemaFaqItems.push({
              question: String(item?.name || "").trim(),
              answer: String(item?.acceptedAnswer?.text || "").trim(),
            });
          });
        }
        if (value["@type"] === "ItemList" && Array.isArray(value.itemListElement)) {
          schemaItemLists.push(value);
        }
        Object.values(value).forEach(visit);
      };
      visit(data);
    } catch (error) {
      errors.push(`${file}: JSON-LD block ${index + 1} is invalid (${error.message})`);
    }
  });

  const visibleFaqItems = [...html.matchAll(/<div\s+class="faq-item"[^>]*>[\s\S]*?<button\b[^>]*class="[^"]*\bfaq-question\b[^"]*"[^>]*>([\s\S]*?)<\/button>\s*<div\b[^>]*class="[^"]*\bfaq-answer\b[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi)]
    .map((match) => ({
      question: plainText(match[1].match(/<span\b[^>]*>([\s\S]*?)<\/span>/i)?.[1] || match[1]),
      answer: plainText(match[2]),
    }));

  if (schemaFaqItems.length || visibleFaqItems.length) {
    if (schemaFaqItems.length !== visibleFaqItems.length) {
      errors.push(`${file}: FAQ schema has ${schemaFaqItems.length} items but the visible FAQ has ${visibleFaqItems.length}`);
    }
    const comparableCount = Math.min(schemaFaqItems.length, visibleFaqItems.length);
    for (let index = 0; index < comparableCount; index += 1) {
      if (schemaFaqItems[index].question !== visibleFaqItems[index].question) {
        errors.push(`${file}: FAQ ${index + 1} question does not match its schema`);
      }
      if (schemaFaqItems[index].answer !== visibleFaqItems[index].answer) {
        errors.push(`${file}: FAQ ${index + 1} answer does not match its schema`);
      }
    }
  }

  if (file === "products.html") {
    const catalogList = schemaItemLists[0];
    const productCards = [...html.matchAll(/<article\b[^>]*class="[^"]*\bproduct-card\b[^"]*"[^>]*>([\s\S]*?)<\/article>/gi)];
    const productCardCount = productCards.length;
    if (!catalogList) {
      errors.push(`${file}: product catalog ItemList schema is missing`);
    } else {
      if (catalogList.numberOfItems !== catalogList.itemListElement.length) {
        errors.push(`${file}: ItemList numberOfItems does not match itemListElement count`);
      }
      if (catalogList.numberOfItems !== productCardCount) {
        errors.push(`${file}: ItemList has ${catalogList.numberOfItems} products but the catalog shows ${productCardCount} product cards`);
      }
      const visibleProductUrls = productCards.map((match) => match[1].match(/<a\b[^>]*\shref="([^"]+)"/i)?.[1] || "");
      const schemaProductUrls = catalogList.itemListElement.map((item) => {
        try {
          return new URL(String(item?.url || "")).pathname.replace(/^\//, "");
        } catch {
          return "";
        }
      });
      visibleProductUrls.forEach((url, index) => {
        if (url !== schemaProductUrls[index]) {
          errors.push(`${file}: product card ${index + 1} does not match ItemList position ${index + 1}`);
        }
      });
    }
  }

  const imageTags = html.match(/<img\b[^>]*>/gi) || [];
  for (const tag of imageTags) {
    if (!/\salt="[^"]*"/i.test(tag)) errors.push(`${file}: image is missing alt text: ${tag.slice(0, 100)}`);
    if (!/\swidth="\d+"/i.test(tag) || !/\sheight="\d+"/i.test(tag)) {
      errors.push(`${file}: image is missing numeric width or height: ${tag.slice(0, 100)}`);
    }
    const src = tag.match(/\ssrc="([^"]+)"/i)?.[1];
    if (src && !/^(?:https?:|data:|\/)/.test(src)) {
      const sourcePath = path.join(root, src.split(/[?#]/)[0]);
      if (!fs.existsSync(sourcePath)) errors.push(`${file}: missing image "${src}"`);
    }
  }

  const forms = [...html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/gi)];
  const quoteForms = forms.filter((match) => /\bclass="[^"]*\bquote-form\b[^"]*"/i.test(match[1]));
  quoteForms.forEach((match, formIndex) => {
    const openingAttributes = match[1];
    const body = match[2];
    const formLabel = `${file}: quote form ${formIndex + 1}`;
    if (attribute(openingAttributes, "action") !== "/api/quote") errors.push(`${formLabel} must post to /api/quote`);
    if (attribute(openingAttributes, "method").toLowerCase() !== "post") errors.push(`${formLabel} must use POST`);
    if (attribute(openingAttributes, "enctype") !== "multipart/form-data") errors.push(`${formLabel} must use multipart/form-data`);

    const controls = body.match(/<(?:input|select|textarea)\b[^>]*>/gi) || [];
    const controlByName = new Map();
    controls.forEach((tag) => {
      const name = attribute(tag, "name");
      if (name) controlByName.set(name, tag);
      const id = attribute(tag, "id");
      const type = attribute(tag, "type").toLowerCase();
      if (id && type !== "hidden" && !new RegExp(`<label\\s+for="${id}"`, "i").test(body)) {
        errors.push(`${formLabel} control "${name || id}" has no explicit label`);
      }
    });

    quoteFieldNames.forEach((name) => {
      if (!controlByName.has(name)) errors.push(`${formLabel} is missing field "${name}"`);
    });
    const country = controlByName.get("country") || "";
    if (!/\srequired(?:\s|>)/i.test(country)) errors.push(`${formLabel} delivery country must be required`);
    if (attribute(country, "autocomplete") !== "country-name") errors.push(`${formLabel} delivery country needs autocomplete="country-name"`);
    const targetDate = controlByName.get("targetDate") || "";
    if (/\srequired(?:\s|>)/i.test(targetDate)) errors.push(`${formLabel} target date should remain optional`);
    const attachment = controlByName.get("attachment") || "";
    if (attribute(attachment, "accept") !== ".pdf,.jpg,.jpeg,.png,.webp") {
      errors.push(`${formLabel} attachment accept list is inconsistent`);
    }
    if (!/<a\b[^>]*href="privacy\.html"/i.test(body)) errors.push(`${formLabel} is missing a privacy notice link`);
  });

  for (const asset of values(html, /<(?:link|script)\b[^>]*(?:href|src)="(assets\/[^"]+)"/gi)) {
    const assetPath = path.join(root, asset.split(/[?#]/)[0]);
    if (!fs.existsSync(assetPath)) errors.push(`${file}: missing asset "${asset}"`);
  }

  for (const href of values(html, /<a\b[^>]*\shref="([^"]+)"/gi)) {
    if (/^index\.html(?:[?#]|$)/.test(href)) {
      errors.push(`${file}: homepage link should use "/" instead of "${href}"`);
    }
    if (/^(?:https?:|mailto:|tel:|javascript:)/.test(href)) continue;
    const [rawTarget, fragment = ""] = href.split("#", 2);
    const targetWithoutQuery = rawTarget.split("?")[0];
    const targetFile = targetWithoutQuery || file;
    if (!targetFile.endsWith(".html")) continue;
    const targetPage = readPage(targetFile);
    if (!targetPage) {
      errors.push(`${file}: link target "${targetFile}" is missing`);
      continue;
    }
    if (fragment && !targetPage.ids.has(fragment)) {
      errors.push(`${file}: link fragment "${targetFile}#${fragment}" is missing`);
    }
  }
}

const sitemapPath = path.join(root, "sitemap.xml");
if (!fs.existsSync(sitemapPath)) {
  errors.push("sitemap.xml is missing");
} else {
  const sitemap = fs.readFileSync(sitemapPath, "utf8");
  const sitemapUrls = values(sitemap, /<loc>([^<]+)<\/loc>/gi);
  const sitemapUrlSet = new Set(sitemapUrls);
  if (sitemapUrls.length !== sitemapUrlSet.size) errors.push("sitemap.xml: duplicate URL entries");
  for (const canonical of canonicalOwners.keys()) {
    if (!sitemapUrlSet.has(canonical)) errors.push(`sitemap.xml: missing canonical ${canonical}`);
  }
  for (const sitemapUrl of sitemapUrlSet) {
    if (!canonicalOwners.has(sitemapUrl)) errors.push(`sitemap.xml: URL has no matching canonical page ${sitemapUrl}`);
  }
}

for (const targetFile of newProductPages) {
  const inboundSources = htmlFiles.filter((sourceFile) => {
    if (sourceFile === targetFile) return false;
    return new RegExp(`href="${targetFile.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:[?#][^"]*)?"`, "i")
      .test(readPage(sourceFile)?.html || "");
  });
  if (inboundSources.length < 2) {
    errors.push(`${targetFile}: expected at least 2 internal-link sources, found ${inboundSources.length}`);
  }
}

const quoteApiPath = path.join(root, "api", "quote.js");
if (!fs.existsSync(quoteApiPath)) {
  errors.push("api/quote.js is missing");
} else {
  const quoteApi = fs.readFileSync(quoteApiPath, "utf8");
  const requiredApiSignals = [
    ['body.country', "delivery country handling"],
    ['body.targetDate', "target date handling"],
    ['body.utmSource', "campaign attribution handling"],
    ['quote.landingPage', "landing-page attribution"],
    ['ATTACHMENT_RULES', "attachment allowlist"],
    ['hasValidSignature', "attachment signature validation"],
    ['decodeBase64', "strict base64 decoding"],
    ['"Cache-Control", "no-store"', "no-store response header"],
  ];
  requiredApiSignals.forEach(([signal, label]) => {
    if (!quoteApi.includes(signal)) errors.push(`api/quote.js: missing ${label}`);
  });
}

const robotsPath = path.join(root, "robots.txt");
if (!fs.existsSync(robotsPath)) {
  errors.push("robots.txt is missing");
} else {
  const robots = fs.readFileSync(robotsPath, "utf8");
  const requiredRobotsSignals = [
    ["User-agent: OAI-SearchBot", "OAI-SearchBot policy"],
    ["Disallow: /api/", "API crawl block"],
    [`Sitemap: ${siteOrigin}/sitemap.xml`, "sitemap declaration"],
  ];
  requiredRobotsSignals.forEach(([signal, label]) => {
    if (!robots.includes(signal)) errors.push(`robots.txt: missing ${label}`);
  });
}

const vercelConfigPath = path.join(root, "vercel.json");
if (!fs.existsSync(vercelConfigPath)) {
  errors.push("vercel.json is missing");
} else {
  try {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, "utf8"));
    const redirects = Array.isArray(vercelConfig.redirects) ? vercelConfig.redirects : [];
    const redirectsIndex = redirects.some((redirect) =>
      redirect.source === "/index.html" && redirect.destination === "/" && redirect.permanent === true);
    const redirectsWww = redirects.some((redirect) =>
      redirect.destination === `${siteOrigin}/:path*` &&
      redirect.permanent === true &&
      Array.isArray(redirect.has) &&
      redirect.has.some((condition) => condition.type === "host" && condition.value === "www.glorystarpacking.com"));
    if (!redirectsIndex) errors.push("vercel.json: missing permanent /index.html to / redirect");
    if (!redirectsWww) errors.push("vercel.json: missing permanent www to canonical host redirect");
  } catch (error) {
    errors.push(`vercel.json is invalid (${error.message})`);
  }
}

if (warnings.length) {
  console.log(`Warnings (${warnings.length}):`);
  warnings.forEach((warning) => console.log(`- ${warning}`));
}

if (errors.length) {
  console.error(`Errors (${errors.length}):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Validated ${htmlFiles.length} HTML pages: metadata/social URLs, robots directives, canonicals, H1, JSON-LD/FAQ parity, navigation, IDs, image dimensions, quote forms, assets, links, inbound routes, redirects, crawler policy, API safeguards, and sitemap are consistent.`);
}
