import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { parseHTML } from "../tmp/i18n-tools/node_modules/linkedom/esm/index.js";

for (const language of ["fr", "es", "pt", "ru", "zh-CN"]) {
  const { window, document } = parseHTML(fs.readFileSync(`${language}/products.html`, "utf8"));
  const storage = new Map();
  const location = new URL(`https://glorystarpacking.com/${language}/products.html?catalogCategory=paper-bags&catalogPage=2#quote`);
  const context = vm.createContext({ window, document, location, URL, Node: window.Node, MutationObserver: window.MutationObserver, localStorage: { setItem: (key, value) => storage.set(key, value), getItem: (key) => storage.get(key) }, queueMicrotask });
  vm.runInContext(fs.readFileSync(`assets/i18n/${language}.js`, "utf8"), context);
  vm.runInContext(fs.readFileSync("assets/languages.js", "utf8"), context);
  const { translate } = window.GloryStarI18n;
  assert.notEqual(translate("Continue by email"), "Continue by email");
  assert.equal(translate("GS-1234567"), "GS-1234567");
  assert.equal(translate("buyer@example.com"), "buyer@example.com");
  const label = document.createElement("p");
  label.textContent = "Continue by email";
  document.body.append(label);
  const input = document.querySelector('input[name="name"]');
  input.value = "My customer's original text";
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.notEqual(label.textContent, "Continue by email");
  assert.equal(input.value, "My customer's original text");
  const description = translate("Brown Paper Bag is a visual catalog reference. Size, material, printing, finish, packing method, and delivery are confirmed for each project.");
  assert.ok(!description.includes("{{"));
  assert.ok(!description.includes("is a visual catalog reference"));
  const english = document.querySelector('[data-language="en"]');
  assert.equal(new URL(english.href).pathname, "/products.html");
  assert.equal(new URL(english.href).search, location.search);
  assert.equal(new URL(english.href).hash, "#quote");
  english.dispatchEvent(new window.Event("click", { bubbles: true }));
  assert.equal(storage.get("glorystarpack-language"), "en");
}
console.log("Language runtime tests passed: local dictionaries, dynamic content, placeholders, query/hash preservation, language preference, and untouched form values.");
