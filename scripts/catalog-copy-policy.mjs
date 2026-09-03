const unverifiedClaimSource = String.raw`\b(?:FSC(?:®)?(?:[\s-]+(?:certified|certificate))?|PEFC(?:[\s-]+certified)?|eco[\s-]?(?:friendly|reusable)|environmentally[\s-]?friendly|recyclable|recycled|sustainable|organic|bio[\s-]?degradable|compostable|plastic[\s-]?free|food[\s-]?(?:grade|safe)|water[\s-]?(?:proof|resistant)|grease[\s-]?proof|oil[\s-]?proof|leak[\s-]?proof|moisture[\s-]?proof|anti[\s-]?fog|microwave[\s-]?safe|freezer[\s-]?safe|FDA[\s-]?(?:approved|compliant)|medical[\s-]?grade|pharmaceutical[\s-]?grade|sterile|child[\s-]?resistant)\b`;
const marketingPrefix = /^(?:202[4-9]\s+)?(?:(?:new|hot sale|hot selling|best selling|high quality|high-end|high end|luxury|premium|wholesale|wholesales|manufacturer|factory direct|cheap|low price|customized|custom|oem|odm)\s+)+/i;

export const hasUnverifiedCatalogClaim = (value) => (
  new RegExp(unverifiedClaimSource, "iu").test(String(value || ""))
);

export const neutralizeCatalogTitle = (value) => {
  const title = String(value || "Custom packaging reference")
    .replace(/\s+/g, " ")
    .replace(marketingPrefix, "")
    .replace(new RegExp(unverifiedClaimSource, "giu"), " ")
    .replace(/\b100\s*%/giu, " ")
    .replace(/\(\s*\)|\[\s*\]/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/(?:\s*[-–—|/]\s*){2,}/g, " — ")
    .replace(/^[\s,.;:|/–—-]+|[\s,.;:|/–—-]+$/g, "")
    .replace(/^(?:and|or|with|for|of)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim() || "Custom packaging reference";
  return title.length > 112 ? `${title.slice(0, 109).trim()}…` : title;
};

export const catalogCopyTemplates = Object.freeze({
  base: "{title} is a visual catalog reference. Size, material, printing, finish, packing method, and delivery are confirmed for each project.",
  claimReview: " Certification, sustainability, food-contact, and performance requirements need project-specific documentation and approval.",
  food: " Food-contact, barrier, temperature, and destination requirements need an application-specific review.",
  healthcare: " This secondary-packaging reference does not establish medical, sterile, pharmaceutical, or child-resistant compliance.",
});

export const catalogDescriptionFor = (title, category, claimReviewRequired = false) => {
  const base = catalogCopyTemplates.base.replace("{title}", title);
  if (claimReviewRequired) {
    return `${base}${catalogCopyTemplates.claimReview}`;
  }
  if (category === "Food packaging" || category === "Sushi packaging") {
    return `${base}${catalogCopyTemplates.food}`;
  }
  if (category === "Healthcare packaging") {
    return `${base}${catalogCopyTemplates.healthcare}`;
  }
  return base;
};

export const catalogCopyFor = (sourceTitle, category, inheritedClaimReview = false) => {
  const claimReviewRequired = Boolean(inheritedClaimReview || hasUnverifiedCatalogClaim(sourceTitle));
  const title = neutralizeCatalogTitle(sourceTitle);
  return {
    title,
    description: catalogDescriptionFor(title, category, claimReviewRequired),
    claimReviewRequired,
  };
};

export const publicCatalogProductKeys = Object.freeze([
  "id",
  "title",
  "category",
  "categorySlug",
  "claimReviewRequired",
  "image",
  "previewImage",
  "previewWidth",
  "previewHeight",
  "imagePresentation",
]);

export const toPublicCatalogProduct = (record) => {
  const copy = catalogCopyFor(record.title, record.category, record.claimReviewRequired);
  return {
    id: String(record.id),
    title: copy.title,
    category: record.category,
    categorySlug: record.categorySlug,
    ...(copy.claimReviewRequired ? { claimReviewRequired: true } : {}),
    image: record.image,
    previewImage: record.previewImage,
    previewWidth: Number(record.previewWidth),
    previewHeight: Number(record.previewHeight),
    imagePresentation: record.imagePresentation,
  };
};
