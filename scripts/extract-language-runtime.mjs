import fs from "node:fs";
import { parse } from "../tmp/i18n-tools/node_modules/acorn/dist/acorn.mjs";

// Development helper: collect prose, including variable-bearing UI messages.
const strings = new Set();
function visit(node) {
  if (!node || typeof node !== "object") return;
  if (node.type === "Literal" && typeof node.value === "string") strings.add(node.value);
  if (node.type === "TemplateLiteral") {
    strings.add(node.quasis.map((part, i) => (part.value.cooked || "") + (i < node.expressions.length ? `{{${i}}}` : "")).join(""));
  }
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === "object") visit(value);
  }
}
for (const file of ["assets/site.js", "assets/catalog.js", "assets/analytics.js", "api/quote.js"]) {
  visit(parse(fs.readFileSync(file, "utf8"), { ecmaVersion: "latest", sourceType: "script" }));
}
fs.mkdirSync("tmp/i18n", { recursive: true });
fs.writeFileSync("tmp/i18n/runtime.json", JSON.stringify([...strings], null, 2));
console.log(`Collected ${strings.size} runtime strings.`);
