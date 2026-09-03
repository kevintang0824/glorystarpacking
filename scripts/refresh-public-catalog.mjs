import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { catalogCopyFor, catalogCopyTemplates, toPublicCatalogProduct } from "./catalog-copy-policy.mjs";

const root = path.resolve(import.meta.dirname, "..");
const catalogPath = path.join(root, "assets", "catalog", "catalog.json");
const auditPath = path.join(root, "assets", "catalog", "clean-sources", "catalog-build-audit.json");
const catalogScriptPath = path.join(root, "assets", "catalog.js");
const catalog = JSON.parse(await fs.readFile(catalogPath, "utf8"));
if (!Array.isArray(catalog.products)) throw new Error("Catalog products are missing");

const originalBytes = Buffer.byteLength(JSON.stringify(catalog));
let sourceProducts = catalog.products;
try {
  const previousAudit = JSON.parse(await fs.readFile(auditPath, "utf8"));
  if (Array.isArray(previousAudit.products) && previousAudit.products.length === catalog.products.length) {
    sourceProducts = previousAudit.products;
  }
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const auditProducts = sourceProducts.map((product) => ({
  ...product,
  ...catalogCopyFor(product.title, product.category, product.claimReviewRequired),
}));
await fs.writeFile(auditPath, `${JSON.stringify({
  version: "private-catalog-build-audit-20260828",
  generatedAt: new Date().toISOString(),
  products: auditProducts,
}, null, 2)}\n`);

catalog.generatedAt = new Date().toISOString();
catalog.copyPolicy = catalogCopyTemplates;
catalog.products = auditProducts.map(toPublicCatalogProduct);
const publicJson = `${JSON.stringify(catalog)}\n`;
await fs.writeFile(catalogPath, publicJson);

const catalogVersion = createHash("sha256").update(publicJson).digest("hex").slice(0, 12);
const catalogScript = await fs.readFile(catalogScriptPath, "utf8");
const updatedCatalogScript = catalogScript.replace(
  /assets\/catalog\/catalog\.json\?v=[a-f0-9]{12}/,
  `assets/catalog/catalog.json?v=${catalogVersion}`,
);
if (updatedCatalogScript === catalogScript) throw new Error("Catalog JSON version reference was not updated");
await fs.writeFile(catalogScriptPath, updatedCatalogScript);

const claimReviewCount = catalog.products.filter((product) => product.claimReviewRequired === true).length;
const publicBytes = Buffer.byteLength(publicJson);
process.stdout.write(
  `Refreshed ${catalog.products.length} public products; ${claimReviewCount} require claim review. ` +
  `Catalog ${originalBytes} -> ${publicBytes} bytes; JSON version ${catalogVersion}.\n`,
);
