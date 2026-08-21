import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import process from "node:process";

const root = path.resolve(process.argv[2] || ".");
const conflictCopyPattern = / \d+\.html$/i;
const rootHtmlFiles = fs.readdirSync(root).filter((file) => file.endsWith(".html")).sort();
const ignoredHtmlConflictCopies = rootHtmlFiles.filter((file) => conflictCopyPattern.test(file));
const htmlFiles = rootHtmlFiles.filter((file) => !conflictCopyPattern.test(file));
const errors = [];
const warnings = [];
if (ignoredHtmlConflictCopies.length) {
  warnings.push(`ignored ${ignoredHtmlConflictCopies.length} numbered HTML conflict copies: ${ignoredHtmlConflictCopies.join(", ")}`);
}
const canonicalOwners = new Map();
const titleOwners = new Map();
const articleModifiedByCanonical = new Map();
const articleEntriesByCanonical = new Map();
let blogSchema = null;
const pageCache = new Map();
const siteOrigin = "https://glorystarpacking.com";
const quoteFieldNames = ["name", "email", "product", "quantity", "country", "targetDate", "details", "attachment", "website"];
const quoteFieldLimits = {
  name: "120",
  email: "180",
  phone: "80",
  quantity: "80",
  dimensions: "160",
  country: "120",
  targetDate: "120",
  details: "3000",
  website: "100",
};
const contextualQuoteRoutes = {
  "ecommerce-mailer-box-sizing-transit-test.html": "custom-mailer-boxes.html#quote",
  "luxury-unboxing-guide.html": "custom-boxes.html#quote",
  "magnetic-box-vs-drawer-box.html": "custom-boxes.html#quote",
  "packaging-inserts-material-comparison.html": "custom-packaging-inserts.html#quote",
  "rigid-box-cost-drivers.html": "custom-rigid-boxes.html#quote",
  "rigid-box-vs-folding-carton.html": "custom-boxes.html#quote",
  "wine-label-condensation-adhesive-testing.html": "custom-wine-labels.html#quote",
};
const avifHeroStems = new Set([
  "black-embossed-box",
  "cosmetic-packaging",
  "factory-printing-floor",
  "industrial-waterproof-labels",
  "luxury-packaging-set",
  "packaging-dieline-blueprint",
  "presentation-box",
  "warehouse-cartons",
  "warehouse-shipping-box",
  "watch-display-box",
]);
const responsiveCardWidths = [512, 768];
const responsiveCardSpecs = [
  {
    key: "product",
    expectedUsageCount: 97,
    sizes: "(max-width: 780px) calc(100vw - 28px), (max-width: 1040px) calc((100vw - 58px) / 2), 379px",
    blockPattern: /<div\b[^>]*class="[^"]*\bproduct-card__media\b[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
  },
  {
    key: "article",
    expectedUsageCount: 30,
    sizes: "(max-width: 780px) calc(100vw - 28px), 310px",
    blockPattern: /<article\b[^>]*class="[^"]*\barticle-card\b[^"]*"[^>]*>[\s\S]*?<\/article>/gi,
  },
];
const responsiveCardUsageCounts = new Map(responsiveCardSpecs.map((spec) => [spec.key, 0]));
const responsiveCardStems = new Set();
let responsiveSrcsetUsageCount = 0;
const priorityPages = [
  "custom-packaging-quality-inspection-checklist.html",
  "custom-packaging-rfq-template.html",
  "waterproof-label-testing-guide.html",
  "clear-label-white-ink-artwork-guide.html",
  "perfume-box-insert-checklist.html",
  "wine-bottle-gift-box-specification.html",
  "hang-tag-production-checklist.html",
  "custom-tissue-paper-printing-guide.html",
  "verify-fsc-packaging-supplier.html",
  "paper-tube-packaging-size-guide.html",
  "jewelry-box-insert-design-guide.html",
  "corrugated-shipping-box-specification-guide.html",
  "collapsible-rigid-box-vs-setup-box.html",
  "rigid-box-vs-folding-carton.html",
  "custom-packaging-dieline-artwork-requirements.html",
  "custom-packaging-china-vs-local-supplier.html",
  "low-moq-custom-packaging-small-business.html",
  "exw-fob-cif-ddp-packaging-sourcing-guide.html",
  "ecommerce-mailer-box-sizing-transit-test.html",
  "wine-label-condensation-adhesive-testing.html",
  "pantone-color-matching-packaging.html",
  "packaging-inserts-material-comparison.html",
  "rigid-box-cost-drivers.html",
  "custom-wine-boxes.html",
  "custom-perfume-boxes.html",
  "custom-clear-labels.html",
  "custom-waterproof-labels.html",
  "packaging-sample-approval-checklist.html",
  "custom-packaging-cost-moq-guide.html",
  "magnetic-box-vs-drawer-box.html",
];
const requiredRobotsDirective = "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";
const requiredSiteStyleVersion = "20260821-1";
const requiredSiteScriptVersion = "20260821-2";
const requiredAnalyticsVersion = "20260820-4";
const requiredAnalyticsMeasurementId = "G-LYNMPWG9WK";
const hangTagTemplatePath = path.join(root, "assets", "templates", "hang-tag-variable-data-template.csv");
const wineGiftBoxTemplatePath = path.join(root, "assets", "templates", "wine-bottle-gift-box-rfq-template.csv");
const perfumeInsertTemplatePath = path.join(root, "assets", "templates", "perfume-box-insert-rfq-template.csv");
const clearLabelTrialTemplatePath = path.join(root, "assets", "templates", "clear-label-artwork-trial-template.csv");
const waterproofLabelTestTemplatePath = path.join(root, "assets", "templates", "waterproof-label-test-matrix-template.csv");
const packagingRfqTemplatePath = path.join(root, "assets", "templates", "custom-packaging-rfq-template.csv");
const packagingInspectionTemplatePath = path.join(root, "assets", "templates", "custom-packaging-quality-inspection-template.csv");

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

const readUint24LE = (buffer, offset) => (
  buffer[offset] |
  (buffer[offset + 1] << 8) |
  (buffer[offset + 2] << 16)
);

const readWebpDimensions = (filePath) => {
  const buffer = fs.readFileSync(filePath);
  if (buffer.length < 20 ||
      buffer.toString("ascii", 0, 4) !== "RIFF" ||
      buffer.toString("ascii", 8, 12) !== "WEBP") {
    throw new Error("invalid RIFF/WebP header");
  }

  for (let offset = 12; offset + 8 <= buffer.length;) {
    const chunkType = buffer.toString("ascii", offset, offset + 4);
    const chunkLength = buffer.readUInt32LE(offset + 4);
    const dataOffset = offset + 8;
    if (dataOffset + chunkLength > buffer.length) throw new Error("truncated WebP chunk");

    if (chunkType === "VP8X" && chunkLength >= 10) {
      return {
        width: readUint24LE(buffer, dataOffset + 4) + 1,
        height: readUint24LE(buffer, dataOffset + 7) + 1,
      };
    }
    if (chunkType === "VP8 " && chunkLength >= 10) {
      if (buffer[dataOffset + 3] !== 0x9d ||
          buffer[dataOffset + 4] !== 0x01 ||
          buffer[dataOffset + 5] !== 0x2a) {
        throw new Error("invalid VP8 frame header");
      }
      return {
        width: buffer.readUInt16LE(dataOffset + 6) & 0x3fff,
        height: buffer.readUInt16LE(dataOffset + 8) & 0x3fff,
      };
    }
    if (chunkType === "VP8L" && chunkLength >= 5) {
      if (buffer[dataOffset] !== 0x2f) throw new Error("invalid VP8L frame header");
      return {
        width: 1 + buffer[dataOffset + 1] + ((buffer[dataOffset + 2] & 0x3f) << 8),
        height: 1 +
          ((buffer[dataOffset + 2] & 0xc0) >> 6) +
          (buffer[dataOffset + 3] << 2) +
          ((buffer[dataOffset + 4] & 0x0f) << 10),
      };
    }

    offset = dataOffset + chunkLength + (chunkLength & 1);
  }

  throw new Error("missing VP8 image chunk");
};

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

if (!fs.existsSync(hangTagTemplatePath)) {
  errors.push("Hang tag variable-data CSV template is missing");
} else {
  const templateHeader = fs.readFileSync(hangTagTemplatePath, "utf8").split(/\r?\n/, 1)[0].split(",");
  const requiredTemplateFields = ["record_id", "sku", "gtin_or_barcode_data", "barcode_symbology", "artwork_version", "attachment_code", "pack_group", "quantity", "record_status"];
  requiredTemplateFields.forEach((field) => {
    if (!templateHeader.includes(field)) errors.push(`Hang tag variable-data CSV template is missing ${field}`);
  });
}

if (!fs.existsSync(wineGiftBoxTemplatePath)) {
  errors.push("Wine bottle gift box RFQ CSV template is missing");
} else {
  const templateHeader = fs.readFileSync(wineGiftBoxTemplatePath, "utf8").split(/\r?\n/, 1)[0].split(",");
  const requiredTemplateFields = ["record_id", "bottle_sku", "filled_weight_g", "overall_height_mm", "max_body_diameter_mm", "protected_surfaces", "bottles_per_gift_box", "insert_route", "units_per_master_carton", "distribution_route", "test_or_acceptance_reference", "record_status"];
  requiredTemplateFields.forEach((field) => {
    if (!templateHeader.includes(field)) errors.push(`Wine bottle gift box RFQ CSV template is missing ${field}`);
  });
}

if (!fs.existsSync(perfumeInsertTemplatePath)) {
  errors.push("Perfume box insert RFQ CSV template is missing");
} else {
  const templateHeader = fs.readFileSync(perfumeInsertTemplatePath, "utf8").split(/\r?\n/, 1)[0].split(",");
  const requiredTemplateFields = ["record_id", "bottle_sku", "filled_weight_g", "max_length_mm", "max_width_mm", "assembled_height_mm", "pump_collar_cap_revision", "spray_cap_no_contact_zone", "protected_surfaces", "permitted_support_zones", "insert_route", "removal_method", "gift_set_configuration", "units_per_master_carton", "distribution_route", "dangerous_goods_classification_owner", "test_or_acceptance_reference", "record_status"];
  requiredTemplateFields.forEach((field) => {
    if (!templateHeader.includes(field)) errors.push(`Perfume box insert RFQ CSV template is missing ${field}`);
  });
}

if (!fs.existsSync(clearLabelTrialTemplatePath)) {
  errors.push("Clear label artwork trial CSV template is missing");
} else {
  const templateHeader = fs.readFileSync(clearLabelTrialTemplatePath, "utf8").split(/\r?\n/, 1)[0].split(",");
  const requiredTemplateFields = ["record_id", "label_sku", "artwork_revision", "container_sku", "contents_color", "film_construction", "print_side", "white_ink_treatment", "white_ink_layer_name", "white_choke_or_trap_owner", "clear_window_definition", "barcode_data_owner", "application_method", "trial_condition", "observation_timepoint", "acceptance_reference", "record_status"];
  requiredTemplateFields.forEach((field) => {
    if (!templateHeader.includes(field)) errors.push(`Clear label artwork trial CSV template is missing ${field}`);
  });
}

if (!fs.existsSync(waterproofLabelTestTemplatePath)) {
  errors.push("Waterproof label test matrix CSV template is missing");
} else {
  const templateHeader = fs.readFileSync(waterproofLabelTestTemplatePath, "utf8").split(/\r?\n/, 1)[0].split(",");
  const requiredTemplateFields = ["record_id", "label_sku", "construction_revision", "substrate_sku", "substrate_material", "application_temperature_c", "application_pressure_control", "dwell_before_exposure_h", "exposure_sequence_id", "exposure_medium", "exposure_temperature_c", "exposure_duration", "exposure_cycles", "rub_medium", "rub_load_or_method", "rub_cycles", "inspection_checkpoint", "edge_lift_limit", "print_change_limit", "adhesion_acceptance", "barcode_data_and_grade_owner", "reference_sample_id", "result", "disposition", "record_status"];
  requiredTemplateFields.forEach((field) => {
    if (!templateHeader.includes(field)) errors.push(`Waterproof label test matrix CSV template is missing ${field}`);
  });
}

if (!fs.existsSync(packagingRfqTemplatePath)) {
  errors.push("Custom packaging RFQ CSV template is missing");
} else {
  const templateHeader = fs.readFileSync(packagingRfqTemplatePath, "utf8").split(/\r?\n/, 1)[0].split(",");
  const requiredTemplateFields = ["rfq_id", "rfq_revision", "configuration_id", "dimension_basis", "artwork_version", "order_quantity", "sample_requirement", "units_per_master_carton", "incoterm_rule", "named_place", "supplier_quote_revision", "unit_price", "tooling_and_one_time_charges", "freight_included", "lead_time_basis", "exclusions_and_assumptions", "deviation_log", "response_status"];
  requiredTemplateFields.forEach((field) => {
    if (!templateHeader.includes(field)) errors.push(`Custom packaging RFQ CSV template is missing ${field}`);
  });
}

if (!fs.existsSync(packagingInspectionTemplatePath)) {
  errors.push("Custom packaging quality inspection CSV template is missing");
} else {
  const templateHeader = fs.readFileSync(packagingInspectionTemplatePath, "utf8").split(/\r?\n/, 1)[0].split(",");
  const requiredTemplateFields = ["inspection_id", "inspection_revision", "factory_site", "configuration_id", "specification_revision", "approved_sample_id", "production_lot_id", "lot_definition", "inspection_stage", "sampling_plan_owner", "sampling_standard_and_revision", "sample_size", "acceptance_rejection_rule", "random_selection_method", "characteristic_id", "requirement_or_tolerance", "observed_value", "defect_code", "defect_classification_owner", "photo_or_evidence_reference", "lot_decision", "shipment_hold_status", "containment_action", "corrective_action_owner", "reinspection_plan_reference", "concession_reference", "release_authority", "record_status"];
  requiredTemplateFields.forEach((field) => {
    if (!templateHeader.includes(field)) errors.push(`Custom packaging quality inspection CSV template is missing ${field}`);
  });
}

for (const file of htmlFiles) {
  const page = readPage(file);
  const { html, ids } = page;
  const isErrorPage = file === "404.html";
  const titles = values(html, /<title>([\s\S]*?)<\/title>/gi);
  const h1s = values(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi);
  const descriptions = values(html, /<meta\s+name="description"\s+content="([^"]*)"/gi);
  const robotsDirectives = values(html, /<meta\s+name="robots"\s+content="([^"]*)"/gi);
  const canonicals = values(html, /<link\s+rel="canonical"\s+href="([^"]+)"/gi);
  const ogUrls = values(html, /<meta\s+property="og:url"\s+content="([^"]*)"/gi);
  const ogImages = values(html, /<meta\s+property="og:image"\s+content="([^"]*)"/gi);
  const twitterImages = values(html, /<meta\s+name="twitter:image"\s+content="([^"]*)"/gi);
  const appleTouchIcons = values(html, /<link\s+rel="apple-touch-icon"\s+href="([^"]+)"/gi);
  const earlyEnhancementMarkers = html.match(/<script>document\.documentElement\.classList\.add\("js"\);<\/script>/g) || [];

  if (titles.length !== 1) errors.push(`${file}: expected 1 title, found ${titles.length}`);
  if (h1s.length !== 1) errors.push(`${file}: expected 1 H1, found ${h1s.length}`);
  if (descriptions.length !== 1) errors.push(`${file}: expected 1 meta description, found ${descriptions.length}`);
  if (earlyEnhancementMarkers.length !== 1) errors.push(`${file}: expected one early JavaScript enhancement marker`);
  if (robotsDirectives.length !== 1) errors.push(`${file}: expected 1 robots meta tag, found ${robotsDirectives.length}`);
  const expectedRobotsDirective = isErrorPage ? "noindex,follow" : requiredRobotsDirective;
  if (robotsDirectives[0] && robotsDirectives[0] !== expectedRobotsDirective) {
    errors.push(`${file}: robots meta directives are inconsistent`);
  }
  const expectedCanonicalCount = isErrorPage ? 0 : 1;
  if (canonicals.length !== expectedCanonicalCount) errors.push(`${file}: expected ${expectedCanonicalCount} canonical, found ${canonicals.length}`);
  if (!isErrorPage && ogUrls.length !== 1) errors.push(`${file}: expected 1 og:url, found ${ogUrls.length}`);
  if (!isErrorPage && ogImages.length !== 1) errors.push(`${file}: expected 1 og:image, found ${ogImages.length}`);
  if (!isErrorPage && twitterImages.length !== 1) errors.push(`${file}: expected 1 twitter:image, found ${twitterImages.length}`);
  if (appleTouchIcons.length !== 1 || appleTouchIcons[0] !== "/assets/logo-512.png") {
    errors.push(`${file}: expected the 512px Apple touch icon`);
  }
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
  if (canonicals[0] && !isErrorPage) {
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

  const visibleMarkupWithoutLinks = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, "");
  if (/kevin@glorystarpack\.com/i.test(visibleMarkupWithoutLinks)) {
    errors.push(`${file}: visible contact email must be a mailto link`);
  }
  if (/\+86[\s-]*180[\s-]*2075[\s-]*5949/i.test(visibleMarkupWithoutLinks)) {
    errors.push(`${file}: visible contact phone must be a clickable link`);
  }

  const jsonLdBlocks = values(html, /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
  const schemaFaqItems = [];
  const schemaItemLists = [];
  let pageArticleSchema = null;
  if (!jsonLdBlocks.length && !isErrorPage) warnings.push(`${file}: no JSON-LD block`);
  jsonLdBlocks.forEach((block, index) => {
    try {
      const data = JSON.parse(block);
      const visit = (value) => {
        if (!value || typeof value !== "object") return;
        if (value["@type"] === "Article") pageArticleSchema = value;
        if (value["@type"] === "Blog") blogSchema = value;
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

  if (pageArticleSchema) {
    const author = pageArticleSchema.author;
    const expectedAuthorId = `${siteOrigin}/about.html#packaging-team`;
    if (
      !author ||
      author["@type"] !== "Organization" ||
      author["@id"] !== expectedAuthorId ||
      author.name !== "GloryStarPack Packaging Team" ||
      author.url !== expectedAuthorId
    ) {
      errors.push(`${file}: article author must identify the visible Packaging Team entity`);
    }
    const articleMeta = html.match(/<p\b[^>]*class="[^"]*\barticle-meta\b[^"]*"[^>]*>([\s\S]*?)<\/p>/i)?.[1] || "";
    if (!/^\s*By\s+<a\b[^>]*href="about\.html#packaging-team"/i.test(articleMeta)) {
      errors.push(`${file}: visible article byline must link to the Packaging Team profile`);
    }

    const schemaPublishedDate = String(pageArticleSchema.datePublished || "").trim();
    const schemaModifiedDate = String(pageArticleSchema.dateModified || "").trim();
    const visiblePublishedDates = values(articleMeta, /<time\b[^>]*datetime="(\d{4}-\d{2}-\d{2})"[^>]*>\s*Published\b/gi);
    const visibleUpdatedDates = values(articleMeta, /<time\b[^>]*datetime="(\d{4}-\d{2}-\d{2})"[^>]*>\s*Updated\b/gi);
    if (visiblePublishedDates.length !== 1 || visiblePublishedDates[0] !== schemaPublishedDate) {
      errors.push(`${file}: visible Published date must match Article datePublished`);
    }
    const needsVisibleUpdate = schemaModifiedDate && schemaModifiedDate !== schemaPublishedDate;
    if (needsVisibleUpdate && (visibleUpdatedDates.length !== 1 || visibleUpdatedDates[0] !== schemaModifiedDate)) {
      errors.push(`${file}: visible Updated date must match Article dateModified`);
    }
    if (!needsVisibleUpdate && visibleUpdatedDates.length) {
      errors.push(`${file}: visible Updated date must be omitted when published and modified dates are equal`);
    }

    const schemaModifiedDates = schemaModifiedDate ? [schemaModifiedDate] : [];
    const metaModifiedDates = values(html, /<meta\s+property="article:modified_time"\s+content="(\d{4}-\d{2}-\d{2})"/gi);
    if (schemaModifiedDates.length !== 1 || metaModifiedDates.length !== 1) {
      errors.push(`${file}: article must have one schema and one Open Graph modified date`);
    } else if (schemaModifiedDates[0] !== metaModifiedDates[0]) {
      errors.push(`${file}: article schema and Open Graph modified dates do not match`);
    } else if (canonicals[0]) {
      articleModifiedByCanonical.set(canonicals[0], schemaModifiedDates[0]);
    }
    if (canonicals[0]) {
      articleEntriesByCanonical.set(canonicals[0], {
        file,
        headline: String(pageArticleSchema.headline || "").trim(),
        datePublished: schemaPublishedDate,
      });
    }
  }

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
    if (src?.startsWith("assets/images/") && !src.split(/[?#]/)[0].endsWith(".webp")) {
      errors.push(`${file}: displayed local image must use WebP "${src}"`);
    }
    if (src && !/^(?:https?:|data:|\/)/.test(src)) {
      const sourcePath = path.join(root, src.split(/[?#]/)[0]);
      if (!fs.existsSync(sourcePath)) errors.push(`${file}: missing image "${src}"`);
    }
  }

  responsiveSrcsetUsageCount += imageTags.filter((tag) => (
    /\ssrcset="assets\/images\/[^" ]+-w512\.webp 512w, assets\/images\/[^" ]+-w768\.webp 768w, assets\/images\/[^" ]+\.webp 1024w"/i.test(tag)
  )).length;
  for (const spec of responsiveCardSpecs) {
    for (const match of html.matchAll(spec.blockPattern)) {
      const imageTag = match[0].match(/<img\b[^>]*>/i)?.[0] || "";
      const src = attribute(imageTag, "src");
      const stem = src.match(/^assets\/images\/([^/]+)\.webp$/i)?.[1] || "";
      responsiveCardUsageCounts.set(spec.key, responsiveCardUsageCounts.get(spec.key) + 1);
      if (!stem) {
        errors.push(`${file}: ${spec.key} card image must retain its original local WebP src`);
        continue;
      }

      responsiveCardStems.add(stem);
      const expectedSrcset = [
        `assets/images/${stem}-w512.webp 512w`,
        `assets/images/${stem}-w768.webp 768w`,
        `assets/images/${stem}.webp 1024w`,
      ].join(", ");
      if (attribute(imageTag, "srcset") !== expectedSrcset) {
        errors.push(`${file}: ${spec.key} card image "${stem}" has an incomplete responsive srcset`);
      }
      if (attribute(imageTag, "sizes") !== spec.sizes) {
        errors.push(`${file}: ${spec.key} card image "${stem}" has an incorrect sizes rule`);
      }
      if (attribute(imageTag, "width") !== "1024" || attribute(imageTag, "height") !== "1024") {
        errors.push(`${file}: ${spec.key} card image "${stem}" must retain its 1024x1024 fallback dimensions`);
      }
    }
  }

  const imagePreloads = values(html, /<link\b[^>]*rel="preload"[^>]*as="image"[^>]*href="([^"]+)"/gi);
  imagePreloads.forEach((href) => {
    if (href.startsWith("assets/images/") && !/\.(?:avif|webp)$/i.test(href.split(/[?#]/)[0])) {
      errors.push(`${file}: local image preload must use AVIF or WebP "${href}"`);
    }
  });
  for (const stem of avifHeroStems) {
    const webpPath = `assets/images/${stem}.webp`;
    const avifPath = `assets/images/${stem}.avif`;
    if (html.includes(`rel="preload" as="image" href="${webpPath}"`)) {
      errors.push(`${file}: selected hero "${stem}" must preload its AVIF source`);
    }
    if (!html.includes(`href="${avifPath}"`)) continue;
    if (!html.includes(`rel="preload" as="image" type="image/avif" href="${avifPath}" fetchpriority="high"`)) {
      errors.push(`${file}: AVIF hero preload for "${stem}" is incomplete`);
    }
    if (!html.includes(`<picture><source type="image/avif" srcset="${avifPath}"><img src="${webpPath}"`)) {
      errors.push(`${file}: AVIF hero "${stem}" must keep a WebP picture fallback`);
    }
  }

  if (/fonts\.(?:googleapis|gstatic)\.com/i.test(html)) {
    errors.push(`${file}: external Google Fonts request must not be present`);
  }
  const fontPreloads = values(html, /<link\b[^>]*rel="preload"[^>]*as="font"[^>]*href="([^"]+)"/gi);
  const displayFontPreload = "/assets/fonts/bodoni-moda-latin-v28.woff2";
  const bodyFontPreload = "/assets/fonts/manrope-latin-v20.woff2";
  if (!fontPreloads.includes(displayFontPreload)) {
    errors.push(`${file}: missing LCP display-font preload "${displayFontPreload}"`);
  }
  if (fontPreloads.includes(bodyFontPreload)) {
    errors.push(`${file}: body font must load on demand instead of competing with the LCP font`);
  }

  const forms = [...html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/gi)];
  const quoteForms = forms.filter((match) => /\bclass="[^"]*\bquote-form\b[^"]*"/i.test(match[1]));
  quoteForms.forEach((match, formIndex) => {
    const openingAttributes = match[1];
    const body = match[2];
    const formLabel = `${file}: quote form ${formIndex + 1}`;
    if (attribute(openingAttributes, "action") !== "/api/quote") errors.push(`${formLabel} must post to /api/quote`);
    if (attribute(openingAttributes, "method").toLowerCase() !== "post") errors.push(`${formLabel} must use POST`);
    if (attribute(openingAttributes, "enctype") !== "application/x-www-form-urlencoded") {
      errors.push(`${formLabel} must use application/x-www-form-urlencoded for the no-JavaScript fallback`);
    }

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
    const sourcePage = controlByName.get("sourcePage") || "";
    const expectedSourcePage = file === "index.html" ? "/" : `/${file}`;
    if (attribute(sourcePage, "type").toLowerCase() !== "hidden" || attribute(sourcePage, "value") !== expectedSourcePage) {
      errors.push(`${formLabel} must keep a static hidden sourcePage of "${expectedSourcePage}" for no-JavaScript recovery`);
    }
    Object.entries(quoteFieldLimits).forEach(([name, limit]) => {
      const control = controlByName.get(name) || "";
      if (attribute(control, "maxlength") !== limit) {
        errors.push(`${formLabel} field "${name}" must use maxlength="${limit}"`);
      }
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
    if (!/Add larger or source files by Email or WhatsApp after sending the brief\./i.test(body)) {
      errors.push(`${formLabel} must explain the larger/source-file fallback`);
    }
    if (!/<a\b[^>]*href="privacy\.html"/i.test(body)) errors.push(`${formLabel} is missing a privacy notice link`);
    const noscriptNote = body.match(/<noscript>([\s\S]*?)<\/noscript>/i)?.[1] || "";
    if (!/mailto:kevin@GloryStarPack\.com/i.test(noscriptNote) || !/https:\/\/wa\.me\/8618020755949/i.test(noscriptNote)) {
      errors.push(`${formLabel} no-JavaScript guidance must provide valid Email and WhatsApp routes`);
    }
  });

  const productCards = html.match(/<article\b[^>]*class="[^"]*\bproduct-card\b[^"]*"[^>]*>[\s\S]*?<\/article>/gi) || [];
  productCards.forEach((card, index) => {
    const cardLabel = file + ": product card " + (index + 1);
    const hrefs = values(card, /<a\b[^>]*\shref="([^"]+)"/gi);
    const duplicateHref = hrefs.find((href, hrefIndex) => hrefs.indexOf(href) !== hrefIndex);
    if (duplicateHref) errors.push(cardLabel + " repeats destination \"" + duplicateHref + "\" across multiple links");

    const openingTag = card.match(/^<article\b[^>]*>/i)?.[0] || "";
    if (/\bproduct-card--linked\b/i.test(attribute(openingTag, "class"))) {
      if (hrefs.length !== 1) errors.push(cardLabel + " linked-card pattern must expose exactly one link");
      if (!/<h3>\s*<a\b/i.test(card)) errors.push(cardLabel + " linked-card pattern must keep its heading as the link");
      if (!/<span\b[^>]*class="text-link product-card__cta"[^>]*aria-hidden="true"/i.test(card)) {
        errors.push(cardLabel + " linked-card pattern must keep a visual, assistive-technology-hidden CTA");
      }
    }
  });

  const tableRegions = html.match(/<div\b[^>]*class="[^"]*\btable-wrap\b[^"]*"[^>]*>[\s\S]*?<\/table>\s*<\/div>/gi) || [];
  tableRegions.forEach((region, index) => {
    const regionLabel = file + ": table region " + (index + 1);
    const openingTag = region.match(/^<div\b[^>]*>/i)?.[0] || "";
    const captionId = attribute(openingTag, "aria-labelledby");
    const hintId = attribute(openingTag, "aria-describedby");
    if (attribute(openingTag, "tabindex") !== "0") errors.push(regionLabel + " must be keyboard focusable");
    if (attribute(openingTag, "role") !== "region") errors.push(regionLabel + " must use role=\"region\"");
    if (!captionId || !region.includes('<caption id="' + captionId + '">')) {
      errors.push(regionLabel + " must be labelled by its table caption");
    }
    if (!hintId || !html.includes('<p class="table-scroll-hint" id="' + hintId + '">Scroll horizontally to view all columns →</p>')) {
      errors.push(regionLabel + " must reference the visible horizontal-scroll hint");
    }
  });

  for (const asset of values(html, /<(?:link|script)\b[^>]*(?:href|src)="(\/?assets\/[^"]+)"/gi)) {
    const assetPath = path.join(root, asset.replace(/^\//, "").split(/[?#]/)[0]);
    if (!fs.existsSync(assetPath)) errors.push(`${file}: missing asset "${asset}"`);
  }

  const siteStyleVersions = values(html, /<link\b[^>]*href="\/?assets\/site\.css\?v=([^"]+)"[^>]*>/gi);
  if (siteStyleVersions.length !== 1 || siteStyleVersions[0] !== requiredSiteStyleVersion) {
    errors.push(`${file}: expected site.css cache version ${requiredSiteStyleVersion}`);
  }

  const siteScriptVersions = values(html, /<script\b[^>]*src="\/?assets\/site\.js\?v=([^"]+)"[^>]*>/gi);
  if (siteScriptVersions.length !== 1 || siteScriptVersions[0] !== requiredSiteScriptVersion) {
    errors.push(`${file}: expected site.js cache version ${requiredSiteScriptVersion}`);
  }

  const analyticsScriptVersions = values(html, /<script\b[^>]*src="\/?assets\/analytics\.js\?v=([^"]+)"[^>]*>/gi);
  if (analyticsScriptVersions.length !== 1 || analyticsScriptVersions[0] !== requiredAnalyticsVersion) {
    errors.push(`${file}: expected analytics.js cache version ${requiredAnalyticsVersion}`);
  }
  const analyticsMeasurementIds = values(html, /<script\b[^>]*src="\/?assets\/analytics\.js\?v=[^"]+"[^>]*data-measurement-id="([^"]+)"[^>]*>/gi);
  if (analyticsMeasurementIds.length !== 1 || analyticsMeasurementIds[0] !== requiredAnalyticsMeasurementId) {
    errors.push(`${file}: expected GA4 measurement ID ${requiredAnalyticsMeasurementId}`);
  }

  const contextualQuoteRoute = contextualQuoteRoutes[file];
  if (contextualQuoteRoute) {
    if (html.includes('href="/#quote"')) {
      errors.push(`${file}: product-intent guide must not send quote CTAs to an unselected homepage form`);
    }
    if (!html.includes(`href="${contextualQuoteRoute}"`)) {
      errors.push(`${file}: expected contextual quote route "${contextualQuoteRoute}"`);
    }
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

for (const spec of responsiveCardSpecs) {
  const actualUsageCount = responsiveCardUsageCounts.get(spec.key);
  if (actualUsageCount !== spec.expectedUsageCount) {
    errors.push(`HTML: expected ${spec.expectedUsageCount} responsive ${spec.key} card images, found ${actualUsageCount}`);
  }
}
const expectedResponsiveCardUsageCount = responsiveCardSpecs.reduce((count, spec) => count + spec.expectedUsageCount, 0);
if (responsiveSrcsetUsageCount !== expectedResponsiveCardUsageCount) {
  errors.push(`HTML: expected ${expectedResponsiveCardUsageCount} responsive card srcsets, found ${responsiveSrcsetUsageCount}`);
}
if (responsiveCardStems.size !== 33) {
  errors.push(`HTML: expected responsive card srcsets to use 33 source images, found ${responsiveCardStems.size}`);
}

const imagesDirectory = path.join(root, "assets", "images");
const imageFiles = fs.readdirSync(imagesDirectory);
const standaloneDerivedDisplayWebps = new Set(["embossing-process-512.webp"]);
const responsiveWebpPattern = /^(.+)-w(512|768)\.webp$/;
const responsiveWebpFiles = new Set(imageFiles.filter((file) => responsiveWebpPattern.test(file)));
const jpegStems = new Set(imageFiles.filter((file) => file.endsWith(".jpg")).map((file) => file.replace(/\.jpg$/, "")));
const webpStems = new Set(imageFiles
  .filter((file) => file.endsWith(".webp") &&
    !standaloneDerivedDisplayWebps.has(file) &&
    !responsiveWebpPattern.test(file))
  .map((file) => file.replace(/\.webp$/, "")));
const actualAvifHeroStems = new Set(imageFiles
  .filter((file) => file.endsWith(".avif"))
  .map((file) => file.replace(/\.avif$/, "")));
for (const stem of jpegStems) {
  if (!webpStems.has(stem)) errors.push(`assets/images: missing WebP display asset for ${stem}.jpg`);
}
for (const stem of webpStems) {
  if (!jpegStems.has(stem)) errors.push(`assets/images: missing JPEG social fallback for ${stem}.webp`);
}
if (jpegStems.size !== 39 || webpStems.size !== 39) {
  errors.push(`assets/images: expected 39 JPEG/WebP pairs, found ${jpegStems.size} JPEG and ${webpStems.size} WebP files`);
}

const expectedResponsiveWebpFiles = new Set();
for (const stem of responsiveCardStems) {
  const sourceFile = `${stem}.webp`;
  const sourcePath = path.join(imagesDirectory, sourceFile);
  if (!webpStems.has(stem) || !fs.existsSync(sourcePath)) {
    errors.push(`assets/images: responsive card source ${sourceFile} is missing from the original WebP set`);
    continue;
  }
  try {
    const sourceDimensions = readWebpDimensions(sourcePath);
    if (sourceDimensions.width !== 1024 || sourceDimensions.height !== 1024) {
      errors.push(`assets/images: responsive card source ${sourceFile} must remain 1024x1024`);
    }
  } catch (error) {
    errors.push(`assets/images: cannot read ${sourceFile} dimensions (${error.message})`);
  }

  for (const width of responsiveCardWidths) {
    const derivedFile = `${stem}-w${width}.webp`;
    const derivedPath = path.join(imagesDirectory, derivedFile);
    expectedResponsiveWebpFiles.add(derivedFile);
    if (!fs.existsSync(derivedPath)) {
      errors.push(`assets/images: missing responsive card image ${derivedFile}`);
      continue;
    }
    try {
      const derivedDimensions = readWebpDimensions(derivedPath);
      if (derivedDimensions.width !== width || derivedDimensions.height !== width) {
        errors.push(`assets/images: ${derivedFile} must be ${width}x${width}`);
      }
    } catch (error) {
      errors.push(`assets/images: cannot read ${derivedFile} dimensions (${error.message})`);
    }
    if (fs.statSync(derivedPath).size >= fs.statSync(sourcePath).size) {
      errors.push(`assets/images: ${derivedFile} must remain smaller than ${sourceFile}`);
    }
  }
}
for (const expectedFile of expectedResponsiveWebpFiles) {
  if (!responsiveWebpFiles.has(expectedFile)) {
    errors.push(`assets/images: responsive derivative set is missing ${expectedFile}`);
  }
}
for (const actualFile of responsiveWebpFiles) {
  if (!expectedResponsiveWebpFiles.has(actualFile)) {
    errors.push(`assets/images: unexpected responsive derivative ${actualFile}`);
  }
}
if (responsiveWebpFiles.size !== 66 || expectedResponsiveWebpFiles.size !== 66) {
  errors.push(`assets/images: expected exactly 66 responsive WebP derivatives, found ${responsiveWebpFiles.size}`);
}

if (actualAvifHeroStems.size !== avifHeroStems.size ||
    [...avifHeroStems].some((stem) => !actualAvifHeroStems.has(stem))) {
  errors.push(`assets/images: AVIF hero set must match the ${avifHeroStems.size} approved hero assets`);
}
for (const stem of avifHeroStems) {
  const avifPath = path.join(imagesDirectory, `${stem}.avif`);
  const webpPath = path.join(imagesDirectory, `${stem}.webp`);
  if (!fs.existsSync(avifPath) || !fs.existsSync(webpPath)) continue;
  if (fs.statSync(avifPath).size >= fs.statSync(webpPath).size) {
    errors.push(`assets/images: ${stem}.avif must remain smaller than its WebP fallback`);
  }
}
const avifHeroUsageCount = htmlFiles.reduce((count, file) => {
  const html = readPage(file)?.html || "";
  return count + (html.match(/<source\b[^>]*type="image\/avif"[^>]*srcset="assets\/images\/[^"]+\.avif"/gi) || []).length;
}, 0);
if (avifHeroUsageCount !== 32) {
  errors.push(`HTML: expected 32 AVIF hero usages, found ${avifHeroUsageCount}`);
}
for (const derivedImage of standaloneDerivedDisplayWebps) {
  const derivedPath = path.join(imagesDirectory, derivedImage);
  if (!fs.existsSync(derivedPath)) {
    errors.push(`assets/images: missing derived display image ${derivedImage}`);
  } else if (fs.statSync(derivedPath).size > 50000) {
    errors.push(`assets/images: ${derivedImage} should remain under 50 KB`);
  }
}
const homepageHtml = readPage("index.html")?.html || "";
if (!/<link\b[^>]*rel="preload"[^>]*as="image"[^>]*href="assets\/images\/emerald-rigid-box\.webp"[^>]*media="\(min-width: 781px\)"[^>]*fetchpriority="high"/i.test(homepageHtml)) {
  errors.push("index.html: homepage hero preload must be limited to the desktop two-column layout");
}
if (!/<img\b[^>]*class="[^"]*\bproof-frame__primary\b[^"]*"[^>]*src="assets\/images\/emerald-rigid-box\.webp"[^>]*loading="lazy"[^>]*decoding="async"[^>]*fetchpriority="low"/i.test(homepageHtml)) {
  errors.push("index.html: below-fold mobile hero image must use native lazy loading and low priority");
}
if (!/<img\b[^>]*class="[^"]*\bproof-frame__inset\b[^"]*"[^>]*src="assets\/images\/embossing-process-512\.webp"[^>]*width="512"[^>]*height="512"[^>]*loading="lazy"[^>]*decoding="async"[^>]*fetchpriority="low"/i.test(homepageHtml)) {
  errors.push("index.html: hero inset must use the 512px lazy, low-priority display asset");
}

const requiredFontAssets = [
  "assets/fonts/bodoni-moda-latin-v28.woff2",
  "assets/fonts/manrope-latin-v20.woff2",
  "assets/fonts/OFL-Bodoni-Moda.txt",
  "assets/fonts/OFL-Manrope.txt",
];
requiredFontAssets.forEach((asset) => {
  if (!fs.existsSync(path.join(root, asset))) errors.push(`Self-hosted font asset is missing "${asset}"`);
});
const siteCssForFonts = fs.readFileSync(path.join(root, "assets", "site.css"), "utf8");
for (const [signal, label] of [
  ['url("fonts/bodoni-moda-latin-v28.woff2")', "Bodoni Moda source"],
  ['font-weight: 500 600', "Bodoni Moda weight range"],
  ['url("fonts/manrope-latin-v20.woff2")', "Manrope source"],
  ['font-weight: 400 700', "Manrope weight range"],
  ["font-display: swap", "font display strategy"],
]) {
  if (!siteCssForFonts.includes(signal)) errors.push(`Self-hosted fonts: missing ${label}`);
}

const logoPngPath = path.join(root, "assets", "logo-512.png");
if (!fs.existsSync(logoPngPath)) {
  errors.push("Brand logo: assets/logo-512.png is missing");
} else {
  const logoPng = fs.readFileSync(logoPngPath);
  const logoWidth = logoPng.length >= 24 ? logoPng.readUInt32BE(16) : 0;
  const logoHeight = logoPng.length >= 24 ? logoPng.readUInt32BE(20) : 0;
  if (logoWidth !== 512 || logoHeight !== 512) errors.push(`Brand logo: expected 512x512 PNG, found ${logoWidth}x${logoHeight}`);
}
const manifestPath = path.join(root, "site.webmanifest");
if (!fs.existsSync(manifestPath)) {
  errors.push("site.webmanifest is missing");
} else {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const hasPngLogo = manifest.icons?.some((icon) =>
      icon.src === "/assets/logo-512.png" && icon.sizes === "512x512" && icon.type === "image/png");
    if (!hasPngLogo) errors.push("site.webmanifest: 512x512 PNG logo is missing");
  } catch (error) {
    errors.push(`site.webmanifest is invalid (${error.message})`);
  }
}

const blogPageHtml = readPage("blog.html")?.html || "";
if (!blogSchema || !Array.isArray(blogSchema.blogPost)) {
  errors.push("blog.html: Blog schema with a blogPost list is missing");
} else {
  const blogPostsByUrl = new Map();
  for (const post of blogSchema.blogPost) {
    const url = String(post?.url || "").trim();
    if (!url) {
      errors.push("blog.html: BlogPosting is missing its URL");
      continue;
    }
    if (blogPostsByUrl.has(url)) errors.push(`blog.html: duplicate BlogPosting URL ${url}`);
    blogPostsByUrl.set(url, post);
  }

  for (const [canonical, article] of articleEntriesByCanonical) {
    const post = blogPostsByUrl.get(canonical);
    if (!post) {
      errors.push(`blog.html: Blog schema is missing article ${canonical}`);
      continue;
    }
    if (String(post.headline || "").trim() !== article.headline) {
      errors.push(`blog.html: BlogPosting headline does not match ${article.file}`);
    }
    if (String(post.datePublished || "").trim() !== article.datePublished) {
      errors.push(`blog.html: BlogPosting datePublished does not match ${article.file}`);
    }
    if (!blogPageHtml.includes(`href="${article.file}"`)) {
      errors.push(`blog.html: visible guide list is missing ${article.file}`);
    }
  }

  for (const url of blogPostsByUrl.keys()) {
    if (!articleEntriesByCanonical.has(url)) {
      errors.push(`blog.html: Blog schema URL has no matching Article page ${url}`);
    }
  }

  const feedPath = path.join(root, "feed.xml");
  const feedGeneratorPath = path.join(root, "scripts", "generate-feed.mjs");
  if (!fs.existsSync(feedPath)) {
    errors.push("feed.xml is missing");
  } else {
    const feed = fs.readFileSync(feedPath, "utf8");
    const feedUrls = values(feed, /<guid\s+isPermaLink="true">([^<]+)<\/guid>/gi);
    const feedUrlSet = new Set(feedUrls);
    if (!feed.includes(`<atom:link href="${siteOrigin}/feed.xml" rel="self" type="application/rss+xml"/>`)) {
      errors.push("feed.xml: canonical self link is missing");
    }
    if (feedUrls.length !== blogPostsByUrl.size || feedUrlSet.size !== feedUrls.length) {
      errors.push(`feed.xml: expected ${blogPostsByUrl.size} unique guide entries, found ${feedUrlSet.size}`);
    }
    for (const url of blogPostsByUrl.keys()) {
      if (!feedUrlSet.has(url)) errors.push(`feed.xml: missing guide ${url}`);
    }
  }
  if (!fs.existsSync(feedGeneratorPath)) {
    errors.push("RSS feed generator is missing");
  }

  for (const feedDiscoveryPage of ["index.html", "blog.html"]) {
    const pageHtml = readPage(feedDiscoveryPage)?.html || "";
    if (!pageHtml.includes(`<link rel="alternate" type="application/rss+xml" title="GloryStarPack Buyer Guides" href="${siteOrigin}/feed.xml">`)) {
      errors.push(`${feedDiscoveryPage}: RSS discovery link is missing`);
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
  const sitemapLastModified = new Map([...sitemap.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/gi)]
    .map((match) => [match[1], match[2]]));
  if (sitemapUrls.length !== sitemapUrlSet.size) errors.push("sitemap.xml: duplicate URL entries");
  for (const canonical of canonicalOwners.keys()) {
    if (!sitemapUrlSet.has(canonical)) errors.push(`sitemap.xml: missing canonical ${canonical}`);
  }
  for (const sitemapUrl of sitemapUrlSet) {
    if (!canonicalOwners.has(sitemapUrl)) errors.push(`sitemap.xml: URL has no matching canonical page ${sitemapUrl}`);
  }
  for (const [canonical, modifiedDate] of articleModifiedByCanonical) {
    if (sitemapLastModified.get(canonical) !== modifiedDate) {
      errors.push(`sitemap.xml: ${canonical} lastmod must match article dateModified ${modifiedDate}`);
    }
  }
  const sitemapPrivacyDate = readPage("privacy.html")?.html.match(/"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})"/)?.[1] || "";
  if (sitemapPrivacyDate && sitemapLastModified.get(`${siteOrigin}/privacy.html`) !== sitemapPrivacyDate) {
    errors.push("sitemap.xml: privacy.html lastmod must match its visible and structured date");
  }
}

for (const targetFile of priorityPages) {
  const inboundSources = htmlFiles.filter((sourceFile) => {
    if (sourceFile === targetFile) return false;
    return new RegExp(`href="${targetFile.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:[?#][^"]*)?"`, "i")
      .test(readPage(sourceFile)?.html || "");
  });
  if (inboundSources.length < 2) {
    errors.push(`${targetFile}: expected at least 2 internal-link sources, found ${inboundSources.length}`);
  }
}

const analyticsAssetPath = path.join(root, "assets", "analytics.js");
if (!fs.existsSync(analyticsAssetPath)) {
  errors.push("assets/analytics.js is missing");
} else {
  const analyticsAsset = fs.readFileSync(analyticsAssetPath, "utf8");
  const requiredAnalyticsSignals = [
    ['googletagmanager.com/gtag/js', "Google Analytics loader"],
    ['/_vercel/insights/script.js', "Vercel Web Analytics loader"],
    ['getConsent() !== consentGranted', "consent gate"],
    ['quote_fallback_action', "fallback-action conversion event"],
    ['resource_download', "resource-download conversion event"],
    ['resource_type: "csv_template"', "CSV-template event classification"],
    ['quote_optional_details_toggle', "optional-details interaction event"],
    ['quote_submit_attempt', "quote-submit attempt event"],
    ['quote_validation_error', "quote validation-error event"],
    ['quote_delivery_error', "quote delivery-error event"],
    ['window.location.reload()', "full analytics shutdown after consent withdrawal"],
    ['closeConsentPanel(true)', "analytics-preference focus return"],
    ['panel.setAttribute("aria-live", "polite")', "non-blocking consent announcement"],
    ['panel.setAttribute("aria-atomic", "true")', "complete consent announcement"],
  ];
  requiredAnalyticsSignals.forEach(([signal, label]) => {
    if (!analyticsAsset.includes(signal)) errors.push(`assets/analytics.js: missing ${label}`);
  });
}

const siteScriptPath = path.join(root, "assets", "site.js");
const siteStylePath = path.join(root, "assets", "site.css");
const siteScript = fs.existsSync(siteScriptPath) ? fs.readFileSync(siteScriptPath, "utf8") : "";
const siteStyle = fs.existsSync(siteStylePath) ? fs.readFileSync(siteStylePath, "utf8") : "";
const requiredProgressiveQuoteSignals = [
  [siteScript, 'const optionalFieldNames = ["phone", "dimensions", "targetDate", "details", "attachment"]', "five optional quote fields"],
  [siteScript, 'optionalDetails.className = "quote-form__optional field--full"', "optional quote disclosure"],
  [siteScript, 'if (optionalDetails) optionalDetails.open = false', "optional section reset"],
  [siteScript, 'window.matchMedia("(max-width: 900px)")', "tablet-safe responsive navigation state"],
  [siteScript, 'document.documentElement.classList.add("js")', "progressive navigation enhancement marker"],
  [siteScript, 'nav.toggleAttribute("inert"', "closed-navigation keyboard guard"],
  [siteScript, 'navigationBackground().forEach', "open-navigation background isolation"],
  [siteScript, 'event.key === "Tab" && navigationOpen', "open-navigation focus loop"],
  [siteScript, "new AbortController()", "quote request timeout controller"],
  [siteScript, "18000", "bounded quote request timeout"],
  [siteScript, 'glorystarpack:quote-submit-attempt', "quote-submit attempt signal"],
  [siteScript, 'glorystarpack:quote-delivery-error', "quote-delivery error signal"],
  [siteScript, 'attachmentName: fileInput?.files?.[0]?.name || ""', "attachment-error fallback context"],
  [siteScript, "directUrlEncodedBudget = 1900", "bounded direct-channel URL budget"],
  [siteScript, "Email and WhatsApp may use a shortened version. Copy project brief always contains every detail.", "direct-channel truncation disclosure"],
  [siteScript, 'if (options.focusFirst !== false) emailLink.focus()', "fallback action focus"],
  [siteScript, 'manualBrief.select()', "manual project-brief selection"],
  [siteStyle, ".quote-form__optional > summary:focus-visible", "optional-section keyboard focus"],
  [siteStyle, ".form-note--noscript", "no-JavaScript form guidance"],
  [siteStyle, ".form-fallback-manual textarea", "manual-copy fallback styling"],
  [siteStyle, ".subhero__background picture", "AVIF hero picture sizing"],
  [siteStyle, "html:not(.js) .site-nav", "no-JavaScript mobile navigation"],
];
requiredProgressiveQuoteSignals.forEach(([source, signal, label]) => {
  if (!source.includes(signal)) errors.push(`Progressive quote form is missing ${label}`);
});

const privacyPage = readPage("privacy.html")?.html || "";
if (!privacyPage.includes("template file name and download-link text")) {
  errors.push("privacy.html: analytics disclosure must cover template-download metadata");
}
if (!privacyPage.includes("not the contents of a downloaded template")) {
  errors.push("privacy.html: analytics disclosure must exclude downloaded-template contents");
}
const privacySchemaDate = privacyPage.match(/"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})"/)?.[1] || "";
const privacyVisibleDate = privacyPage.match(/Last updated\s*<time\b[^>]*datetime="(\d{4}-\d{2}-\d{2})"/i)?.[1] || "";
if (!privacySchemaDate || privacySchemaDate !== privacyVisibleDate) {
  errors.push("privacy.html: visible and structured last-updated dates must match");
}

const aboutPage = readPage("about.html")?.html || "";
const packagingTeamId = `${siteOrigin}/about.html#packaging-team`;
if (!aboutPage.includes('id="packaging-team"') || !aboutPage.includes("This is a company byline")) {
  errors.push("about.html: visible Packaging Team authorship profile is missing");
}
if (!aboutPage.includes(`"@id": "${packagingTeamId}"`) || !aboutPage.includes(`"url": "${packagingTeamId}"`)) {
  errors.push("about.html: Packaging Team structured entity is missing");
}
const homePage = readPage("index.html")?.html || "";
if (!homePage.includes('"@type": "ImageObject"') ||
    !homePage.includes(`"contentUrl": "${siteOrigin}/assets/logo-512.png"`) ||
    !homePage.includes('"width": 512') ||
    !homePage.includes('"height": 512')) {
  errors.push("index.html: Organization logo needs a 512x512 ImageObject");
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
    ['body.discoveryChannel', "discovery-channel attribution"],
    ['body.discoverySource', "discovery-source attribution"],
    ['quote.landingPage', "landing-page attribution"],
    ['ATTACHMENT_RULES', "attachment allowlist"],
    ['hasValidSignature', "attachment signature validation"],
    ['decodeBase64', "strict base64 decoding"],
    ['const cleanHeader', "email-subject header sanitization"],
    ['"Cache-Control", "no-store"', "no-store response header"],
    ['const mediaType = contentType.split', "strict request media-type parsing"],
    ['!jsonRequest && !nativeFormRequest', "unsupported media-type rejection"],
    ['application/x-www-form-urlencoded', "native form content type"],
    ['new URLSearchParams(body)', "native form parser"],
    ['nativeFormRequest', "native form response mode"],
    ['text/html; charset=utf-8', "no-JavaScript result page"],
    ['quoteFormPaths', "native return-path allowlist"],
    ['htmlEscape', "escaped native project brief"],
    ['Complete project brief', "native manual-copy fallback"],
    ['shortenForDirectChannel', "bounded native direct-channel brief"],
    ['limitCodePoints(quote.product, 60)', "bounded native mail subject"],
    ['typeof body.attachment === "object"', "native attachment filename guard"],
    ['RESEND_TIMEOUT_MS', "bounded Resend delivery timeout"],
    ['signal: resendController.signal', "Resend abort signal"],
    ['createHash("sha256")', "stable submission fingerprint"],
    ['`quote-${submissionFingerprint}`', "stable Resend idempotency key"],
    ['!apiKey || !fromEmail || !toEmail', "required recipient configuration"],
    ['Resend quote success response was not valid JSON', "invalid provider-success response handling"],
    ['typeof result.id !== "string"', "provider email ID validation"],
  ];
  requiredApiSignals.forEach(([signal, label]) => {
    if (!quoteApi.includes(signal)) errors.push(`api/quote.js: missing ${label}`);
  });
}

const healthApiPath = path.join(root, "api", "health.js");
if (!fs.existsSync(healthApiPath)) {
  errors.push("api/health.js is missing");
} else {
  const healthApi = fs.readFileSync(healthApiPath, "utf8");
  const requiredHealthSignals = [
    ['process.env.RESEND_API_KEY', "Resend configuration check"],
    ['process.env.QUOTE_FROM_EMAIL', "sender configuration check"],
    ['process.env.QUOTE_TO_EMAIL', "recipient configuration check"],
    ['"Cache-Control", "no-store"', "no-store response header"],
    ['quoteEmail', "quote-email service status"],
  ];
  requiredHealthSignals.forEach(([signal, label]) => {
    if (!healthApi.includes(signal)) errors.push(`api/health.js: missing ${label}`);
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
    [`Sitemap: ${siteOrigin}/feed.xml`, "RSS feed declaration"],
  ];
  requiredRobotsSignals.forEach(([signal, label]) => {
    if (!robots.includes(signal)) errors.push(`robots.txt: missing ${label}`);
  });
}

const llmsPath = path.join(root, "llms.txt");
if (!fs.existsSync(llmsPath)) {
  errors.push("llms.txt is missing");
} else {
  const llms = fs.readFileSync(llmsPath, "utf8");
  const requiredLlmsSignals = [
    [`${siteOrigin}/products.html`, "product catalog"],
    [`${siteOrigin}/custom-rigid-boxes.html`, "rigid-box specification page"],
    [`${siteOrigin}/custom-packaging-quality-inspection-checklist.html`, "custom packaging quality inspection checklist"],
    [`${siteOrigin}/custom-packaging-rfq-template.html`, "custom packaging RFQ template"],
    [`${siteOrigin}/custom-packaging-inserts.html`, "packaging-insert specification page"],
    [`${siteOrigin}/waterproof-label-testing-guide.html`, "waterproof label testing guide"],
    [`${siteOrigin}/clear-label-white-ink-artwork-guide.html`, "clear label white ink artwork guide"],
    [`${siteOrigin}/verify-fsc-packaging-supplier.html`, "FSC supplier verification guide"],
    [`${siteOrigin}/perfume-box-insert-checklist.html`, "perfume box insert checklist"],
    [`${siteOrigin}/wine-bottle-gift-box-specification.html`, "wine bottle gift box specification guide"],
    [`${siteOrigin}/hang-tag-production-checklist.html`, "hang tag production checklist"],
    [`${siteOrigin}/custom-tissue-paper-printing-guide.html`, "custom tissue paper printing guide"],
    [`${siteOrigin}/paper-tube-packaging-size-guide.html`, "paper tube packaging size guide"],
    [`${siteOrigin}/jewelry-box-insert-design-guide.html`, "jewelry box insert design guide"],
    [`${siteOrigin}/corrugated-shipping-box-specification-guide.html`, "corrugated shipping box specification guide"],
    [`${siteOrigin}/collapsible-rigid-box-vs-setup-box.html`, "collapsible-versus-setup rigid-box guide"],
    [`${siteOrigin}/rigid-box-vs-folding-carton.html`, "rigid-box-versus-folding-carton guide"],
    [`${siteOrigin}/custom-packaging-dieline-artwork-requirements.html`, "dieline and artwork guide"],
    [`${siteOrigin}/custom-packaging-china-vs-local-supplier.html`, "China-versus-local sourcing guide"],
    [`${siteOrigin}/low-moq-custom-packaging-small-business.html`, "low-MOQ small-business guide"],
    [`${siteOrigin}/exw-fob-cif-ddp-packaging-sourcing-guide.html`, "packaging Incoterms guide"],
    [`${siteOrigin}/ecommerce-mailer-box-sizing-transit-test.html`, "ecommerce mailer sizing guide"],
    [`${siteOrigin}/wine-label-condensation-adhesive-testing.html`, "wine-label testing guide"],
    [`${siteOrigin}/pantone-color-matching-packaging.html`, "packaging color matching guide"],
    [`${siteOrigin}/packaging-inserts-material-comparison.html`, "packaging-insert material comparison guide"],
    [`${siteOrigin}/custom-waterproof-labels.html`, "durable-label specification page"],
    [`${siteOrigin}/rigid-box-cost-drivers.html`, "rigid-box cost guide"],
    [`${siteOrigin}/magnetic-box-vs-drawer-box.html`, "magnetic-versus-drawer comparison guide"],
    [`${siteOrigin}/custom-packaging-cost-moq-guide.html`, "cost and MOQ guide"],
    [`${siteOrigin}/feed.xml`, "buyer-guide RSS feed"],
    ["Minimum order quantity is project-specific", "MOQ factual boundary"],
    ["Certifications, test standards", "certification factual boundary"],
  ];
  requiredLlmsSignals.forEach(([signal, label]) => {
    if (!llms.includes(signal)) errors.push(`llms.txt: missing ${label}`);
  });
}

const indexNowKey = "22368291acb50c0fb4b3a1ab806495d4";
const indexNowKeyPath = path.join(root, `${indexNowKey}.txt`);
const indexNowScriptPath = path.join(root, "scripts", "submit-indexnow.mjs");
const productionIndexAuditPath = path.join(root, "scripts", "audit-production-indexing.mjs");
const productionServiceAuditPath = path.join(root, "scripts", "audit-production-services.mjs");
const buildOutputValidationPath = path.join(root, "scripts", "validate-build-output.mjs");
if (!fs.existsSync(indexNowKeyPath) || fs.readFileSync(indexNowKeyPath, "utf8").trim() !== indexNowKey) {
  errors.push("IndexNow: root verification key file is missing or inconsistent");
}
if (!fs.existsSync(productionServiceAuditPath)) {
  errors.push("Production service audit script is missing");
} else {
  const productionServiceAudit = fs.readFileSync(productionServiceAuditPath, "utf8");
  const requiredProductionServiceSignals = [
    ["/api/health", "health endpoint"],
    ["quoteEmail", "quote-email service check"],
    ["no-store", "cache-safety check"],
  ];
  requiredProductionServiceSignals.forEach(([signal, label]) => {
    if (!productionServiceAudit.includes(signal)) errors.push(`Production service audit is missing ${label}`);
  });
}
if (!fs.existsSync(buildOutputValidationPath)) {
  errors.push("Build Output validation script is missing");
}
if (!fs.existsSync(indexNowScriptPath)) {
  errors.push("IndexNow: submission script is missing");
} else {
  const indexNowScript = fs.readFileSync(indexNowScriptPath, "utf8");
  const requiredIndexNowSignals = [
    ["https://api.indexnow.org/indexnow", "global endpoint"],
    ["const keyLocation = `${siteOrigin}/${indexNowKey}.txt`;", "root key location"],
    ["sitemap.xml", "sitemap URL source"],
    ["url.origin !== siteOrigin", "same-origin submission guard"],
  ];
  requiredIndexNowSignals.forEach(([signal, label]) => {
    if (!indexNowScript.includes(signal)) errors.push(`IndexNow: submission script is missing ${label}`);
  });
}
if (!fs.existsSync(productionIndexAuditPath)) {
  errors.push("Production indexing audit script is missing");
} else {
  const productionIndexAudit = fs.readFileSync(productionIndexAuditPath, "utf8");
  const requiredProductionAuditSignals = [
    ["sitemap.xml", "sitemap crawl source"],
    ["redirect: \"manual\"", "redirect tracing"],
    ["rel=[\\\"']canonical", "canonical verification"],
    ["www.glorystarpacking.com/index.html", "www index redirect probe"],
  ];
  requiredProductionAuditSignals.forEach(([signal, label]) => {
    if (!productionIndexAudit.includes(signal)) errors.push(`Production indexing audit is missing ${label}`);
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
    const directWwwIndexPosition = redirects.findIndex((redirect) =>
      redirect.source === "/index.html" &&
      redirect.destination === `${siteOrigin}/` &&
      redirect.permanent === true &&
      Array.isArray(redirect.has) &&
      redirect.has.some((condition) => condition.type === "host" && condition.value === "www.glorystarpacking.com"));
    const directWwwRootPosition = redirects.findIndex((redirect) =>
      redirect.source === "/" &&
      redirect.destination === `${siteOrigin}/` &&
      redirect.permanent === true &&
      Array.isArray(redirect.has) &&
      redirect.has.some((condition) => condition.type === "host" && condition.value === "www.glorystarpacking.com"));
    const catchAllWwwPosition = redirects.findIndex((redirect) =>
      redirect.source === "/:path*" &&
      Array.isArray(redirect.has) &&
      redirect.has.some((condition) => condition.type === "host" && condition.value === "www.glorystarpacking.com"));
    if (!redirectsIndex) errors.push("vercel.json: missing permanent /index.html to / redirect");
    if (!redirectsWww) errors.push("vercel.json: missing permanent www to canonical host redirect");
    if (directWwwRootPosition < 0 || catchAllWwwPosition < 0 || directWwwRootPosition > catchAllWwwPosition) {
      errors.push("vercel.json: www root must redirect directly to the canonical homepage before the www catch-all");
    }
    if (directWwwIndexPosition < 0 || catchAllWwwPosition < 0 || directWwwIndexPosition > catchAllWwwPosition) {
      errors.push("vercel.json: www /index.html must redirect directly to the canonical homepage before the www catch-all");
    }
    const headers = Array.isArray(vercelConfig.headers) ? vercelConfig.headers : [];
    const apiNoindex = headers.some((entry) =>
      entry.source === "/api/(.*)" &&
      Array.isArray(entry.headers) &&
      entry.headers.some((header) => header.key === "X-Robots-Tag" && header.value.includes("noindex")));
    const indexNowKeyHeader = headers.some((entry) => entry.source === `/${indexNowKey}.txt`);
    const feedHeader = headers.some((entry) => entry.source === "/feed.xml");
    const generalAssetsPosition = headers.findIndex((entry) => entry.source === "/assets/(.*)");
    const fontAssetsPosition = headers.findIndex((entry) => entry.source === "/assets/fonts/(.*)");
    const fontAssetsHeader = headers[fontAssetsPosition];
    const catchAllHeader = headers.find((entry) => entry.source === "/(.*)");
    const catchAllHeaderValue = (key) => catchAllHeader?.headers?.find((header) => header.key === key)?.value || "";
    const contentSecurityPolicy = catchAllHeaderValue("Content-Security-Policy");
    const hasImmutableFontCache = Array.isArray(fontAssetsHeader?.headers) && fontAssetsHeader.headers.some((header) =>
      header.key === "Cache-Control" && header.value === "public, max-age=31536000, immutable");
    const hasFontCors = Array.isArray(fontAssetsHeader?.headers) && fontAssetsHeader.headers.some((header) =>
      header.key === "Access-Control-Allow-Origin" && header.value === "*");
    if (!apiNoindex) errors.push("vercel.json: API routes need an X-Robots-Tag noindex header");
    if (!indexNowKeyHeader) errors.push("vercel.json: IndexNow key file cache header is missing");
    if (!feedHeader) errors.push("vercel.json: feed.xml cache header is missing");
    if (generalAssetsPosition < 0 || fontAssetsPosition <= generalAssetsPosition) {
      errors.push("vercel.json: the font header rule must follow and override the general assets rule");
    }
    if (!hasImmutableFontCache) errors.push("vercel.json: fonts need a one-year immutable cache header");
    if (!hasFontCors) errors.push("vercel.json: fonts need an explicit cross-origin response header");
    for (const assetPath of ["/assets/site.css", "/assets/site.js", "/assets/analytics.js"]) {
      const assetPosition = headers.findIndex((entry) => entry.source === assetPath);
      const assetHeaders = headers[assetPosition]?.headers;
      const hasImmutableCache = Array.isArray(assetHeaders) && assetHeaders.some((header) =>
        header.key === "Cache-Control" && header.value === "public, max-age=31536000, immutable");
      if (assetPosition <= generalAssetsPosition || !hasImmutableCache) {
        errors.push(`vercel.json: ${assetPath} must override the general assets rule with a one-year immutable cache`);
      }
    }

    const requiredSecurityHeaders = [
      ["Cross-Origin-Opener-Policy", "same-origin"],
      ["X-DNS-Prefetch-Control", "off"],
      ["X-Permitted-Cross-Domain-Policies", "none"],
    ];
    requiredSecurityHeaders.forEach(([key, value]) => {
      if (catchAllHeaderValue(key) !== value) errors.push(`vercel.json: ${key} must be ${value}`);
    });
    const permissionsPolicy = catchAllHeaderValue("Permissions-Policy");
    for (const blockedFeature of ["camera=()", "microphone=()", "geolocation=()", "payment=()", "usb=()", "browsing-topics=()"]) {
      if (!permissionsPolicy.includes(blockedFeature)) errors.push(`vercel.json: Permissions-Policy must include ${blockedFeature}`);
    }

    const requiredCspSignals = [
      ["default-src 'self'", "same-origin default"],
      ["base-uri 'self'", "base URI restriction"],
      ["object-src 'none'", "object blocking"],
      ["frame-ancestors 'self'", "framing restriction"],
      ["form-action 'self'", "form destination restriction"],
      ["script-src-attr 'none'", "inline event-handler blocking"],
      ["https://www.googletagmanager.com", "consented Google Analytics script host"],
      ["https://*.google-analytics.com", "consented Google Analytics collection host"],
      ["upgrade-insecure-requests", "mixed-content upgrade"],
    ];
    requiredCspSignals.forEach(([signal, label]) => {
      if (!contentSecurityPolicy.includes(signal)) errors.push(`vercel.json: Content-Security-Policy is missing ${label}`);
    });
    if (/script-src[^;]*'unsafe-inline'/.test(contentSecurityPolicy)) {
      errors.push("vercel.json: script-src must not allow unsafe-inline");
    }

    const expectedInlineScriptHashes = new Set();
    for (const htmlFile of htmlFiles) {
      const html = readPage(htmlFile)?.html || "";
      for (const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)) {
        if (/type="application\/ld\+json"/i.test(match[1]) || !match[2].trim()) continue;
        const digest = crypto.createHash("sha256").update(match[2]).digest("base64");
        expectedInlineScriptHashes.add(`sha256-${digest}`);
      }
    }
    if (expectedInlineScriptHashes.size !== 9) {
      errors.push(`vercel.json: expected 9 executable inline-script hashes, found ${expectedInlineScriptHashes.size}`);
    }
    for (const hash of expectedInlineScriptHashes) {
      if (!contentSecurityPolicy.includes(`'${hash}'`)) {
        errors.push(`vercel.json: Content-Security-Policy is missing inline script hash ${hash}`);
      }
    }
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
  console.log(`Validated ${canonicalOwners.size} indexable HTML pages and ${htmlFiles.length - canonicalOwners.size} non-indexable HTML page: metadata/social URLs, robots directives, canonicals, H1, JSON-LD/FAQ parity, article/blog discovery, navigation, IDs, responsive card images, image dimensions, quote forms, assets, links, inbound routes, redirects, crawler policy, API safeguards, and sitemap are consistent.`);
}
