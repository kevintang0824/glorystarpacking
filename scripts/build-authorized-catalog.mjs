import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { catalogCopyFor, catalogCopyTemplates, toPublicCatalogProduct } from "./catalog-copy-policy.mjs";
import { stripJpegMetadata } from "./jpeg-metadata.mjs";

const projectRoot = path.resolve(import.meta.dirname, "..");
const sourceRoot = process.argv[2] || "/Users/kevintang/Documents/HERMES/GLORYSTARWEAR-YOGA/finerpackaging";
const outputRoot = path.join(projectRoot, "assets", "catalog");
const imageOutputRoot = path.join(outputRoot, "products");
const previewOutputRoot = path.join(outputRoot, "previews");
const cleanSourceRoot = path.join(outputRoot, "clean-sources");
const cleanSourceManifest = JSON.parse(await fs.readFile(path.join(cleanSourceRoot, "manifest.json"), "utf8"));
const productImageVersion = "primary-20260826";
const productPreviewVersion = "preview-20260827";
const cleanedProductImageVersion = "primary-url-clean-20260827";
const cleanedProductPreviewVersion = "preview-url-clean-20260827";
const previewOverrides = new Map([
  ["60697040446", {
    fileName: "60697040446-enhanced.jpg",
    version: "enhanced-20260827",
    method: "AI-assisted high-resolution reconstruction from the authorized source image",
  }],
]);
const productsPayload = JSON.parse(await fs.readFile(path.join(sourceRoot, "products.json"), "utf8"));
const groups = JSON.parse(await fs.readFile(path.join(sourceRoot, "groups.json"), "utf8"));

const groupMap = new Map(groups.map((group) => [String(group.id), group]));
const categoryNames = {
  "Hot Sale": "Featured products",
  "$0.01 SAMPLE": "Sample development",
  "Mailer Box & Shipping Box": "Mailer & shipping boxes",
  "Paper Bag": "Paper bags",
  "Gift Box": "Gift boxes",
  "Clothing Packaging": "Clothing packaging",
  "Cosmetic Packaging": "Cosmetic packaging",
  "Food Packaging": "Food packaging",
  "Sushi Packaging Box": "Sushi packaging",
  "Cardboard Displays": "Cardboard displays",
  "Tea Packaging": "Tea packaging",
  "Candle Packaging": "Candle packaging",
  "Health care box": "Healthcare packaging",
  "Paper Cards & Booklet": "Paper cards & booklets",
  "Sticker&Label": "Stickers & labels",
  "Pouches": "Pouches",
  "Ungrouped": "Other packaging",
};
const categoryOrder = Object.values(categoryNames);
const categorySlugs = Object.fromEntries(categoryOrder.map((name) => [name, name
  .toLowerCase()
  .replace(/&/g, "and")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "")]));

const categoryFor = (groupId) => {
  const group = groupMap.get(String(groupId));
  const rootName = group?.path?.[0] || group?.name || "Ungrouped";
  return categoryNames[rootName] || rootName;
};
const imageDimensions = (buffer) => {
  if (buffer.length >= 24 && buffer.toString("hex", 0, 8) === "89504e470d0a1a0a") {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if (buffer.length >= 12 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    const startOfFrameMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
    for (let offset = 2; offset + 9 < buffer.length;) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buffer[offset + 1];
      if (marker === 0xd8 || marker === 0xd9 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        offset += 2;
        continue;
      }
      if (offset + 4 > buffer.length) break;
      const segmentLength = buffer.readUInt16BE(offset + 2);
      if (startOfFrameMarkers.has(marker) && offset + 9 < buffer.length) {
        return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
      }
      if (segmentLength < 2) break;
      offset += segmentLength + 2;
    }
  }
  if (buffer.length >= 30 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    const chunk = buffer.toString("ascii", 12, 16);
    if (chunk === "VP8X") {
      const readUint24LE = (offset) => buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);
      return { width: readUint24LE(24) + 1, height: readUint24LE(27) + 1 };
    }
    if (chunk === "VP8 " && buffer[23] === 0x9d && buffer[24] === 0x01 && buffer[25] === 0x2a) {
      return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
    }
    if (chunk === "VP8L" && buffer[20] === 0x2f) {
      return {
        width: 1 + buffer[21] + ((buffer[22] & 0x3f) << 8),
        height: 1 + ((buffer[22] & 0xc0) >> 6) + (buffer[23] << 2) + ((buffer[24] & 0x0f) << 10),
      };
    }
  }
  throw new Error("unsupported source image dimensions");
};

const fittedDimensions = (width, height, maxDimension) => {
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
};

await Promise.all([
  fs.mkdir(imageOutputRoot, { recursive: true }),
  fs.mkdir(previewOutputRoot, { recursive: true }),
]);

const primarySourceImage = async (product) => {
  const productId = String(product.id);
  const imageDirectory = path.join(sourceRoot, "images", productId);
  const imageNames = (await fs.readdir(imageDirectory))
    .filter((name) => /\.(?:jpe?g|png|webp)$/i.test(name))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
  const primaryName = imageNames.find((name) => /^01_/i.test(name));
  if (!primaryName) throw new Error(`${productId}: source primary image 01 is missing`);

  const expectedName = String(product.imageUrlList?.[0]?.filename || "");
  const expectedStem = path.parse(expectedName).name;
  const actualStem = path.parse(primaryName.replace(/^01_/, "")).name;
  if (!expectedStem || expectedStem !== actualStem) {
    throw new Error(`${productId}: local primary image does not match the first source image record`);
  }
  return path.join(imageDirectory, primaryName);
};

const records = await Promise.all(productsPayload.products.map(async (product) => {
  const productId = String(product.id);
  const category = categoryFor(product.groupId);
  const copy = catalogCopyFor(product.subject, category);
  const originalSourceImage = await primarySourceImage(product);
  const cleanSource = cleanSourceManifest.products?.[productId];
  const sourceImage = cleanSource ? path.join(cleanSourceRoot, cleanSource.file) : originalSourceImage;
  if (cleanSource) await fs.access(sourceImage);
  const imageName = `${productId}.jpg`;
  const previewOverride = previewOverrides.get(productId);
  const previewName = previewOverride?.fileName || imageName;
  return {
    id: productId,
    title: copy.title,
    category,
    categorySlug: categorySlugs[category] || "other-packaging",
    description: copy.description,
    claimReviewRequired: copy.claimReviewRequired,
    image: `assets/catalog/products/${imageName}?v=${cleanSource ? cleanedProductImageVersion : productImageVersion}`,
    previewImage: `assets/catalog/previews/${previewName}?v=${previewOverride?.version || (cleanSource ? cleanedProductPreviewVersion : productPreviewVersion)}`,
    sourceImage,
    outputImage: path.join(imageOutputRoot, imageName),
    previewOutputImage: path.join(previewOutputRoot, previewName),
    previewOverrideImage: previewOverride ? path.join(previewOutputRoot, previewName) : null,
    previewReconstructed: Boolean(previewOverride),
    previewEnhancementMethod: previewOverride?.method || undefined,
    legacyBrandingRemoved: cleanSource ? true : undefined,
    imageCleanupMethod: cleanSource?.method || undefined,
    galleryCount: Array.isArray(product.imageUrlList) ? product.imageUrlList.length : 1,
    sourceMoq: String(product.moq || "").trim(),
    sourceImagePosition: cleanSource?.sourceImagePosition || 1,
  };
}));

let dimensionIndex = 0;
const dimensionWorker = async () => {
  while (dimensionIndex < records.length) {
    const record = records[dimensionIndex++];
    const dimensions = imageDimensions(await fs.readFile(record.sourceImage));
    const cardDimensions = fittedDimensions(dimensions.width, dimensions.height, 480);
    const previewDimensions = record.previewOverrideImage
      ? imageDimensions(await fs.readFile(record.previewOverrideImage))
      : fittedDimensions(dimensions.width, dimensions.height, 960);
    Object.assign(record, {
      sourceWidth: dimensions.width,
      sourceHeight: dimensions.height,
      cardWidth: cardDimensions.width,
      cardHeight: cardDimensions.height,
      previewWidth: previewDimensions.width,
      previewHeight: previewDimensions.height,
    });
  }
};
await Promise.all(Array.from({ length: 4 }, dimensionWorker));

const conversionJobs = records.flatMap((record) => [
  {
    id: record.id,
    kind: "card",
    sourceImage: record.sourceImage,
    outputImage: record.outputImage,
    maxDimension: String(Math.max(record.cardWidth, record.cardHeight)),
    quality: "72",
    shouldResize: Math.max(record.sourceWidth, record.sourceHeight) > 480,
  },
  ...(!record.previewOverrideImage ? [{
    id: record.id,
    kind: "preview",
    sourceImage: record.sourceImage,
    outputImage: record.previewOutputImage,
    maxDimension: String(Math.max(record.previewWidth, record.previewHeight)),
    quality: "82",
    shouldResize: Math.max(record.sourceWidth, record.sourceHeight) > 960,
  }] : []),
]);

const runImageOptimization = async (record) => {
  const sourceExtension = path.extname(record.sourceImage).toLowerCase();
  if (!record.shouldResize && (sourceExtension === ".jpg" || sourceExtension === ".jpeg")) {
    await fs.copyFile(record.sourceImage, record.outputImage);
  } else {
    const resizeArguments = record.shouldResize ? ["--resampleHeightWidthMax", record.maxDimension] : [];
    await new Promise((resolve, reject) => {
      const child = spawn("sips", [
      ...resizeArguments,
      "--setProperty", "format", "jpeg",
      "--setProperty", "formatOptions", record.quality,
      record.sourceImage,
      "--out", record.outputImage,
      ], { stdio: ["ignore", "ignore", "pipe"] });
      let stderr = "";
      child.stderr.on("data", (chunk) => { stderr += chunk; });
      child.on("error", reject);
      child.on("close", (code) => code === 0 ? resolve() : reject(new Error(`${record.id}: ${stderr.trim()}`)));
    });
  }
  const optimizedImage = await fs.readFile(record.outputImage);
  const strippedImage = stripJpegMetadata(optimizedImage);
  if (strippedImage.removedBytes) await fs.writeFile(record.outputImage, strippedImage.buffer);
};

let nextIndex = 0;
let completed = 0;
const failures = [];
const worker = async () => {
  while (nextIndex < conversionJobs.length) {
    const index = nextIndex++;
    const record = conversionJobs[index];
    try {
      await runImageOptimization(record);
    } catch (error) {
      failures.push({ id: record.id, kind: record.kind, error: error.message });
    }
    completed += 1;
    if (completed % 100 === 0 || completed === conversionJobs.length) {
      process.stdout.write(`Optimized ${completed}/${conversionJobs.length} catalog images\n`);
    }
  }
};
await Promise.all(Array.from({ length: 4 }, worker));

const failedCardIds = new Set(failures.filter((failure) => failure.kind === "card").map((failure) => failure.id));
const failedPreviewIds = new Set(failures.filter((failure) => failure.kind === "preview").map((failure) => failure.id));
const publishedAuditRecords = records
  .filter((record) => !failedCardIds.has(record.id))
  .map(({ sourceImage, outputImage, previewOutputImage, previewOverrideImage, ...record }) => ({
    ...record,
    previewImage: failedPreviewIds.has(record.id) ? record.image : record.previewImage,
    imagePresentation: record.legacyBrandingRemoved
      ? "Brand-cleaned corresponding product photo"
      : "Corresponding source product photo",
  }));
const publishedRecords = publishedAuditRecords.map(toPublicCatalogProduct);
const categoryCounts = categoryOrder.map((name) => ({
  name,
  slug: categorySlugs[name],
  count: publishedRecords.filter((record) => record.category === name).length,
})).filter((category) => category.count > 0);
const catalog = {
  generatedAt: new Date().toISOString(),
  sourceAuthorized: true,
  total: publishedRecords.length,
  correspondingImageCount: publishedRecords.length,
  highResolutionPreviewCount: publishedRecords.length - failedPreviewIds.size,
  categoryReferenceCount: 0,
  copyPolicy: catalogCopyTemplates,
  categories: categoryCounts,
  products: publishedRecords,
};

await fs.writeFile(path.join(outputRoot, "catalog.json"), `${JSON.stringify(catalog)}\n`);
await fs.writeFile(path.join(cleanSourceRoot, "catalog-build-audit.json"), `${JSON.stringify({
  version: "private-catalog-build-audit-20260828",
  generatedAt: catalog.generatedAt,
  products: publishedAuditRecords,
}, null, 2)}\n`);
await fs.writeFile(path.join(outputRoot, "import-report.json"), `${JSON.stringify({ total: records.length, published: publishedRecords.length, correspondingImageCount: publishedRecords.length, highResolutionPreviewCount: publishedRecords.length - failedPreviewIds.size, categoryReferenceCount: 0, failures }, null, 2)}\n`);
process.stdout.write(`Catalog ready: ${publishedRecords.length} products across ${categoryCounts.length} categories; every entry uses its matching source primary image and ${publishedRecords.length - failedPreviewIds.size} include a high-resolution preview\n`);
if (failures.length > 0) process.stdout.write(`${failures.length} image conversion failures were recorded\n`);
