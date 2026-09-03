import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = path.resolve(process.argv[2] || ".");
const siteOrigin = "https://glorystarpacking.com";
const errors = [];
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const values = (source, pattern) => [...source.matchAll(pattern)].map((match) => match[1].trim());
const hasType = (node, expected) => {
  const types = Array.isArray(node?.["@type"]) ? node["@type"] : [node?.["@type"]];
  return types.includes(expected);
};
const visibleWords = (html) => html
  .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
  .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
  .replace(/<nav\b[\s\S]*?<\/nav>/gi, " ")
  .replace(/<footer\b[\s\S]*?<\/footer>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&[a-z0-9#]+;/gi, " ")
  .split(/\s+/)
  .filter(Boolean);

let manifest;
let catalog;
try {
  manifest = JSON.parse(read("assets/catalog/curated-products.json"));
  catalog = JSON.parse(read("assets/catalog/catalog.json"));
} catch (error) {
  console.error(`Curated product data is invalid or missing: ${error.message}`);
  process.exit(1);
}

if (!Array.isArray(manifest) || manifest.length !== 12) {
  errors.push(`curated-products.json must contain exactly 12 entries, found ${manifest?.length ?? "invalid"}`);
}

const productsHtml = read("products.html");
const catalogJs = read("assets/catalog.js");
const sitemap = read("sitemap.xml");
const imageSitemap = read("image-sitemap.xml");
const robots = read("robots.txt");
const llms = read("llms.txt");
const rootHtmlPages = fs.readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".html") && !/ \d+\.html$/i.test(entry.name))
  .map((entry) => ({ file: entry.name, html: read(entry.name) }));
const imageEntries = [...imageSitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)]
  .map((match) => ({
    page: match[1].match(/<loc>([^<]+)<\/loc>/)?.[1]?.trim() || "",
    lastmod: match[1].match(/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/)?.[1] || "",
    image: match[1].match(/<image:loc>([^<]+)<\/image:loc>/)?.[1]?.trim() || "",
  }));
const catalogById = new Map(catalog.products.map((product) => [String(product.id), product]));
const ids = new Set();
const references = new Set();
const files = new Set();
const titles = new Set();
const descriptions = new Set();
const curatedCardSizes = "(max-width: 520px) 118px, (max-width: 760px) calc((100vw - 42px) / 2), (max-width: 1040px) calc((100vw - 58px) / 3), 290px";

if (!imageSitemap.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"')) {
  errors.push("image-sitemap.xml is missing the Google image namespace");
}
if (new Set(imageEntries.map((entry) => entry.page)).size !== imageEntries.length) {
  errors.push("image-sitemap.xml contains duplicate page URLs");
}
if (new Set(imageEntries.map((entry) => entry.image)).size !== imageEntries.length) {
  errors.push("image-sitemap.xml contains duplicate image URLs");
}
if (!robots.includes(`Sitemap: ${siteOrigin}/image-sitemap.xml`)) {
  errors.push("robots.txt does not declare image-sitemap.xml");
}

for (const product of manifest) {
  const label = `${product.reference || "missing reference"} (${product.file || "missing file"})`;
  if (!/^\d+$/.test(product.id || "")) errors.push(`${label}: invalid catalog ID`);
  if (!/^GS-\d{7}$/.test(product.reference || "")) errors.push(`${label}: invalid reference`);
  if (!/^[a-z0-9-]+-gs-\d{7}\.html$/.test(product.file || "")) errors.push(`${label}: detail filename must be a stable GS reference slug`);
  if (!product.alt || product.alt.length < 20) errors.push(`${label}: descriptive primary-image alt text is missing`);
  if (!product.parentUrl || !product.parentName) errors.push(`${label}: parent route metadata is missing`);
  if (ids.has(product.id)) errors.push(`${label}: duplicate catalog ID`);
  if (references.has(product.reference)) errors.push(`${label}: duplicate reference`);
  if (files.has(product.file)) errors.push(`${label}: duplicate detail filename`);
  ids.add(product.id);
  references.add(product.reference);
  files.add(product.file);

  const catalogProduct = catalogById.get(String(product.id));
  if (!catalogProduct) {
    errors.push(`${label}: catalog record is missing`);
    continue;
  }
  const expectedImage = String(catalogProduct.previewImage || "").split("?")[0];
  if (product.image !== expectedImage) errors.push(`${label}: image does not match the catalog preview (${expectedImage})`);
  const imagePath = path.join(root, product.image || "");
  if (!fs.existsSync(imagePath) || !fs.statSync(imagePath).isFile()) errors.push(`${label}: selected preview image is missing`);
  if (/ \d+\.jpg$/i.test(product.image || "")) errors.push(`${label}: numbered alternate preview must not be used as the primary image`);

  const pagePath = path.join(root, product.file || "");
  if (!fs.existsSync(pagePath) || !fs.statSync(pagePath).isFile()) {
    errors.push(`${label}: detail page is missing`);
    continue;
  }
  const html = fs.readFileSync(pagePath, "utf8");
  const canonical = `${siteOrigin}/${product.file}`;
  const imageUrl = `${siteOrigin}/${product.image}`;
  const imageId = `${canonical}#primaryimage`;
  const hasIndexableParent = !/[?#]/.test(product.parentUrl || "");
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() || "";
  const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1]?.trim() || "";
  if (!title || title.length > 65) errors.push(`${label}: title must be present and at most 65 characters`);
  if (!description || description.length > 165) errors.push(`${label}: meta description must be present and at most 165 characters`);
  if (titles.has(title)) errors.push(`${label}: duplicate title`);
  if (descriptions.has(description)) errors.push(`${label}: duplicate meta description`);
  titles.add(title);
  descriptions.add(description);
  if (!html.includes(`<link rel="canonical" href="${canonical}">`)) errors.push(`${label}: canonical is missing or mismatched`);
  let graph = [];
  try {
    graph = values(html, /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)
      .flatMap((value) => {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed?.["@graph"]) ? parsed["@graph"] : [parsed];
      });
  } catch (error) {
    errors.push(`${label}: structured data is invalid JSON (${error.message})`);
  }
  const webPage = graph.find((node) => hasType(node, "WebPage") && node?.["@id"] === `${canonical}#page`);
  const service = graph.find((node) => hasType(node, "Service") && node?.["@id"] === `${canonical}#service`);
  const imageObject = graph.find((node) => hasType(node, "ImageObject") && node?.["@id"] === imageId);
  const breadcrumb = graph.find((node) => hasType(node, "BreadcrumbList") && node?.["@id"] === `${canonical}#breadcrumb`);
  if (!service || service.identifier !== product.reference) errors.push(`${label}: Service schema or identifier is missing`);
  if (!hasIndexableParent && (!/feasibility review/i.test(service?.name || "") || !/feasibility review/i.test(service?.serviceType || ""))) {
    errors.push(`${label}: feasibility-only reference must be qualified in its Service name and serviceType`);
  }
  if (webPage?.primaryImageOfPage?.["@id"] !== imageId) errors.push(`${label}: WebPage primaryImageOfPage is missing or mismatched`);
  if (service?.image?.["@id"] !== imageId) errors.push(`${label}: Service schema does not reference the primary ImageObject`);
  if (!imageObject || imageObject.url !== imageUrl || imageObject.contentUrl !== imageUrl ||
      Number(imageObject.width) !== Number(product.width) || Number(imageObject.height) !== Number(product.height) ||
      imageObject.representativeOfPage !== true) {
    errors.push(`${label}: primary ImageObject is missing or mismatched`);
  }
  const expectedBreadcrumb = [
    { position: 1, name: "Home", item: `${siteOrigin}/` },
    { position: 2, name: "Products", item: `${siteOrigin}/products.html` },
    ...(hasIndexableParent
      ? [{ position: 3, name: product.parentName, item: `${siteOrigin}/${product.parentUrl}` }]
      : []),
    {
      position: hasIndexableParent ? 4 : 3,
      name: product.title,
      item: canonical,
    },
  ];
  const actualBreadcrumb = Array.isArray(breadcrumb?.itemListElement)
    ? breadcrumb.itemListElement.map(({ position, name, item }) => ({ position, name, item }))
    : [];
  if (JSON.stringify(actualBreadcrumb) !== JSON.stringify(expectedBreadcrumb)) {
    errors.push(`${label}: BreadcrumbList does not match the visible commercial hierarchy`);
  }
  if (/"@type"\s*:\s*"(?:Product|Offer|AggregateOffer)"/i.test(html)) errors.push(`${label}: Product or Offer schema must not be published without verified commerce data`);
  if (/\breference\s+reference\b/i.test(html)) errors.push(`${label}: duplicated “Reference Reference” copy is not allowed`);
  if (!html.includes(`src="${product.image}"`) || !html.includes(`width="${product.width}"`) || !html.includes(`height="${product.height}"`)) errors.push(`${label}: primary image path or dimensions are mismatched`);
  const heroStart = html.indexOf('<section class="reference-hero">');
  const heroEnd = heroStart >= 0 ? html.indexOf("</section>", heroStart) : -1;
  const heroHtml = heroStart >= 0 && heroEnd > heroStart ? html.slice(heroStart, heroEnd) : "";
  const classCount = (className) => (heroHtml.match(new RegExp(`class="[^"]*\\b${className}\\b[^"]*"`, "g")) || []).length;
  const introIndex = heroHtml.indexOf('class="reference-hero__intro"');
  const mediaIndex = heroHtml.indexOf('class="reference-hero__media"');
  const detailsIndex = heroHtml.indexOf('class="reference-hero__details"');
  if (classCount("reference-hero__intro") !== 1 ||
      classCount("reference-hero__media") !== 1 ||
      classCount("reference-hero__details") !== 1 ||
      !(introIndex >= 0 && mediaIndex > introIndex && detailsIndex > mediaIndex)) {
    errors.push(`${label}: reference hero must expose intro, primary image, and commercial details in that DOM order`);
  }
  if (/reference-hero__copy/i.test(heroHtml)) errors.push(`${label}: legacy monolithic reference-hero copy wrapper remains`);
  const introHtml = introIndex >= 0 && mediaIndex > introIndex ? heroHtml.slice(introIndex, mediaIndex) : "";
  const mediaHtml = mediaIndex >= 0 && detailsIndex > mediaIndex ? heroHtml.slice(mediaIndex, detailsIndex) : "";
  const detailsHtml = detailsIndex >= 0 ? heroHtml.slice(detailsIndex) : "";
  if (!/breadcrumbs/i.test(introHtml) || !/class="eyebrow"/i.test(introHtml) || !/<h1\b/i.test(introHtml) || !/reference-hero__lead/i.test(introHtml)) {
    errors.push(`${label}: mobile-first reference intro must contain the title and lead before the image`);
  }
  if (!mediaHtml.includes(`src="${product.image}"`) || !/<figcaption\b/i.test(mediaHtml)) {
    errors.push(`${label}: primary media must contain the matched image and its evidence caption`);
  }
  if (!/hero__actions/i.test(detailsHtml) || !/reference-facts/i.test(detailsHtml) || !/reference-note/i.test(detailsHtml)) {
    errors.push(`${label}: commercial actions, facts, and evidence boundary must follow the primary image`);
  }
  if (!html.includes(`<meta property="og:image" content="${imageUrl}">`) ||
      !html.includes(`<meta property="og:image:width" content="${product.width}">`) ||
      !html.includes(`<meta property="og:image:height" content="${product.height}">`) ||
      !html.includes(`<meta property="og:image:alt" content="${product.alt}">`) ||
      !html.includes(`<meta name="twitter:image:alt" content="${product.alt}">`)) {
    errors.push(`${label}: social primary-image metadata is missing or mismatched`);
  }
  const visibleBreadcrumb = html.match(/<ol\s+class="breadcrumbs"[^>]*>[\s\S]*?<\/ol>/i)?.[0] || "";
  if (!visibleBreadcrumb.includes(`<a href="products.html">Products</a>`)) errors.push(`${label}: visible Products breadcrumb is missing`);
  if (hasIndexableParent && !visibleBreadcrumb.includes(`<a href="${product.parentUrl}">${product.parentName}</a>`)) {
    errors.push(`${label}: visible parent breadcrumb is missing or mismatched`);
  }
  if (!html.includes(`catalog=${product.reference}`)) errors.push(`${label}: quote link does not carry the catalog reference`);
  if (!/Evidence boundary:|Reference boundary:/i.test(html)) errors.push(`${label}: visible evidence boundary is missing`);
  if (/finerpackaging\.en\.alibaba\.com/i.test(html)) errors.push(`${label}: legacy source URL appears in page content`);
  const wordCount = visibleWords(html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] || "").length;
  if (wordCount < 350) errors.push(`${label}: main content is too thin (${wordCount} visible words)`);
  if (!productsHtml.includes(`href="${product.file}"`)) errors.push(`${label}: products.html has no crawlable static link`);
  const cardImage = `assets/catalog/products/${product.id}.jpg`;
  if (!fs.existsSync(path.join(root, cardImage))) errors.push(`${label}: responsive 480px card image is missing`);
  if (!productsHtml.includes(`src="${cardImage}" srcset="${cardImage} 480w, ${product.image} ${product.width}w" sizes="${curatedCardSizes}"`)) {
    errors.push(`${label}: products.html responsive card image is missing or mismatched`);
  }
  if (!catalogJs.includes(`href: "${product.file}"`)) errors.push(`${label}: catalog.js has no full-detail link mapping`);
  if (!sitemap.includes(`<loc>${canonical}</loc>`)) errors.push(`${label}: sitemap entry is missing`);
  if (!imageEntries.some((entry) => entry.page === canonical && entry.image === imageUrl)) {
    errors.push(`${label}: image-sitemap.xml page/image pair is missing or mismatched`);
  }
  if (!llms.includes(`](${canonical})`)) errors.push(`${label}: llms.txt entry is missing`);
  const inboundPages = rootHtmlPages.filter((page) => page.file !== product.file && page.html.includes(`href="${product.file}"`));
  if (inboundPages.length < 2) {
    errors.push(`${label}: needs at least two crawlable contextual inbound pages, found ${inboundPages.length}`);
  }
}

if (errors.length) {
  console.error(`Curated product validation failed (${errors.length}):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Validated ${manifest.length} curated product references: catalog mapping, unique metadata, WebPage/Service/ImageObject graph, commercial breadcrumbs, evidence boundaries, responsive primary images, social previews, contextual inbound links, page and image sitemaps, llms.txt, and quote attribution are consistent.`);
