import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import process from "node:process";
import {
  catalogCopyTemplates,
  hasUnverifiedCatalogClaim,
  publicCatalogProductKeys,
} from "./catalog-copy-policy.mjs";
import { inspectJpegMetadata } from "./jpeg-metadata.mjs";

const root = path.resolve(process.argv[2] || ".");
const conflictCopyPattern = / \d+\.html$/i;
const rootHtmlFiles = fs.readdirSync(root).filter((file) => file.endsWith(".html")).sort();
const ignoredHtmlConflictCopies = rootHtmlFiles.filter((file) => conflictCopyPattern.test(file));
const htmlFiles = rootHtmlFiles.filter((file) => !conflictCopyPattern.test(file));
const htmlFileSet = new Set(htmlFiles);
const errors = [];
const warnings = [];
const contentVersion = (relativePath) => {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return "missing";
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex").slice(0, 12);
};
if (ignoredHtmlConflictCopies.length) {
  warnings.push(`ignored ${ignoredHtmlConflictCopies.length} numbered HTML conflict copies: ${ignoredHtmlConflictCopies.join(", ")}`);
}
const canonicalOwners = new Map();
const titleOwners = new Map();
const articleModifiedByCanonical = new Map();
const structuredModifiedByCanonical = new Map();
const articleEntriesByCanonical = new Map();
const primaryImageByCanonical = new Map();
const internalLinkGraph = new Map();
let blogSchema = null;
const pageCache = new Map();
const siteOrigin = "https://glorystarpacking.com";
const requiredToplinePrimary = "Factory-direct custom packaging · Technical project support";
const requiredFooterBrand = "Custom boxes, bags, inserts, and labels developed through one accountable sampling, production, and delivery workflow.";
const requiredFooterSignature = "Custom packaging · Boxes · Bags · Labels";
const requiredFooterHeadings = ["Products", "Explore", "Contact"];
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
  "custom-packaging-lead-time-planner.html": "custom-boxes.html#quote",
  "paper-thickness-gsm-pt-mm-conversion-guide.html": "custom-boxes.html#quote",
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
const responsiveAvifCardStems = new Set([
  "black-embossed-box",
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
const marketplaceProductSizes = "(max-width: 780px) calc((100vw - 42px) / 2), (max-width: 976px) calc((100vw - 298px) / 3), (max-width: 1040px) 226px, 219px";
const responsiveCardSpecs = [
  {
    key: "product",
    expectedUsageCount: 97,
    sizes: "(max-width: 780px) calc(100vw - 28px), (max-width: 1040px) calc((100vw - 58px) / 2), 379px",
    blockPattern: /<div\b[^>]*class="[^"]*\bproduct-card__media\b[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
  },
  {
    key: "article",
    expectedUsageCount: 32,
    sizes: "(max-width: 780px) calc(100vw - 28px), 310px",
    blockPattern: /<article\b[^>]*class="[^"]*\barticle-card\b[^"]*"[^>]*>[\s\S]*?<\/article>/gi,
  },
];
const responsiveCardUsageCounts = new Map(responsiveCardSpecs.map((spec) => [spec.key, 0]));
const responsiveCardStems = new Set();
let responsiveSrcsetUsageCount = 0;
let responsiveAvifCardUsageCount = 0;
const responsiveBodySizes = "(max-width: 780px) calc(100vw - 50px), (max-width: 1228px) calc(46vw - 24px), (max-width: 1375px) calc(590px - 4vw), 535px";
const responsiveBodyBlockPattern = /<div\b[^>]*class="[^"]*\bsplit__media\b[^"]*"[^>]*>[\s\S]*?<\/div>/gi;
let responsiveBodyUsageCount = 0;
const supplementalResponsiveSizes = {
  split: "(max-width: 780px) min(calc(100vw - 50px), 658px), (max-width: 976px) calc(46vw - 18px), (max-width: 1040px) calc(470px - 4vw), (max-width: 1228px) calc(46vw - 24px), (max-width: 1375px) calc(590px - 4vw), 535px",
  material: "(max-width: 780px) min(calc(100vw - 58px), 650px), (max-width: 976px) calc((100vw - 114px) / 2), (max-width: 1040px) 431px, (max-width: 1228px) calc((100vw - 222px) / 4), 251.5px",
  finishFirst: "(max-width: 780px) min(calc(100vw - 28px), 680px), (max-width: 976px) calc(100vw - 36px), (max-width: 1040px) 940px, (max-width: 1228px) calc(42.8571vw - 36px), 490.3px",
  finishOther: "(max-width: 780px) min(calc(100vw - 28px), 680px), (max-width: 976px) calc((100vw - 54px) / 2), (max-width: 1040px) 461px, (max-width: 1228px) calc(28.5714vw - 24px), 326.9px",
  articleFeature: "(max-width: 780px) min(calc(100vw - 30px), 678px), (max-width: 976px) calc(57.5vw - 21.85px), (max-width: 1040px) 539.4px, (max-width: 1228px) calc(57.5vw - 28.75px), 677.4px",
  proofFrame: "(max-width: 780px) min(calc(100vw - 70px), 478px), (max-width: 922px) 278px, (max-width: 976px) calc(38.2716vw - 74.91px), (max-width: 1040px) 298.6px, (max-width: 1228px) calc(38.069vw - 61.86px), (max-width: 1500px) calc(446.28px - 3.3103vw), 396.6px",
};
const supplementalResponsiveSpecs = [
  { key: "split", expectedUsageCount: 33, blockPattern: responsiveBodyBlockPattern },
  { key: "material", expectedUsageCount: 21, blockPattern: /<article\b[^>]*class="[^"]*\bmaterial-card\b[^"]*"[^>]*>[\s\S]*?<\/article>/gi },
  { key: "finish", expectedUsageCount: 7, blockPattern: /<article\b[^>]*class="[^"]*\bfinish-card\b[^"]*"[^>]*>[\s\S]*?<\/article>/gi },
  { key: "articleFeature", expectedUsageCount: 1, blockPattern: /<div\b[^>]*class="[^"]*\barticle-feature__media\b[^"]*"[^>]*>[\s\S]*?<\/div>/gi },
  { key: "proofFrame", expectedUsageCount: 1, blockPattern: /<div\b[^>]*class="[^"]*\bproof-frame\b[^"]*"[^>]*>[\s\S]*?<\/div>/gi },
];
const supplementalResponsiveUsageCounts = new Map(supplementalResponsiveSpecs.map((spec) => [spec.key, 0]));
let supplementalResponsiveFinishFirstCount = 0;
let supplementalResponsiveFinishOtherCount = 0;
const priorityPages = [
  "custom-packaging-lead-time-planner.html",
  "paper-thickness-gsm-pt-mm-conversion-guide.html",
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
const requiredSiteStyleVersion = contentVersion("assets/site.css");
const requiredSiteScriptVersion = contentVersion("assets/site.js");
const requiredAnalyticsVersion = contentVersion("assets/analytics.js");
const requiredCatalogScriptVersion = contentVersion("assets/catalog.js");
const requiredCatalogDataVersion = contentVersion("assets/catalog/catalog.json");
const requiredAnalyticsMeasurementId = "G-LYNMPWG9WK";
const authorizedCatalogPath = path.join(root, "assets", "catalog", "catalog.json");
const cleanCatalogSourceManifestPath = path.join(root, "assets", "catalog", "clean-sources", "manifest.json");
const catalogBuildAuditPath = path.join(root, "assets", "catalog", "clean-sources", "catalog-build-audit.json");
let authorizedCatalog = null;
let cleanCatalogSourceManifest = null;
let catalogBuildAudit = null;
if (!fs.existsSync(authorizedCatalogPath)) {
  errors.push("assets/catalog/catalog.json is missing");
} else {
  try {
    authorizedCatalog = JSON.parse(fs.readFileSync(authorizedCatalogPath, "utf8"));
  } catch (error) {
    errors.push(`assets/catalog/catalog.json is invalid JSON: ${error.message}`);
  }
}
if (!fs.existsSync(cleanCatalogSourceManifestPath)) {
  errors.push("assets/catalog/clean-sources/manifest.json is missing");
} else {
  try {
    cleanCatalogSourceManifest = JSON.parse(fs.readFileSync(cleanCatalogSourceManifestPath, "utf8"));
  } catch (error) {
    errors.push(`assets/catalog/clean-sources/manifest.json is invalid JSON: ${error.message}`);
  }
}
if (!fs.existsSync(catalogBuildAuditPath)) {
  errors.push("assets/catalog/clean-sources/catalog-build-audit.json is missing");
} else {
  try {
    catalogBuildAudit = JSON.parse(fs.readFileSync(catalogBuildAuditPath, "utf8"));
  } catch (error) {
    errors.push(`assets/catalog/clean-sources/catalog-build-audit.json is invalid JSON: ${error.message}`);
  }
}
const hangTagTemplatePath = path.join(root, "assets", "templates", "hang-tag-variable-data-template.csv");
const wineGiftBoxTemplatePath = path.join(root, "assets", "templates", "wine-bottle-gift-box-rfq-template.csv");
const perfumeInsertTemplatePath = path.join(root, "assets", "templates", "perfume-box-insert-rfq-template.csv");
const clearLabelTrialTemplatePath = path.join(root, "assets", "templates", "clear-label-artwork-trial-template.csv");
const waterproofLabelTestTemplatePath = path.join(root, "assets", "templates", "waterproof-label-test-matrix-template.csv");
const packagingRfqTemplatePath = path.join(root, "assets", "templates", "custom-packaging-rfq-template.csv");
const packagingInspectionTemplatePath = path.join(root, "assets", "templates", "custom-packaging-quality-inspection-template.csv");

const values = (source, pattern) => [...source.matchAll(pattern)].map((match) => match[1]);
const attribute = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`, "i"))?.[1] || "";
const responsiveWebpSrcset = (stem) => [
  `assets/images/${stem}-w512.webp 512w`,
  `assets/images/${stem}-w768.webp 768w`,
  `assets/images/${stem}.webp 1024w`,
].join(", ");
const hasResponsiveWebpDerivatives = (stem) => responsiveCardWidths.every((width) => (
  fs.existsSync(path.join(root, "assets", "images", `${stem}-w${width}.webp`))
));
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
const escapeXml = (value) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&apos;");
const normalizedPageUrl = (href, baseUrl) => {
  const url = new URL(href, baseUrl);
  url.hash = "";
  url.search = "";
  return url.href;
};
const internalHtmlFile = (href, baseUrl) => {
  try {
    const url = new URL(href, baseUrl);
    if (url.origin !== siteOrigin) return null;
    const pathname = decodeURIComponent(url.pathname);
    if (pathname === "/" || pathname === "/index.html") return "index.html";
    if (!/^\/[A-Za-z0-9._-]+\.html$/.test(pathname)) return null;
    return pathname.slice(1);
  } catch {
    return null;
  }
};

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

const readAvifDimensions = (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const marker = Buffer.from("ispe", "ascii");
  for (let offset = buffer.indexOf(marker); offset !== -1; offset = buffer.indexOf(marker, offset + 4)) {
    if (offset < 4 || offset + 16 > buffer.length) continue;
    const boxSize = buffer.readUInt32BE(offset - 4);
    if (boxSize < 20 || offset - 4 + boxSize > buffer.length) continue;
    const width = buffer.readUInt32BE(offset + 8);
    const height = buffer.readUInt32BE(offset + 12);
    if (width > 0 && height > 0) return { width, height };
  }
  throw new Error("missing AVIF image spatial-extents box");
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
    if (ogImages.length === 1) primaryImageByCanonical.set(canonicals[0], ogImages[0]);
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
  if (!/<a\b[^>]*class="skip-link"[^>]*href="#main-content"/i.test(html) ||
      !/<main id="main-content" tabindex="-1">/i.test(html)) {
    errors.push(`${file}: skip link and focusable main-content target must remain paired`);
  }

  const faqButtons = html.match(/<button\b[^>]*class="[^"]*\bfaq-question\b[^"]*"[^>]*>/gi) || [];
  for (const button of faqButtons) {
    if (!/\saria-controls="[^"]+"/i.test(button)) errors.push(`${file}: FAQ button is missing aria-controls`);
    if (!/\saria-expanded="(?:true|false)"/i.test(button)) errors.push(`${file}: FAQ button is missing aria-expanded`);
  }

  const primaryNav = html.match(/<nav\b[^>]*aria-label="Primary navigation"[^>]*>([\s\S]*?)<\/nav>/i)?.[1] || "";
  const currentNavItems = primaryNav.match(/<a\b[^>]*\saria-current="(?:page|location)"[^>]*>/gi) || [];
  if (currentNavItems.length > 1) errors.push(`${file}: primary navigation has ${currentNavItems.length} current-location links`);
  currentNavItems.forEach((anchor) => {
    const token = attribute(anchor, "aria-current");
    const href = attribute(anchor, "href");
    try {
      const targetPath = new URL(href, canonicals[0] || `${siteOrigin}/${file}`).pathname;
      const currentPath = file === "index.html" ? "/" : `/${file}`;
      if (token === "page" && targetPath !== currentPath) {
        errors.push(`${file}: aria-current="page" must point to the current document`);
      }
      if (token === "location" && targetPath === currentPath) {
        errors.push(`${file}: a current-document navigation link must use aria-current="page"`);
      }
    } catch {
      errors.push(`${file}: current navigation item has an invalid href`);
    }
  });

  const normalizeShellText = (value) => String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  const toplinePrimary = normalizeShellText(html.match(/<div class="topline">\s*<div class="container topline__inner">\s*<span>([\s\S]*?)<\/span>/i)?.[1]);
  if (toplinePrimary !== requiredToplinePrimary) {
    errors.push(`${file}: shared topline message is inconsistent`);
  }
  const footerMarkup = html.match(/<footer class="site-footer">([\s\S]*?)<\/footer>/i)?.[1] || "";
  if (!footerMarkup) {
    errors.push(`${file}: shared site footer is missing`);
  } else {
    const footerBrand = normalizeShellText(footerMarkup.match(/<div class="footer-brand">[\s\S]*?<p>([\s\S]*?)<\/p>/i)?.[1]);
    if (footerBrand !== requiredFooterBrand) errors.push(`${file}: shared footer brand statement is inconsistent`);
    const footerSignature = normalizeShellText(footerMarkup.match(/<div class="footer-bottom">\s*<span>[\s\S]*?<\/span>\s*<span>([\s\S]*?)<\/span>/i)?.[1]);
    if (footerSignature !== requiredFooterSignature) errors.push(`${file}: shared footer signature is inconsistent`);
    const footerHeadings = values(footerMarkup, /<div class="footer-col">\s*<h2>([\s\S]*?)<\/h2>/gi).map(normalizeShellText);
    if (JSON.stringify(footerHeadings) !== JSON.stringify(requiredFooterHeadings)) {
      errors.push(`${file}: footer columns must be Products, Explore, and Contact`);
    }
  }
  const floatingContacts = html.match(/<nav class="floating-contact\b[^"]*"[^>]*>[\s\S]*?<\/nav>/gi) || [];
  if (floatingContacts.length !== 1) {
    errors.push(`${file}: expected one shared quick-contact toolbar, found ${floatingContacts.length}`);
  } else {
    const floatingContact = floatingContacts[0];
    if (!/class="floating-contact floating-contact--home"/i.test(floatingContact)) {
      errors.push(`${file}: quick-contact toolbar must use the shared visual variant`);
    }
    if (!/href="mailto:kevin@GloryStarPack\.com"/i.test(floatingContact) ||
        !/href="https:\/\/wa\.me\/8619577608248"/i.test(floatingContact) ||
        !/href="tel:\+8619577608248"/i.test(floatingContact)) {
      errors.push(`${file}: quick-contact toolbar must provide Email, WhatsApp, and phone`);
    }
    if ((floatingContact.match(/<svg\b/gi) || []).length !== 2 ||
        !/>Email<\/span>/i.test(floatingContact) ||
        !/>WhatsApp<\/span>/i.test(floatingContact) ||
        !/>Call<\/span>/i.test(floatingContact)) {
      errors.push(`${file}: quick-contact toolbar must provide three labeled actions`);
    }
  }

  const visibleMarkupWithoutLinks = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, "");
  if (/kevin@glorystarpack\.com/i.test(visibleMarkupWithoutLinks)) {
    errors.push(`${file}: visible contact email must be a mailto link`);
  }
  if (/8618020755949|\+86[\s-]*180[\s-]*2075[\s-]*5949/i.test(html)) {
    errors.push(`${file}: retired contact number must not appear`);
  }
  if (!html.includes("https://wa.me/8619577608248")) {
    errors.push(`${file}: current WhatsApp contact route is missing`);
  }
  if (/\+86[\s-]*195[\s-]*7760[\s-]*8248/i.test(visibleMarkupWithoutLinks)) {
    errors.push(`${file}: visible current contact phone must be a clickable link`);
  }

  if (file === "index.html") {
    const structuredTelephones = values(html, /"telephone":\s*"([^"]+)"/g);
    if (structuredTelephones.length !== 2 || structuredTelephones.some((telephone) => telephone !== "+86-195-7760-8248")) {
      errors.push(`${file}: Organization and sales ContactPoint telephone must use the current number`);
    }
  }

  const jsonLdBlocks = values(html, /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
  const schemaFaqItems = [];
  const schemaItemLists = [];
  const schemaBreadcrumbLists = [];
  const pageSchemaModifiedDates = new Set();
  let pageArticleSchema = null;
  if (!jsonLdBlocks.length && !isErrorPage) warnings.push(`${file}: no JSON-LD block`);
  jsonLdBlocks.forEach((block, index) => {
    try {
      const data = JSON.parse(block);
      const visit = (value) => {
        if (!value || typeof value !== "object") return;
        if (Object.prototype.hasOwnProperty.call(value, "dateModified")) {
          const modifiedDate = String(value.dateModified || "").trim();
          if (!/^\d{4}-\d{2}-\d{2}$/.test(modifiedDate)) {
            errors.push(`${file}: schema dateModified must use YYYY-MM-DD`);
          } else {
            pageSchemaModifiedDates.add(modifiedDate);
          }
        }
        if (value["@type"] === "Article" || value["@type"] === "BlogPosting") pageArticleSchema = value;
        if (value["@type"] === "Blog") blogSchema = value;
        if (value["@type"] === "BreadcrumbList") schemaBreadcrumbLists.push(value);
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
  if (!isErrorPage && canonicals[0]) {
    if (pageSchemaModifiedDates.size > 1) {
      errors.push(`${file}: structured data contains conflicting dateModified values`);
    } else if (pageSchemaModifiedDates.size === 1) {
      structuredModifiedByCanonical.set(canonicals[0], [...pageSchemaModifiedDates][0]);
    }
  }

  if (!isErrorPage && file !== "index.html" && canonicals[0]) {
    const visibleBreadcrumbBlocks = html.match(/<ol\b[^>]*class="[^"]*\bbreadcrumbs\b[^"]*"[^>]*>[\s\S]*?<\/ol>/gi) || [];
    if (visibleBreadcrumbBlocks.length !== 1) {
      errors.push(`${file}: expected one visible breadcrumb trail`);
    }
    if (schemaBreadcrumbLists.length !== 1) {
      errors.push(`${file}: expected one BreadcrumbList entity`);
    }
    if (visibleBreadcrumbBlocks.length === 1 && schemaBreadcrumbLists.length === 1) {
      const visibleUrls = (visibleBreadcrumbBlocks[0].match(/<li\b[^>]*>[\s\S]*?<\/li>/gi) || []).map((item) => {
        const href = item.match(/<a\b[^>]*href="([^"]+)"/i)?.[1];
        return href ? normalizedPageUrl(href, canonicals[0]) : canonicals[0];
      });
      const schemaItems = Array.isArray(schemaBreadcrumbLists[0].itemListElement)
        ? schemaBreadcrumbLists[0].itemListElement
        : [];
      const schemaUrls = schemaItems.map((item, index) => {
        if (item?.position !== index + 1) errors.push(`${file}: BreadcrumbList positions must be sequential`);
        return normalizedPageUrl(String(item?.item || ""), canonicals[0]);
      });
      if (visibleUrls.length !== schemaUrls.length || visibleUrls.some((url, index) => url !== schemaUrls[index])) {
        errors.push(`${file}: visible and structured breadcrumb URL order must match`);
      }
      if (!schemaUrls.length || schemaUrls.at(-1) !== canonicals[0]) {
        errors.push(`${file}: final BreadcrumbList item must equal the canonical URL`);
      }
    }
  }

  if (pageArticleSchema) {
    const pageCanonical = canonicals[0] || "";
    if (
      pageArticleSchema["@id"] !== `${pageCanonical}#article` ||
      pageArticleSchema.mainEntityOfPage?.["@type"] !== "WebPage" ||
      pageArticleSchema.mainEntityOfPage?.["@id"] !== pageCanonical
    ) {
      errors.push(`${file}: BlogPosting identity must match its canonical page`);
    }
    if (pageArticleSchema["@type"] !== "BlogPosting") {
      errors.push(`${file}: buyer guide must use the specific BlogPosting type`);
    }
    if (pageArticleSchema.isPartOf?.["@id"] !== `${siteOrigin}/blog.html#blog`) {
      errors.push(`${file}: BlogPosting must reference the Buyer Guides Blog entity`);
    }
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
    const visibleAuthor = articleMeta.match(/^\s*By\s+<a\b[^>]*href="about\.html#packaging-team"[^>]*>([\s\S]*?)<\/a>/i);
    if (!visibleAuthor || plainText(visibleAuthor[1]) !== String(author?.name || "").trim()) {
      errors.push(`${file}: visible author name and structured author must match`);
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
    const metaPublishedDates = values(html, /<meta\s+property="article:published_time"\s+content="(\d{4}-\d{2}-\d{2})"/gi);
    if (metaPublishedDates.length !== 1 || metaPublishedDates[0] !== schemaPublishedDate) {
      errors.push(`${file}: article schema and Open Graph published dates do not match`);
    }
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
        dateModified: schemaModifiedDate,
        description: descriptions[0] || "",
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
    const requiredCatalogMarkup = [
      ["data-authorized-catalog", "authorized catalog root"],
      ["data-catalog-library-grid", "authorized catalog product grid"],
      ["data-catalog-library-dialog", "authorized catalog product dialog"],
      ["data-catalog-library-categories", "authorized catalog category navigation"],
      ["data-catalog-library-category-select", "mobile catalog category selector"],
      ["data-catalog-library-search", "authorized catalog search"],
      ['id="catalog-library-status"', "single catalog result announcement"],
      ['aria-controls="catalog-library-grid"', "catalog control relationship"],
      ['aria-describedby="catalog-dialog-description catalog-dialog-image-note"', "catalog dialog description relationship"],
    ];
    requiredCatalogMarkup.forEach(([signal, label]) => {
      if (!html.includes(signal)) errors.push(`${file}: ${label} is missing`);
    });
    const catalogScriptVersions = values(html, /<script\b[^>]*src="\/?assets\/catalog\.js\?v=([^"]+)"[^>]*>/gi);
    if (catalogScriptVersions.length !== 1 || catalogScriptVersions[0] !== requiredCatalogScriptVersion) {
      errors.push(`${file}: expected catalog.js cache version ${requiredCatalogScriptVersion}`);
    }

    if (authorizedCatalog) {
      const products = Array.isArray(authorizedCatalog.products) ? authorizedCatalog.products : [];
      const categories = Array.isArray(authorizedCatalog.categories) ? authorizedCatalog.categories : [];
      if (authorizedCatalog.sourceAuthorized !== true) errors.push("assets/catalog/catalog.json: sourceAuthorized must be true");
      if (authorizedCatalog.total !== 1969 || products.length !== 1969) {
        errors.push(`assets/catalog/catalog.json: expected 1969 products, found ${products.length}`);
      }
      if (categories.length !== 16) errors.push(`assets/catalog/catalog.json: expected 16 categories, found ${categories.length}`);
      const categoryTotal = categories.reduce((total, category) => total + Number(category.count || 0), 0);
      if (categoryTotal !== products.length) errors.push("assets/catalog/catalog.json: category counts do not match product count");
      if (Number(authorizedCatalog.correspondingImageCount || 0) !== products.length) {
        errors.push("assets/catalog/catalog.json: every product must use its corresponding source image");
      }
      if (Number(authorizedCatalog.highResolutionPreviewCount || 0) !== products.length) {
        errors.push("assets/catalog/catalog.json: every product must include a dedicated preview image");
      }
      if (Number(authorizedCatalog.categoryReferenceCount || 0) !== 0) {
        errors.push("assets/catalog/catalog.json: category fallback images are not allowed on product records");
      }
      if (JSON.stringify(authorizedCatalog.copyPolicy) !== JSON.stringify(catalogCopyTemplates)) {
        errors.push("assets/catalog/catalog.json: controlled runtime copy policy is missing or mismatched");
      }
      const productIds = new Set();
      const publishedImageHashes = new Map();
      const allowedPublicProductKeys = new Set(publicCatalogProductKeys);
      const auditProducts = Array.isArray(catalogBuildAudit?.products) ? catalogBuildAudit.products : [];
      const auditById = new Map(auditProducts.map((product) => [String(product.id), product]));
      if (auditProducts.length !== products.length) {
        errors.push(`assets/catalog/clean-sources/catalog-build-audit.json: expected ${products.length} products, found ${auditProducts.length}`);
      }
      let claimReviewCount = 0;
      products.forEach((product, index) => {
        const label = `assets/catalog/catalog.json: product ${index + 1}`;
        const auditProduct = auditById.get(String(product.id));
        if (!String(product.id || "").trim()) errors.push(`${label} is missing an ID`);
        if (productIds.has(product.id)) errors.push(`${label} repeats ID ${product.id}`);
        productIds.add(product.id);
        if (!String(product.title || "").trim() || !String(product.category || "").trim()) {
          errors.push(`${label} is missing title or category`);
        }
        const unexpectedPublicKeys = Object.keys(product).filter((key) => !allowedPublicProductKeys.has(key));
        if (unexpectedPublicKeys.length) {
          errors.push(`${label} exposes internal field(s): ${unexpectedPublicKeys.join(", ")}`);
        }
        if (hasUnverifiedCatalogClaim(product.title)) {
          errors.push(`${label} contains an unqualified certification, sustainability, food-contact, or performance claim in its public title`);
        }
        if (Object.hasOwn(product, "claimReviewRequired") && product.claimReviewRequired !== true) {
          errors.push(`${label} claimReviewRequired must be omitted or true`);
        }
        if (product.claimReviewRequired === true) claimReviewCount += 1;
        if (!auditProduct) {
          errors.push(`${label} is missing its private build-audit record`);
        } else {
          const sourceImagePosition = Number(auditProduct.sourceImagePosition);
          if (!Number.isInteger(sourceImagePosition) || sourceImagePosition < 1 || sourceImagePosition > Number(auditProduct.galleryCount || 1)) {
            errors.push(`${label} has an invalid audited source image position`);
          }
          if (auditProduct.legacyBrandingRemoved === true && !String(auditProduct.imageCleanupMethod || "").trim()) {
            errors.push(`${label} private audit must declare its legacy-brand cleanup method`);
          }
        }
        const imageUrl = String(product.image || "");
        const imagePath = imageUrl.split(/[?#]/)[0];
        if (!/^assets\/catalog\/products\/[a-z0-9-]+\.jpg$/i.test(imagePath)) {
          errors.push(`${label} has an invalid image path "${imageUrl}"`);
        } else if (!fs.existsSync(path.join(root, imagePath))) {
          errors.push(`${label} image is missing: ${imagePath}`);
        } else {
          const imageHash = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, imagePath))).digest("hex");
          publishedImageHashes.set(imageHash, (publishedImageHashes.get(imageHash) || 0) + 1);
        }
        const previewUrl = String(product.previewImage || "");
        const previewPath = previewUrl.split(/[?#]/)[0];
        if (!/^assets\/catalog\/previews\/[a-z0-9-]+\.jpg$/i.test(previewPath)) {
          errors.push(`${label} has an invalid preview image path "${previewUrl}"`);
        } else if (!fs.existsSync(path.join(root, previewPath))) {
          errors.push(`${label} preview image is missing: ${previewPath}`);
        }
        const sourceWidth = Number(auditProduct?.sourceWidth || 0);
        const sourceHeight = Number(auditProduct?.sourceHeight || 0);
        const previewWidth = Number(product.previewWidth || 0);
        const previewHeight = Number(product.previewHeight || 0);
        const previewReconstructed = auditProduct?.previewReconstructed === true;
        const sourceMax = Math.max(sourceWidth, sourceHeight);
        const previewMax = Math.max(previewWidth, previewHeight);
        if (![sourceWidth, sourceHeight, previewWidth, previewHeight].every(Number.isInteger) || Math.min(sourceWidth, sourceHeight, previewWidth, previewHeight) < 1) {
          errors.push(`${label} has invalid source or preview dimensions`);
        } else if (previewMax > 960 || (!previewReconstructed && (previewWidth > sourceWidth || previewHeight > sourceHeight))) {
          errors.push(`${label} preview must be capped at 960px without upscaling`);
        } else if (!previewReconstructed && ((sourceMax >= 960 && previewMax !== 960) || (sourceMax < 960 && previewMax !== sourceMax))) {
          errors.push(`${label} preview dimensions do not match the no-upscale 960px policy`);
        } else if (previewReconstructed && (!auditProduct.previewEnhancementMethod || previewMax !== 960)) {
          errors.push(`${label} reconstructed preview must declare its enhancement method and use a 960px maximum dimension`);
        }
        if (auditProduct && (previewWidth !== Number(auditProduct.previewWidth) || previewHeight !== Number(auditProduct.previewHeight))) {
          errors.push(`${label} public preview dimensions do not match the private build audit`);
        }
      });
      const auditedClaimReviewCount = auditProducts.filter((product) => product.claimReviewRequired === true).length;
      if (claimReviewCount !== auditedClaimReviewCount) {
        errors.push(`assets/catalog/catalog.json: ${claimReviewCount} public claim-review records do not match ${auditedClaimReviewCount} audited records`);
      }
      if (publishedImageHashes.size < 1544) {
        errors.push(`assets/catalog/catalog.json: expected at least 1544 distinct corresponding product images, found ${publishedImageHashes.size}`);
      }
      const largestDuplicateGroup = Math.max(0, ...publishedImageHashes.values());
      if (largestDuplicateGroup > 5) {
        errors.push(`assets/catalog/catalog.json: a product image is repeated ${largestDuplicateGroup} times; source-primary maximum is 5`);
      }
      if (cleanCatalogSourceManifest) {
        const cleanSources = cleanCatalogSourceManifest.products || {};
        const productsById = new Map(products.map((product) => [String(product.id), product]));
        Object.entries(cleanSources).forEach(([id, cleanSource]) => {
          const cleanFile = String(cleanSource?.file || "");
          const cleanProduct = productsById.get(id);
          const auditProduct = auditById.get(id);
          if (cleanFile !== `${id}.jpg`) errors.push(`assets/catalog/clean-sources/manifest.json: ${id} has an invalid clean source filename`);
          if (!fs.existsSync(path.join(root, "assets", "catalog", "clean-sources", cleanFile))) {
            errors.push(`assets/catalog/clean-sources/manifest.json: ${id} clean source image is missing`);
          }
          if (!cleanProduct) {
            errors.push(`assets/catalog/clean-sources/manifest.json: ${id} is not a catalog product`);
          } else if (!auditProduct || auditProduct.legacyBrandingRemoved !== true || auditProduct.imageCleanupMethod !== cleanSource.method || Number(auditProduct.sourceImagePosition) !== Number(cleanSource.sourceImagePosition)) {
            errors.push(`assets/catalog/clean-sources/manifest.json: ${id} cleanup metadata does not match its private build audit`);
          }
        });
        auditProducts.filter((product) => product.legacyBrandingRemoved === true).forEach((product) => {
          if (!cleanSources[String(product.id)]) errors.push(`assets/catalog/catalog.json: product ${product.id} is missing from the clean source manifest`);
        });
      }
      const serializedCatalog = JSON.stringify(authorizedCatalog);
      if (/finerpackaging|alicdn|alibaba/i.test(serializedCatalog)) {
        errors.push("assets/catalog/catalog.json: source marketplace names or URLs must not appear in published data");
      }
      if (/\$0\.01\b/i.test(serializedCatalog)) {
        errors.push("assets/catalog/catalog.json: must not publish an unverified $0.01 offer");
      }
    }

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

    const expectedCategoryIds = [
      "popular-packaging",
      "sample-development",
      "mailer-shipping-boxes",
      "paper-bags",
      "gift-boxes",
      "clothing-packaging",
      "cosmetic-packaging",
      "food-packaging",
      "sushi-packaging",
      "cardboard-displays",
      "tea-packaging",
      "candle-packaging",
      "wellness-packaging",
      "paper-cards",
      "stickers-labels",
      "pouches",
    ];
    const categoryTags = html.match(/<article\b[^>]*class="[^"]*\bcatalog-category\b[^"]*"[^>]*>/gi) || [];
    const categoryIds = categoryTags.map((tag) => attribute(tag, "id"));
    if (categoryIds.length !== expectedCategoryIds.length) {
      errors.push(`${file}: expected ${expectedCategoryIds.length} catalog categories, found ${categoryIds.length}`);
    }
    expectedCategoryIds.forEach((id, index) => {
      if (categoryIds[index] !== id) {
        errors.push(`${file}: catalog category ${index + 1} must be "${id}"`);
      }
    });

    const filterButtons = html.match(/<button\b[^>]*data-catalog-filter="[^"]+"[^>]*>/gi) || [];
    const filterValues = filterButtons.map((tag) => attribute(tag, "data-catalog-filter"));
    const expectedFilterValues = ["all", ...expectedCategoryIds];
    if (filterValues.length !== expectedFilterValues.length) {
      errors.push(`${file}: expected ${expectedFilterValues.length} marketplace filters, found ${filterValues.length}`);
    }
    expectedFilterValues.forEach((value, index) => {
      if (filterValues[index] !== value) {
        errors.push(`${file}: marketplace filter ${index + 1} must be "${value}"`);
      }
    });
    filterButtons.forEach((tag, index) => {
      const expectedPressed = index === 0 ? "true" : "false";
      if (attribute(tag, "aria-pressed") !== expectedPressed) {
        errors.push(`${file}: marketplace filter ${index + 1} must initialize aria-pressed="${expectedPressed}"`);
      }
    });

    if (!html.includes('id="marketplace-result-count"')) {
      errors.push(`${file}: marketplace result count is missing`);
    }
    if (!html.includes("data-marketplace-empty")) {
      errors.push(`${file}: marketplace feasibility empty state is missing`);
    }
    const marketplaceGroupCount = (html.match(/\bdata-marketplace-group\b/gi) || []).length;
    if (marketplaceGroupCount !== 3) {
      errors.push(`${file}: expected 3 marketplace product groups, found ${marketplaceGroupCount}`);
    }
    if (!/class="[^"]*\bcatalog-scope-details\b/i.test(html)) {
      errors.push(`${file}: collapsed category scope and compliance details are missing`);
    }

    const requiredCategoryQuoteOptions = [
      "clothing-packaging",
      "food-packaging",
      "sushi-packaging",
      "cardboard-displays",
      "tea-packaging",
      "candle-packaging",
      "wellness-packaging",
      "paper-cards-booklets",
      "pouches",
    ];
    requiredCategoryQuoteOptions.forEach((value) => {
      if (!html.includes(`<option value="${value}">`)) {
        errors.push(`${file}: quote form is missing category option "${value}"`);
      }
    });
    if (/\$0\.01\b/i.test(html)) {
      errors.push(`${file}: must not advertise an unverified $0.01 sample offer`);
    }
    if (!/Direct food contact, barrier performance, migration, temperature, shelf life, and destination rules are never assumed\./i.test(html)) {
      errors.push(`${file}: food secondary packaging category is missing its compliance boundary`);
    }
    if (!/medical, pharmaceutical, sterile, child-resistant, or destination-specific compliance/i.test(html)) {
      errors.push(`${file}: wellness category is missing its regulated-use boundary`);
    }
    if (!/not shown as current core production routes/i.test(html)) {
      errors.push(`${file}: pouch category is missing its capability boundary`);
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

  for (const spec of responsiveCardSpecs) {
    for (const match of html.matchAll(spec.blockPattern)) {
      const cardBlock = match[0];
      const expectedCardSizes = spec.key === "product" && file === "products.html"
        ? marketplaceProductSizes
        : spec.sizes;
      const imageTag = cardBlock.match(/<img\b[^>]*>/i)?.[0] || "";
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
      } else {
        responsiveSrcsetUsageCount += 1;
      }
      if (attribute(imageTag, "sizes") !== expectedCardSizes) {
        errors.push(`${file}: ${spec.key} card image "${stem}" has an incorrect sizes rule`);
      }
      if (attribute(imageTag, "width") !== "1024" || attribute(imageTag, "height") !== "1024") {
        errors.push(`${file}: ${spec.key} card image "${stem}" must retain its 1024x1024 fallback dimensions`);
      }

      const avifSourceTags = cardBlock.match(/<source\b[^>]*type="image\/avif"[^>]*>/gi) || [];
      if (responsiveAvifCardStems.has(stem)) {
        responsiveAvifCardUsageCount += 1;
        const expectedAvifSrcset = [
          `assets/images/${stem}-w512.avif 512w`,
          `assets/images/${stem}-w768.avif 768w`,
          `assets/images/${stem}.avif 1024w`,
        ].join(", ");
        if (avifSourceTags.length !== 1) {
          errors.push(`${file}: ${spec.key} card image "${stem}" must have one AVIF source`);
          continue;
        }
        const sourceTag = avifSourceTags[0];
        if (attribute(sourceTag, "srcset") !== expectedAvifSrcset) {
          errors.push(`${file}: ${spec.key} card image "${stem}" has an incomplete AVIF srcset`);
        }
        if (attribute(sourceTag, "sizes") !== expectedCardSizes) {
          errors.push(`${file}: ${spec.key} card image "${stem}" has an incorrect AVIF sizes rule`);
        }
        if (!cardBlock.includes(`<picture>${sourceTag}${imageTag}</picture>`)) {
          errors.push(`${file}: ${spec.key} card image "${stem}" must keep its AVIF source and WebP fallback in one picture`);
        }
      } else if (avifSourceTags.length > 0) {
        errors.push(`${file}: ${spec.key} card image "${stem}" has an unapproved AVIF source`);
      }
    }
  }

  for (const match of html.matchAll(responsiveBodyBlockPattern)) {
    const bodyBlock = match[0];
    const imageTag = bodyBlock.match(/<img\b[^>]*>/i)?.[0] || "";
    const src = attribute(imageTag, "src");
    const stem = src.match(/^assets\/images\/([^/]+)\.webp$/i)?.[1] || "";
    if (!avifHeroStems.has(stem)) continue;

    responsiveBodyUsageCount += 1;
    const expectedWebpSrcset = [
      `assets/images/${stem}-w512.webp 512w`,
      `assets/images/${stem}-w768.webp 768w`,
      `assets/images/${stem}.webp 1024w`,
    ].join(", ");
    if (attribute(imageTag, "srcset") !== expectedWebpSrcset) {
      errors.push(`${file}: split image "${stem}" has an incomplete responsive WebP srcset`);
    }
    if (attribute(imageTag, "sizes") !== responsiveBodySizes) {
      errors.push(`${file}: split image "${stem}" has an incorrect sizes rule`);
    }
    if (attribute(imageTag, "width") !== "1024" || attribute(imageTag, "height") !== "1024") {
      errors.push(`${file}: split image "${stem}" must retain its 1024x1024 fallback dimensions`);
    }
    if (attribute(imageTag, "loading") !== "lazy" || attribute(imageTag, "decoding") !== "async") {
      errors.push(`${file}: split image "${stem}" must remain lazy-loaded with asynchronous decoding`);
    }

    const avifSourceTags = bodyBlock.match(/<source\b[^>]*type="image\/avif"[^>]*>/gi) || [];
    if (avifSourceTags.length !== 1) {
      errors.push(`${file}: split image "${stem}" must have one AVIF source`);
      continue;
    }
    const sourceTag = avifSourceTags[0];
    const expectedAvifSrcset = stem === "cosmetic-packaging"
      ? `assets/images/${stem}.avif 1024w`
      : [
        `assets/images/${stem}-w512.avif 512w`,
        `assets/images/${stem}-w768.avif 768w`,
        `assets/images/${stem}.avif 1024w`,
      ].join(", ");
    if (attribute(sourceTag, "srcset") !== expectedAvifSrcset) {
      errors.push(`${file}: split image "${stem}" has an incomplete AVIF srcset`);
    }
    if (attribute(sourceTag, "sizes") !== responsiveBodySizes) {
      errors.push(`${file}: split image "${stem}" has an incorrect AVIF sizes rule`);
    }
    const expectedMedia = stem === "cosmetic-packaging" ? "(min-resolution: 2.5dppx)" : "";
    if (attribute(sourceTag, "media") !== expectedMedia) {
      errors.push(`${file}: split image "${stem}" has an incorrect AVIF density gate`);
    }
    if (!bodyBlock.includes(`<picture>${sourceTag}${imageTag}</picture>`)) {
      errors.push(`${file}: split image "${stem}" must keep its AVIF source and WebP fallback in one picture`);
    }
  }

  for (const spec of supplementalResponsiveSpecs) {
    for (const match of html.matchAll(spec.blockPattern)) {
      const block = match[0];
      if (spec.key === "split" && /<source\b[^>]*type="image\/avif"/i.test(block)) continue;
      const imageTag = block.match(/<img\b[^>]*>/i)?.[0] || "";
      const src = attribute(imageTag, "src");
      const stem = src.match(/^assets\/images\/([^/]+)\.webp$/i)?.[1] || "";
      if (!stem || !hasResponsiveWebpDerivatives(stem)) continue;

      let expectedSizes = supplementalResponsiveSizes[spec.key];
      if (spec.key === "finish") {
        const sourceBeforeCard = html.slice(0, match.index);
        const finishGridStart = sourceBeforeCard.lastIndexOf('<div class="finish-grid"');
        const previousFinishCard = sourceBeforeCard.lastIndexOf('<article class="finish-card"');
        const isFirstFinishCard = previousFinishCard < finishGridStart;
        expectedSizes = isFirstFinishCard
          ? supplementalResponsiveSizes.finishFirst
          : supplementalResponsiveSizes.finishOther;
        if (isFirstFinishCard) supplementalResponsiveFinishFirstCount += 1;
        else supplementalResponsiveFinishOtherCount += 1;
      }

      supplementalResponsiveUsageCounts.set(spec.key, supplementalResponsiveUsageCounts.get(spec.key) + 1);
      if (attribute(imageTag, "srcset") !== responsiveWebpSrcset(stem)) {
        errors.push(`${file}: responsive ${spec.key} image "${stem}" has an incomplete WebP srcset`);
      }
      if (attribute(imageTag, "sizes") !== expectedSizes) {
        errors.push(`${file}: responsive ${spec.key} image "${stem}" has an incorrect sizes rule`);
      }
      if (attribute(imageTag, "width") !== "1024" || attribute(imageTag, "height") !== "1024") {
        errors.push(`${file}: responsive ${spec.key} image "${stem}" must retain its 1024x1024 fallback dimensions`);
      }
      if (attribute(imageTag, "loading") !== "lazy" || attribute(imageTag, "decoding") !== "async") {
        errors.push(`${file}: responsive ${spec.key} image "${stem}" must remain lazy-loaded with asynchronous decoding`);
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
    if (attribute(openingAttributes, "aria-labelledby") !== "quote-section-title" ||
        attribute(openingAttributes, "aria-describedby") !== "quote-form-status") {
      errors.push(`${formLabel} must be named by its quote heading and described by its status`);
    }
    if (!/<h2\b[^>]*id="quote-section-title"/i.test(html) ||
        !/<p class="form-status" id="quote-form-status" role="status" aria-live="polite"><\/p>/i.test(body)) {
      errors.push(`${formLabel} is missing its stable heading or live-status relationship`);
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
    const attachmentId = attribute(attachment, "id");
    if (attribute(attachment, "aria-describedby") !== `${attachmentId}-help` ||
        !new RegExp(`<small\\s+id="${attachmentId}-help">`, "i").test(body)) {
      errors.push(`${formLabel} attachment guidance must be programmatically associated`);
    }
    if (!/Add larger or source files by Email or WhatsApp after sending the brief\./i.test(body)) {
      errors.push(`${formLabel} must explain the larger/source-file fallback`);
    }
    if (!/<a\b[^>]*href="privacy\.html"/i.test(body)) errors.push(`${formLabel} is missing a privacy notice link`);
    const noscriptNote = body.match(/<noscript>([\s\S]*?)<\/noscript>/i)?.[1] || "";
    if (!/mailto:kevin@GloryStarPack\.com/i.test(noscriptNote) || !/https:\/\/wa\.me\/8619577608248/i.test(noscriptNote)) {
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

  const pageBaseUrl = canonicals[0] || `${siteOrigin}/${file}`;
  const linkedHtmlFiles = new Set();
  for (const href of values(html, /<a\b[^>]*\shref="([^"]+)"/gi)) {
    const linkedFile = internalHtmlFile(href, pageBaseUrl);
    if (linkedFile && htmlFileSet.has(linkedFile) && linkedFile !== "404.html") linkedHtmlFiles.add(linkedFile);
  }
  internalLinkGraph.set(file, linkedHtmlFiles);

  if (!isErrorPage && file !== "index.html" && /<form\b[^>]*class="[^"]*\bquote-form\b/i.test(html)) {
    const mainHtml = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/i)?.[0] || "";
    const meaningfulMainLinks = values(mainHtml, /<a\b[^>]*\shref="([^"]+)"/gi)
      .map((href) => internalHtmlFile(href, pageBaseUrl))
      .filter((linkedFile) => linkedFile && linkedFile !== file && linkedFile !== "privacy.html");
    if (!meaningfulMainLinks.length) errors.push(`${file}: commercial main content has no contextual internal route`);
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

const crawlDepth = new Map([["index.html", 0]]);
const crawlQueue = ["index.html"];
for (let queueIndex = 0; queueIndex < crawlQueue.length; queueIndex += 1) {
  const sourceFile = crawlQueue[queueIndex];
  const nextDepth = crawlDepth.get(sourceFile) + 1;
  for (const targetFile of internalLinkGraph.get(sourceFile) || []) {
    if (crawlDepth.has(targetFile)) continue;
    crawlDepth.set(targetFile, nextDepth);
    crawlQueue.push(targetFile);
  }
}
for (const indexableFile of canonicalOwners.values()) {
  if (!crawlDepth.has(indexableFile)) errors.push(`${indexableFile}: indexable page is unreachable from the homepage link graph`);
}
const maximumCrawlDepth = Math.max(0, ...[...canonicalOwners.values()].map((file) => crawlDepth.get(file) ?? Infinity));
if (maximumCrawlDepth > 2) errors.push(`HTML: maximum homepage crawl depth is ${maximumCrawlDepth}; expected 2 or less`);

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
if (responsiveAvifCardUsageCount !== 54) {
  errors.push(`HTML: expected 54 responsive AVIF card sources, found ${responsiveAvifCardUsageCount}`);
}
if (responsiveBodyUsageCount !== 80) {
  errors.push(`HTML: expected 80 responsive AVIF split images, found ${responsiveBodyUsageCount}`);
}
for (const spec of supplementalResponsiveSpecs) {
  const actualUsageCount = supplementalResponsiveUsageCounts.get(spec.key);
  if (actualUsageCount !== spec.expectedUsageCount) {
    errors.push(`HTML: expected ${spec.expectedUsageCount} supplemental responsive ${spec.key} images, found ${actualUsageCount}`);
  }
}
if (supplementalResponsiveFinishFirstCount !== 3 || supplementalResponsiveFinishOtherCount !== 4) {
  errors.push(`HTML: expected supplemental responsive finish images to use 3 first-card and 4 other-card sizes, found ${supplementalResponsiveFinishFirstCount} and ${supplementalResponsiveFinishOtherCount}`);
}
for (const stem of responsiveAvifCardStems) {
  if (!responsiveCardStems.has(stem) || !avifHeroStems.has(stem)) {
    errors.push(`HTML: responsive AVIF card source ${stem} must reuse an approved card and hero asset`);
  }
}

const imagesDirectory = path.join(root, "assets", "images");
const publicJpegPaths = [];
const catalogCleanSourceDirectory = path.join(root, "assets", "catalog", "clean-sources");
const catalogUnusedCategoryDirectory = path.join(root, "assets", "catalog", "categories");
const catalogSupersededPreview = path.join(root, "assets", "catalog", "previews", "60697040446.jpg");
const collectPublicJpegs = (directory) => {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entryPath !== catalogCleanSourceDirectory && entryPath !== catalogUnusedCategoryDirectory) collectPublicJpegs(entryPath);
    } else if (entryPath !== catalogSupersededPreview && /\.jpe?g$/i.test(entry.name) && !/ \d+\.jpe?g$/i.test(entry.name)) {
      publicJpegPaths.push(entryPath);
    }
  }
};
collectPublicJpegs(path.join(root, "assets"));
for (const jpegPath of publicJpegPaths) {
  try {
    const metadata = inspectJpegMetadata(fs.readFileSync(jpegPath));
    if (metadata.length) {
      errors.push(`${path.relative(root, jpegPath)}: public JPEG contains removable ${metadata.map((segment) => segment.name).join(", ")} metadata`);
    }
  } catch (error) {
    errors.push(`${path.relative(root, jpegPath)}: cannot inspect JPEG metadata (${error.message})`);
  }
}
const imageFiles = fs.readdirSync(imagesDirectory);
const standaloneDerivedDisplayWebps = new Set(["embossing-process-512.webp"]);
const responsiveWebpPattern = /^(.+)-w(512|768)\.webp$/;
const responsiveAvifPattern = /^(.+)-w(512|768)\.avif$/;
const responsiveWebpFiles = new Set(imageFiles.filter((file) => responsiveWebpPattern.test(file)));
const responsiveAvifFiles = new Set(imageFiles.filter((file) => responsiveAvifPattern.test(file)));
const jpegStems = new Set(imageFiles.filter((file) => file.endsWith(".jpg")).map((file) => file.replace(/\.jpg$/, "")));
const webpStems = new Set(imageFiles
  .filter((file) => file.endsWith(".webp") &&
    !standaloneDerivedDisplayWebps.has(file) &&
    !responsiveWebpPattern.test(file))
  .map((file) => file.replace(/\.webp$/, "")));
const actualAvifHeroStems = new Set(imageFiles
  .filter((file) => file.endsWith(".avif") && !responsiveAvifPattern.test(file))
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

const expectedResponsiveAvifFiles = new Set();
for (const stem of responsiveAvifCardStems) {
  for (const width of responsiveCardWidths) {
    const derivedFile = `${stem}-w${width}.avif`;
    const derivedPath = path.join(imagesDirectory, derivedFile);
    const fallbackFile = `${stem}-w${width}.webp`;
    const fallbackPath = path.join(imagesDirectory, fallbackFile);
    expectedResponsiveAvifFiles.add(derivedFile);
    if (!fs.existsSync(derivedPath)) {
      errors.push(`assets/images: missing responsive AVIF card image ${derivedFile}`);
      continue;
    }
    try {
      const derivedDimensions = readAvifDimensions(derivedPath);
      if (derivedDimensions.width !== width || derivedDimensions.height !== width) {
        errors.push(`assets/images: ${derivedFile} must be ${width}x${width}`);
      }
    } catch (error) {
      errors.push(`assets/images: cannot read ${derivedFile} dimensions (${error.message})`);
    }
    if (!fs.existsSync(fallbackPath) || fs.statSync(derivedPath).size >= fs.statSync(fallbackPath).size) {
      errors.push(`assets/images: ${derivedFile} must remain smaller than ${fallbackFile}`);
    }
  }
}
for (const expectedFile of expectedResponsiveAvifFiles) {
  if (!responsiveAvifFiles.has(expectedFile)) {
    errors.push(`assets/images: responsive AVIF derivative set is missing ${expectedFile}`);
  }
}
for (const actualFile of responsiveAvifFiles) {
  if (!expectedResponsiveAvifFiles.has(actualFile)) {
    errors.push(`assets/images: unexpected responsive AVIF derivative ${actualFile}`);
  }
}
if (responsiveAvifFiles.size !== 18 || expectedResponsiveAvifFiles.size !== 18) {
  errors.push(`assets/images: expected exactly 18 responsive AVIF derivatives, found ${responsiveAvifFiles.size}`);
}

if (actualAvifHeroStems.size !== avifHeroStems.size ||
    [...avifHeroStems].some((stem) => !actualAvifHeroStems.has(stem))) {
  errors.push(`assets/images: AVIF hero set must match the ${avifHeroStems.size} approved hero assets`);
}
for (const stem of avifHeroStems) {
  const avifPath = path.join(imagesDirectory, `${stem}.avif`);
  const webpPath = path.join(imagesDirectory, `${stem}.webp`);
  if (!fs.existsSync(avifPath) || !fs.existsSync(webpPath)) continue;
  try {
    const avifDimensions = readAvifDimensions(avifPath);
    if (avifDimensions.width !== 1024 || avifDimensions.height !== 1024) {
      errors.push(`assets/images: ${stem}.avif must remain 1024x1024`);
    }
  } catch (error) {
    errors.push(`assets/images: cannot read ${stem}.avif dimensions (${error.message})`);
  }
  if (fs.statSync(avifPath).size >= fs.statSync(webpPath).size) {
    errors.push(`assets/images: ${stem}.avif must remain smaller than its WebP fallback`);
  }
}
const avifHeroUsageCount = htmlFiles.reduce((count, file) => {
  const html = readPage(file)?.html || "";
  return count + (html.match(/<source\b[^>]*type="image\/avif"[^>]*srcset="assets\/images\/[^"]+\.avif"/gi) || []).length;
}, 0);
if (avifHeroUsageCount !== 33) {
  errors.push(`HTML: expected 33 AVIF hero usages, found ${avifHeroUsageCount}`);
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
const homepageProofPreload = homepageHtml.match(/<link\b[^>]*rel="preload"[^>]*as="image"[^>]*href="assets\/images\/emerald-rigid-box\.webp"[^>]*>/i)?.[0] || "";
if (attribute(homepageProofPreload, "imagesrcset") !== responsiveWebpSrcset("emerald-rigid-box") ||
    attribute(homepageProofPreload, "imagesizes") !== supplementalResponsiveSizes.proofFrame) {
  errors.push("index.html: homepage hero preload must match the responsive proof-frame candidates");
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
const visibleBlogDates = new Map();
const monthNumbers = new Map([
  ["January", "01"], ["February", "02"], ["March", "03"], ["April", "04"],
  ["May", "05"], ["June", "06"], ["July", "07"], ["August", "08"],
  ["September", "09"], ["October", "10"], ["November", "11"], ["December", "12"],
]);
for (const block of blogPageHtml.match(/<article\b[^>]*class="[^"]*\barticle-(?:feature|card)\b[^"]*"[^>]*>[\s\S]*?<\/article>/gi) || []) {
  const guideFile = block.match(/<h2>\s*<a\s+href="([^"]+\.html)"/i)?.[1] || "";
  const dateMatch = block.match(/<span\s+class="article-meta">[^<]*?([A-Z][a-z]+)\s+(\d{1,2}),\s+(\d{4})\b/i);
  if (!guideFile || !dateMatch || !monthNumbers.has(dateMatch[1])) {
    errors.push("blog.html: visible guide card is missing a valid page link or publication date");
    continue;
  }
  const visibleDate = `${dateMatch[3]}-${monthNumbers.get(dateMatch[1])}-${dateMatch[2].padStart(2, "0")}`;
  if (visibleBlogDates.has(guideFile)) errors.push(`blog.html: duplicate visible guide card for ${guideFile}`);
  visibleBlogDates.set(guideFile, visibleDate);
}
if (!blogSchema || !Array.isArray(blogSchema.blogPost)) {
  errors.push("blog.html: Blog schema with a blogPost list is missing");
} else {
  if (
    blogSchema["@id"] !== `${siteOrigin}/blog.html#blog` ||
    blogSchema.url !== `${siteOrigin}/blog.html` ||
    blogSchema.publisher?.["@id"] !== `${siteOrigin}/#organization`
  ) {
    errors.push("blog.html: Blog identity, URL, or publisher is inconsistent");
  }
  const blogPostsByUrl = new Map();
  for (const post of blogSchema.blogPost) {
    const postId = String(post?.["@id"] || "").trim();
    if (!postId.endsWith("#article")) {
      errors.push("blog.html: blogPost reference is missing a valid #article @id");
      continue;
    }
    const url = postId.slice(0, -"#article".length);
    if (blogPostsByUrl.has(url)) errors.push(`blog.html: duplicate BlogPosting URL ${url}`);
    blogPostsByUrl.set(url, post);
    if (Object.keys(post).length !== 1) {
      errors.push(`blog.html: blogPost must reference ${postId} without duplicating article fields`);
    }
  }
  if (blogSchema.isPartOf?.["@id"] !== `${siteOrigin}/#website`) {
    errors.push("blog.html: Blog entity must reference the canonical WebSite");
  }

  for (const [canonical, article] of articleEntriesByCanonical) {
    const post = blogPostsByUrl.get(canonical);
    if (!post) {
      errors.push(`blog.html: Blog schema is missing article ${canonical}`);
      continue;
    }
    if (post["@id"] !== `${canonical}#article`) {
      errors.push(`blog.html: BlogPosting reference does not match ${article.file}`);
    }
    if (visibleBlogDates.get(article.file) !== article.datePublished) {
      errors.push(`blog.html: visible card date does not match ${article.file}`);
    }
  }

  for (const visibleFile of visibleBlogDates.keys()) {
    if (![...articleEntriesByCanonical.values()].some((article) => article.file === visibleFile)) {
      errors.push(`blog.html: visible guide card has no matching BlogPosting page ${visibleFile}`);
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
    const feedItems = feed.match(/<item>[\s\S]*?<\/item>/g) || [];
    if (!feed.includes(`<atom:link href="${siteOrigin}/feed.xml" rel="self" type="application/rss+xml"/>`)) {
      errors.push("feed.xml: canonical self link is missing");
    }
    if (feedUrls.length !== blogPostsByUrl.size || feedUrlSet.size !== feedUrls.length) {
      errors.push(`feed.xml: expected ${blogPostsByUrl.size} unique guide entries, found ${feedUrlSet.size}`);
    }
    for (const url of blogPostsByUrl.keys()) {
      if (!feedUrlSet.has(url)) errors.push(`feed.xml: missing guide ${url}`);
    }
    const latestModified = [...articleEntriesByCanonical.values()]
      .map((article) => article.dateModified)
      .sort()
      .at(-1);
    const expectedLastBuildDate = latestModified
      ? new Date(`${latestModified}T00:00:00Z`).toUTCString()
      : "";
    if (!feed.includes(`<lastBuildDate>${expectedLastBuildDate}</lastBuildDate>`)) {
      errors.push(`feed.xml: lastBuildDate must use the latest Article dateModified (${expectedLastBuildDate})`);
    }
    for (const [url, article] of articleEntriesByCanonical) {
      const escapedUrl = escapeXml(url);
      const item = feedItems.find((block) => block.includes(`<guid isPermaLink="true">${escapedUrl}</guid>`));
      if (!item) continue;
      const expectedSignals = [
        `<title>${escapeXml(article.headline)}</title>`,
        `<link>${escapedUrl}</link>`,
        `<guid isPermaLink="true">${escapedUrl}</guid>`,
        `<pubDate>${new Date(`${article.datePublished}T00:00:00Z`).toUTCString()}</pubDate>`,
        `<description>${escapeXml(article.description)}</description>`,
      ];
      expectedSignals.forEach((signal) => {
        if (!item.includes(signal)) errors.push(`feed.xml: item fields do not match ${article.file}`);
      });
    }
  }
  if (!fs.existsSync(feedGeneratorPath)) {
    errors.push("RSS feed generator is missing");
  } else if (!fs.readFileSync(feedGeneratorPath, "utf8").includes('process.argv.includes("--check")')) {
    errors.push("RSS feed generator is missing the non-mutating --check release guard");
  }

  for (const feedDiscoveryPage of ["index.html", "blog.html"]) {
    const pageHtml = readPage(feedDiscoveryPage)?.html || "";
    if (!pageHtml.includes(`<link rel="alternate" type="application/rss+xml" title="GloryStarPack Buyer Guides" href="${siteOrigin}/feed.xml">`)) {
      errors.push(`${feedDiscoveryPage}: RSS discovery link is missing`);
    }
  }
}

const sitemapPath = path.join(root, "sitemap.xml");
let sitemapUrlSet = new Set();
let sitemapLastModified = new Map();
if (!fs.existsSync(sitemapPath)) {
  errors.push("sitemap.xml is missing");
} else {
  const sitemap = fs.readFileSync(sitemapPath, "utf8");
  const sitemapUrls = values(sitemap, /<loc>([^<]+)<\/loc>/gi);
  sitemapUrlSet = new Set(sitemapUrls);
  sitemapLastModified = new Map([...sitemap.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/gi)]
    .map((match) => [match[1], match[2]]));
  if (sitemapUrls.length !== sitemapUrlSet.size) errors.push("sitemap.xml: duplicate URL entries");
  if (sitemapLastModified.size !== sitemapUrlSet.size) {
    errors.push(`sitemap.xml: every URL needs one YYYY-MM-DD lastmod (${sitemapLastModified.size}/${sitemapUrlSet.size} valid)`);
  }
  for (const canonical of canonicalOwners.keys()) {
    if (!sitemapUrlSet.has(canonical)) errors.push(`sitemap.xml: missing canonical ${canonical}`);
  }
  for (const sitemapUrl of sitemapUrlSet) {
    if (!canonicalOwners.has(sitemapUrl)) errors.push(`sitemap.xml: URL has no matching canonical page ${sitemapUrl}`);
  }
  for (const [canonical, modifiedDate] of structuredModifiedByCanonical) {
    if (sitemapLastModified.get(canonical) !== modifiedDate) {
      errors.push(`sitemap.xml: ${canonical} lastmod must match structured dateModified ${modifiedDate}`);
    }
  }
}

const imageSitemapPath = path.join(root, "image-sitemap.xml");
const imageSitemapGeneratorPath = path.join(root, "scripts", "generate-image-sitemap.mjs");
if (!fs.existsSync(imageSitemapPath)) {
  errors.push("image-sitemap.xml is missing");
} else {
  const imageSitemap = fs.readFileSync(imageSitemapPath, "utf8");
  const imageEntries = [...imageSitemap.matchAll(/<url>([\s\S]*?)<\/url>/gi)].map((match) => ({
    page: match[1].match(/<loc>([^<]+)<\/loc>/i)?.[1]?.trim() || "",
    lastmod: match[1].match(/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/i)?.[1] || "",
    image: match[1].match(/<image:loc>([^<]+)<\/image:loc>/i)?.[1]?.trim() || "",
  }));
  const imagePages = new Set(imageEntries.map((entry) => entry.page));
  const imageUrls = new Set(imageEntries.map((entry) => entry.image));
  const expectedUniqueImages = new Set(primaryImageByCanonical.values());
  if (!imageSitemap.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"')) {
    errors.push("image-sitemap.xml: Google image namespace is missing");
  }
  if (imagePages.size !== imageEntries.length) errors.push("image-sitemap.xml: duplicate page entries");
  if (imageUrls.size !== imageEntries.length) errors.push("image-sitemap.xml: duplicate primary-image entries");
  if (imageUrls.size !== expectedUniqueImages.size || [...expectedUniqueImages].some((image) => !imageUrls.has(image))) {
    errors.push(`image-sitemap.xml: expected all ${expectedUniqueImages.size} unique page primary images, found ${imageUrls.size}`);
  }
  for (const entry of imageEntries) {
    if (!sitemapUrlSet.has(entry.page)) errors.push(`image-sitemap.xml: page is absent from sitemap.xml (${entry.page})`);
    if (primaryImageByCanonical.get(entry.page) !== entry.image) errors.push(`image-sitemap.xml: page does not expose mapped og:image (${entry.page})`);
    if (!entry.lastmod || sitemapLastModified.get(entry.page) !== entry.lastmod) {
      errors.push(`image-sitemap.xml: lastmod does not match sitemap.xml (${entry.page})`);
    }
  }
}
if (!fs.existsSync(imageSitemapGeneratorPath)) {
  errors.push("Image sitemap generator is missing");
} else if (!fs.readFileSync(imageSitemapGeneratorPath, "utf8").includes('process.argv.includes("--check")')) {
  errors.push("Image sitemap generator is missing the non-mutating --check release guard");
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
    ['document.body.classList.add("analytics-consent-open")', "mobile quick-contact collision guard"],
    ['document.body.classList.remove("analytics-consent-open")', "mobile quick-contact restoration"],
    ['href.startsWith("tel:")', "phone-contact conversion event"],
    ['paper_caliper_unit_converter', "paper-caliper converter event"],
    ['custom_packaging_lead_time_planner', "lead-time planner event"],
    ['planning_mode', "lead-time planner direction only"],
  ];
  requiredAnalyticsSignals.forEach(([signal, label]) => {
    if (!analyticsAsset.includes(signal)) errors.push(`assets/analytics.js: missing ${label}`);
  });
}

const siteScriptPath = path.join(root, "assets", "site.js");
const siteStylePath = path.join(root, "assets", "site.css");
const catalogScriptPath = path.join(root, "assets", "catalog.js");
const siteScript = fs.existsSync(siteScriptPath) ? fs.readFileSync(siteScriptPath, "utf8") : "";
const siteStyle = fs.existsSync(siteStylePath) ? fs.readFileSync(siteStylePath, "utf8") : "";
const catalogScript = fs.existsSync(catalogScriptPath) ? fs.readFileSync(catalogScriptPath, "utf8") : "";
const requiredCatalogPerformanceSignals = [
  ["catalogLoadPromise", "single-flight catalog loading"],
  ["new IntersectionObserver", "near-viewport catalog loading"],
  ['rootMargin: "800px 0px"', "catalog loading lead distance"],
  ['root.addEventListener("pointerenter"', "pointer interaction fallback"],
  ['root.addEventListener("focusin"', "keyboard interaction fallback"],
  ['root.setAttribute("aria-busy", "true")', "catalog loading semantics"],
  ['root.removeAttribute("aria-busy")', "catalog loaded semantics"],
  ["const catalogDescriptionFor = (product, policy)", "controlled runtime product descriptions"],
  ["product.description = catalogDescriptionFor(product, payload.copyPolicy)", "runtime product-description hydration"],
  ["product.searchText = normalize", "precomputed product search text"],
  ["window.setTimeout(() => renderProducts(), 120)", "mobile-safe search rendering schedule"],
  ["readCatalogStateFromUrl", "restorable catalog URL state"],
  ["writeCatalogStateToUrl", "catalog URL-state updates"],
  ['window.addEventListener("popstate"', "browser-history catalog restoration"],
  ['data-catalog-library-category-select', "mobile category selector"],
  ['document.body.classList.add("catalog-dialog-open")', "catalog dialog collision state"],
  ["dialogReturnFocus", "catalog dialog focus return"],
  ['event.target === dialog', "catalog backdrop close"],
  ['?.focus({ preventScroll: true })', "catalog category focus preservation"],
];
requiredCatalogPerformanceSignals.forEach(([signal, label]) => {
  if (!catalogScript.includes(signal)) errors.push(`assets/catalog.js: missing ${label}`);
});
const catalogDataVersions = values(catalogScript, /assets\/catalog\/catalog\.json\?v=([a-f0-9]{12})/gi);
if (catalogDataVersions.length !== 1 || catalogDataVersions[0] !== requiredCatalogDataVersion) {
  errors.push(`assets/catalog.js: expected catalog.json content version ${requiredCatalogDataVersion}`);
}
const requiredProgressiveQuoteSignals = [
  [siteScript, 'const optionalFieldNames = ["phone", "dimensions", "targetDate", "details", "attachment"]', "five optional quote fields"],
  [siteScript, '.filter((field) => field && !field.querySelector(":required"))', "required fields kept out of the optional disclosure"],
  [siteScript, 'const requiredFields = Array.from(form.querySelectorAll(":required"))', "runtime required-field discovery"],
  [siteScript, 'requiredNote.className = "form-required-note"', "visible required-field guidance"],
  [siteScript, 'requiredMarker.setAttribute("aria-hidden", "true")', "assistive-technology-hidden required marker"],
  [siteScript, 'optionalDetails.className = "quote-form__optional field--full"', "optional quote disclosure"],
  [siteScript, 'if (optionalDetails) optionalDetails.open = false', "optional section reset"],
  [siteScript, 'window.matchMedia("(max-width: 900px)")', "tablet-safe responsive navigation state"],
  [siteScript, 'document.documentElement.classList.add("js")', "progressive navigation enhancement marker"],
  [siteScript, 'nav.toggleAttribute("inert"', "closed-navigation keyboard guard"],
  [siteScript, 'navigationBackground().forEach', "open-navigation background isolation"],
  [siteScript, 'event.key === "Tab" && navigationOpen', "open-navigation focus loop"],
  [siteScript, "mobileNavigation.matches && Boolean(nav?.contains(document.activeElement))", "mobile-breakpoint focus recovery"],
  [siteScript, "document.querySelectorAll('a[target=\"_blank\"]')", "new-tab link announcement"],
  [siteScript, "opens in a new tab", "new-tab accessible-name disclosure"],
  [siteScript, "new AbortController()", "quote request timeout controller"],
  [siteScript, "18000", "bounded quote request timeout"],
  [siteScript, 'glorystarpack:quote-submit-attempt', "quote-submit attempt signal"],
  [siteScript, 'glorystarpack:quote-delivery-error', "quote-delivery error signal"],
  [siteScript, "directUrlEncodedBudget = 1900", "bounded direct-channel URL budget"],
  [siteScript, "Email and WhatsApp may use a shortened version. Copy project brief always contains every detail.", "direct-channel truncation disclosure"],
  [siteScript, 'if (options.focusFirst !== false) emailLink.focus()', "fallback action focus"],
  [siteScript, 'manualBrief.select()', "manual project-brief selection"],
  [siteScript, 'form.addEventListener("invalid", showValidationState, true)', "native-validation error summary"],
  [siteScript, 'field.setAttribute("aria-invalid", "true")', "persistent invalid-field semantics"],
  [siteScript, 'unresolvedFieldCount', "live invalid-field count"],
  [siteScript, 'field.setAttribute("aria-errormessage", status.id)', "field-to-error relationship"],
  [siteScript, 'status.setAttribute("role", urgent ? "alert" : "status")', "adaptive error announcement"],
  [siteScript, 'Choose another file, or remove it and send the brief without an attachment.', "correctable attachment error"],
  [siteScript, 'fileInput?.focus()', "attachment-error focus recovery"],
  [siteScript, 'headerLogo,', "mobile-navigation logo focus order"],
  [siteScript, '--navigation-viewport-height', "measured mobile-navigation height"],
  [siteScript, 'mainContent?.focus({ preventScroll: true })', "skip-link focus transfer"],
  [siteScript, 'optionalSummary.querySelector("small").textContent', "catalog-reference quote continuity"],
  [siteScript, 'const productCategoryMap = {', "marketplace product-to-category mapping"],
  [siteScript, 'commercial.className = "marketplace-card__commercial"', "marketplace commercial context"],
  [siteScript, 'const applyCatalogFilter = (filter, shouldScroll = false)', "marketplace category filtering"],
  [siteScript, 'button.setAttribute("aria-pressed"', "marketplace filter state semantics"],
  [siteScript, 'const paperCaliperConverter = document.querySelector("#paper-caliper-converter-form")', "paper-caliper converter"],
  [siteScript, 'const unitToMillimetres = {', "exact paper-caliper unit factors"],
  [siteScript, 'const packagingLeadTimePlanner = document.querySelector("#packaging-lead-time-planner")', "custom packaging lead-time planner"],
  [siteScript, 'const addCalendarDays = (date, days)', "UTC calendar-day schedule arithmetic"],
  [siteScript, 'const stageDays = [', "explicit lead-time stage formula"],
  [siteScript, 'const revisionDays = values.revisionRounds * values.revisionCycleDays', "controlled revision-cycle calculation"],
  [siteScript, 'navigator.clipboard?.writeText', "copyable lead-time planning brief"],
  [siteStyle, ".quote-form__optional > summary:focus-visible", "optional-section keyboard focus"],
  [siteStyle, ".form-required-note", "required-field guidance styling"],
  [siteStyle, ".form-required-indicator", "required-field marker styling"],
  [siteStyle, ".form-note--noscript", "no-JavaScript form guidance"],
  [siteStyle, ".form-fallback-manual textarea", "manual-copy fallback styling"],
  [siteStyle, '[aria-invalid="true"]', "persistent invalid-field styling"],
  [siteStyle, "min-height: 44px", "fallback-action touch target"],
  [siteStyle, ".subhero__background picture", "AVIF hero picture sizing"],
  [siteStyle, ".product-card__media > picture", "responsive product-card picture sizing"],
  [siteStyle, ".article-card > picture > img", "responsive article-card picture sizing"],
  [siteStyle, ".split__media > picture > img", "responsive split-media picture sizing"],
  [siteStyle, ".marketplace-layout", "marketplace sidebar and results layout"],
  [siteStyle, ".catalog-marketplace .card-grid", "marketplace product grid"],
  [siteStyle, "html:not(.js) .site-nav", "no-JavaScript mobile navigation"],
  [siteStyle, '.field input:focus-visible,', "form-control keyboard focus ring"],
  [siteStyle, '.js .site-nav > a[aria-current]:not(.button)', "mobile current-section marker"],
];
requiredProgressiveQuoteSignals.forEach(([source, signal, label]) => {
  if (!source.includes(signal)) errors.push(`Progressive quote form is missing ${label}`);
});

const leadTimePlannerPage = readPage("custom-packaging-lead-time-planner.html")?.html || "";
const requiredLeadTimePlannerSignals = [
  ['id="packaging-lead-time-planner"', "planner form"],
  ['name="mode"', "planning direction"],
  ['name="anchorDate"', "anchor date"],
  ['name="scopeDays"', "scope duration"],
  ['name="artworkDays"', "artwork duration"],
  ['name="sampleBuildDays"', "sample build duration"],
  ['name="sampleTransitDays"', "sample transit duration"],
  ['name="buyerReviewDays"', "buyer review duration"],
  ['name="revisionRounds"', "revision rounds"],
  ['name="revisionCycleDays"', "revision duration"],
  ['name="materialDays"', "material and tooling duration"],
  ['name="productionDays"', "production duration"],
  ['name="releaseDays"', "inspection and packing duration"],
  ['name="deliveryDays"', "freight and delivery duration"],
  ['name="bufferDays"', "visible contingency"],
  ['data-lead-time-copy', "copyable planning brief"],
  ['data-lead-time-output="milestones" aria-live="polite"', "live milestone schedule"],
  ['buyer-entered planning scenario', "non-guarantee boundary"],
  ['"@type": "WebApplication"', "planner structured entity"],
];
requiredLeadTimePlannerSignals.forEach(([signal, label]) => {
  if (!leadTimePlannerPage.includes(signal)) errors.push(`custom-packaging-lead-time-planner.html: missing ${label}`);
});

const requiredVisualSystemSignals = [
  ["/* Cohesive visual system shared by every page family. */", "shared visual-system layer"],
  ["--shadow-card", "shared card elevation token"],
  [".button--outline {", "secondary button treatment"],
  [".subhero::before", "shared hero registration grid"],
  [".catalog-library-card h3,", "shared catalog typography"],
  [".catalog-library {\n  background: var(--paper);", "catalog section hierarchy"],
  [".reference-hero {\n  position: relative;\n  color: #fff;", "dark product-reference hero"],
  [".reference-hero .button--outline", "product-reference secondary action contrast"],
  ['grid-template-areas:\n    "media intro"\n    "media details";', "desktop product-reference narrative grid"],
  ['grid-template-areas:\n      "intro"\n      "media"\n      "details";', "mobile title-image-details reading order"],
  [".reference-hero__details .hero__actions", "mobile product-reference action spacing"],
  [".catalog-library-dialog {\n  width: min(980px, calc(100% - 32px));\n  color: #fff;", "catalog preview visual continuity"],
  [".catalog-library-dialog__content .button--outline", "catalog preview secondary action contrast"],
  [".topline__inner > span:last-child", "desktop topline separation"],
  [".footer-col {\n    padding-left: 28px;", "desktop footer column rhythm"],
  [".content-prose,\n.article-copy {\n  max-width: 72ch;", "shared long-form reading width"],
  ["padding-bottom: calc(96px + env(safe-area-inset-bottom));", "mobile footer clearance"],
  ["body.analytics-consent-open .floating-contact", "mobile consent-panel collision guard"],
  ["grid-template-columns: repeat(3, minmax(0, 1fr));\n    flex-direction: row;", "mobile quick-contact action layout"],
  [".js .catalog-library__mobile-category", "mobile catalog category selector"],
  [".catalog-library-dialog__close {\n    position: sticky;", "mobile sticky catalog close action"],
  ["body.catalog-dialog-open .floating-contact", "catalog-dialog contact collision guard"],
  [".site-footer {\n  border-top: 1px solid rgba(194, 163, 94, 0.28);", "site-wide footer seam"],
];
requiredVisualSystemSignals.forEach(([signal, label]) => {
  if (!siteStyle.includes(signal)) errors.push(`Visual system is missing ${label}`);
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
    ['typeof attachmentValue === "object"', "attachment object guard"],
    ['const malformedJsonAttachment', "complete JSON attachment contract"],
    ['RESEND_TIMEOUT_MS', "bounded Resend delivery timeout"],
    ['signal: resendController.signal', "Resend abort signal"],
    ['createHash("sha256")', "stable submission fingerprint"],
    ['`quote-${submissionFingerprint}`', "stable Resend idempotency key"],
    ['!apiKey || !fromEmail || !toEmail', "required recipient configuration"],
    ['const TEXT_FIELD_NAMES', "string-only text field contract"],
    ['const CANONICAL_ORIGIN', "canonical request origin"],
    ['const isPreview = vercelEnvironment === "preview"', "preview-only same-host origin support"],
    ['const isLocalDevelopment = vercelEnvironment === "development"', "explicit local-development origin support"],
    ['allowedProtocols = ["https:"]', "HTTPS-only preview origin support"],
    ['fetchSite === "cross-site"', "cross-site browser request rejection"],
    ['console.error("Resend quote error", resendResponse.status);', "redacted provider-error logging"],
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
    [`Sitemap: ${siteOrigin}/image-sitemap.xml`, "image sitemap declaration"],
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
    [`${siteOrigin}/custom-packaging-lead-time-planner.html`, "custom packaging lead time planner"],
    [`${siteOrigin}/paper-thickness-gsm-pt-mm-conversion-guide.html`, "paper thickness conversion guide"],
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
const productionImageAuditPath = path.join(root, "scripts", "audit-production-image-sitemap.mjs");
const productionServiceAuditPath = path.join(root, "scripts", "audit-production-services.mjs");
const productionContactAuditPath = path.join(root, "scripts", "audit-production-contact.mjs");
const productionShellAuditPath = path.join(root, "scripts", "audit-production-shell.mjs");
const siteShellSyncPath = path.join(root, "scripts", "synchronize-site-shell.mjs");
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
if (!fs.existsSync(productionContactAuditPath)) {
  errors.push("Production contact audit script is missing");
} else {
  const productionContactAudit = fs.readFileSync(productionContactAuditPath, "utf8");
  const requiredProductionContactSignals = [
    ["https://wa.me/8619577608248", "current WhatsApp route"],
    ["tel:+8619577608248", "current direct-call route"],
    ["+86-195-7760-8248", "current structured telephone"],
    ["retiredPhonePattern", "retired-number rejection"],
    ["sitemap.xml", "whole-site contact crawl"],
    ["assets/site.js", "browser quote fallback check"],
  ];
  requiredProductionContactSignals.forEach(([signal, label]) => {
    if (!productionContactAudit.includes(signal)) errors.push(`Production contact audit is missing ${label}`);
  });
}
if (!fs.existsSync(siteShellSyncPath)) {
  errors.push("Site-shell synchronization script is missing");
} else {
  const siteShellSync = fs.readFileSync(siteShellSyncPath, "utf8");
  const requiredSiteShellSignals = [
    [requiredToplinePrimary, "shared topline message"],
    [requiredFooterBrand, "shared footer brand statement"],
    [requiredFooterSignature, "shared footer signature"],
    ['const footerHeadings = ["Products", "Explore", "Contact"]', "shared footer column headings"],
    ['floating-contact floating-contact--home', "shared quick-contact toolbar"],
    ['href="tel:+8619577608248"', "shared direct-call action"],
    ["floatingContactPattern", "existing quick-contact replacement"],
    ["mainContentPattern", "focusable main-content target"],
    ["normalizedNavigation", "current-navigation token normalization"],
    ['aria-labelledby="quote-section-title"', "quote-form accessible name"],
    ["assetVersions", "content-derived shared asset versions"],
    ["expected three footer navigation columns", "footer column-count guard"],
  ];
  requiredSiteShellSignals.forEach(([signal, label]) => {
    if (!siteShellSync.includes(signal)) errors.push(`Site-shell synchronization is missing ${label}`);
  });
}
if (!fs.existsSync(productionShellAuditPath)) {
  errors.push("Production shell audit script is missing");
} else {
  const productionShellAudit = fs.readFileSync(productionShellAuditPath, "utf8");
  const requiredProductionShellSignals = [
    [requiredToplinePrimary, "shared topline message"],
    [requiredFooterBrand, "shared footer brand statement"],
    [requiredFooterSignature, "shared footer signature"],
    ["sitemap.xml", "whole-site crawl"],
    ["404.html", "non-indexable shell check"],
    ["shared quick-contact toolbar mismatch", "quick-contact toolbar check"],
    ["focusable main-content target mismatch", "skip-link target check"],
    ["quote-form accessibility relationship mismatch", "quote-form relationship check"],
    ["assets/site.css", "production visual-system hash check"],
    ["production content differs from the local release", "stale production CSS rejection"],
    ["mobile quick-contact collision guard is missing", "mobile quick-contact style check"],
    ["assets/analytics.js", "production interaction-script hash check"],
    ["expected analytics.js version", "per-page interaction-script version check"],
    ["consent collision restoration is missing", "mobile consent-state restoration check"],
    ["assets/site.js", "production shared-interaction hash check"],
    ["expected site.js version", "per-page shared-interaction version check"],
    ["assets/catalog.js", "production catalog-interaction hash check"],
    ["expected catalog.js version", "catalog interaction-version check"],
    ["restorable URL state is missing", "catalog URL-state check"],
    ["correctable attachment error is missing", "attachment correction check"],
  ];
  requiredProductionShellSignals.forEach(([signal, label]) => {
    if (!productionShellAudit.includes(signal)) errors.push(`Production shell audit is missing ${label}`);
  });
}
if (!fs.existsSync(buildOutputValidationPath)) {
  errors.push("Build Output validation script is missing");
} else {
  const buildOutputValidation = fs.readFileSync(buildOutputValidationPath, "utf8");
  const requiredBuildOutputSignals = [
    ['Function config is not valid JSON', "API function config parsing"],
    ['Missing function handler bundle', "API function handler presence"],
    ['Function source mismatch', "API function source freshness"],
    ['Unexpected static file', "unexpected static file rejection"],
  ];
  requiredBuildOutputSignals.forEach(([signal, label]) => {
    if (!buildOutputValidation.includes(signal)) errors.push(`Build Output validation is missing ${label}`);
  });
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
    ["Production sitemap does not exactly match the local release", "production sitemap release guard"],
    ["production HTML does not match the local release", "production HTML release guard"],
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
    ["/tmp/authorized-catalog-image-selection.json", "private temporary artifact 404 probe"],
    ["/assets/catalog/clean-sources/manifest.json", "private clean-source artifact 404 probe"],
    ["/assets/catalog/import-report.json", "private catalog report 404 probe"],
    ["/assets/catalog/curated-products.json", "private curated manifest 404 probe"],
  ];
  requiredProductionAuditSignals.forEach(([signal, label]) => {
    if (!productionIndexAudit.includes(signal)) errors.push(`Production indexing audit is missing ${label}`);
  });
}
if (!fs.existsSync(productionImageAuditPath)) {
  errors.push("Production image sitemap audit script is missing");
} else {
  const productionImageAudit = fs.readFileSync(productionImageAuditPath, "utf8");
  const requiredProductionImageAuditSignals = [
    ["image-sitemap.xml", "image sitemap crawl source"],
    ["http://www.google.com/schemas/sitemap-image/1.1", "Google image sitemap namespace check"],
    ["content-type", "XML and JPEG content-type checks"],
    ["localImageSitemap", "validated local-release comparison"],
    ["expectedEntryCount", "dynamic whole-site image count check"],
    ["entry.page", "detail-page HTTP check"],
    ["entry.image", "image HTTP check"],
    ["page primary-image metadata does not match the sitemap image", "whole-site primary-image metadata check"],
    ["detail page title-image-details order is missing", "product-reference reading-order check"],
    ["legacy monolithic reference hero remains", "legacy product-reference wrapper check"],
    ["expected 12 curated reference pages", "curated-reference coverage check"],
    ["x-robots-tag", "X-Robots-Tag crawl check"],
    ["robots.txt", "robots declaration check"],
    ["inspectJpegMetadata", "JPEG metadata inspection"],
    ["1600727801473.jpg", "known GPS-metadata derivative probe"],
  ];
  requiredProductionImageAuditSignals.forEach(([signal, label]) => {
    if (!productionImageAudit.includes(signal)) errors.push(`Production image sitemap audit is missing ${label}`);
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
    const imageSitemapHeader = headers.find((entry) => entry.source === "/image-sitemap.xml");
    const hasImageSitemapCache = Array.isArray(imageSitemapHeader?.headers) && imageSitemapHeader.headers.some((header) =>
      header.key === "Cache-Control" && header.value.includes("stale-while-revalidate"));
    const hasImageSitemapNosniff = Array.isArray(imageSitemapHeader?.headers) && imageSitemapHeader.headers.some((header) =>
      header.key === "X-Content-Type-Options" && header.value === "nosniff");
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
    if (!hasImageSitemapCache) errors.push("vercel.json: image-sitemap.xml cache header is missing");
    if (!hasImageSitemapNosniff) errors.push("vercel.json: image-sitemap.xml nosniff header is missing");
    if (generalAssetsPosition < 0 || fontAssetsPosition <= generalAssetsPosition) {
      errors.push("vercel.json: the font header rule must follow and override the general assets rule");
    }
    if (!hasImmutableFontCache) errors.push("vercel.json: fonts need a one-year immutable cache header");
    if (!hasFontCors) errors.push("vercel.json: fonts need an explicit cross-origin response header");
    for (const assetPath of ["/assets/site.css", "/assets/site.js", "/assets/analytics.js", "/assets/catalog.js", "/assets/catalog/catalog.json"]) {
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
  console.log(`Validated ${canonicalOwners.size} indexable HTML pages and ${htmlFiles.length - canonicalOwners.size} non-indexable HTML page: metadata/social URLs, robots directives, canonicals, H1, JSON-LD/FAQ parity, article/blog discovery, navigation, IDs, responsive card/body images, image dimensions, quote forms, assets, links, inbound routes, redirects, crawler policy, API safeguards, and sitemap are consistent.`);
}
