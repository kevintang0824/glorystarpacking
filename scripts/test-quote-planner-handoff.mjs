import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { parseHTML } from "../tmp/i18n-tools/node_modules/linkedom/esm/index.js";

const key = "glorystarpack-paper-tube-brief-v1";
const sourceFile = "paper-tube-packaging-size-guide.html";
const targetFile = "custom-tube-packaging.html";
const marker = "?brief=paper-tube-v1#quote";
const script = fs.readFileSync("assets/site.js", "utf8");
const analytics = fs.readFileSync("assets/analytics.js", "utf8");
const baseValues = { productCrossSection: 68, productHeight: 145, radialAllowance: 2, bottomAllowance: 5, topAllowance: 5, proposedId: 74, proposedHeight: 158, wallThickness: 2 };
const draft = (overrides = {}) => ({ version: 1, createdAt: Date.now(), targetPath: `/${targetFile}`, values: { ...baseValues }, ...overrides });

function page(file, path, options = {}) {
  const { window: domWindow, document } = parseHTML(fs.readFileSync(file, "utf8"));
  const window = { Node: domWindow.Node, CustomEvent: domWindow.CustomEvent, Event: domWindow.Event, addEventListener: domWindow.addEventListener.bind(domWindow), innerHeight: 800, scrollY: 0 };
  document.documentElement.lang = options.language || "en";
  document.cookie = "";
  const location = new URL(path, "https://glorystarpacking.com");
  const navigations = [];
  location.assign = (url) => navigations.push(new URL(url, location.href).href);
  window.location = location;
  window.matchMedia = () => ({ matches: false, addEventListener() {} });
  window.setTimeout = () => 1;
  window.clearTimeout = () => {};
  window.requestAnimationFrame = (callback) => callback();
  const storage = options.storage || new Map();
  const sessionStorage = {
    getItem: (name) => { if (options.blockStorage) throw new Error("Storage denied"); return storage.get(name) ?? null; },
    setItem: (name, value) => { if (options.blockStorage) throw new Error("Storage denied"); storage.set(name, String(value)); },
    removeItem: (name) => { if (options.blockStorage) throw new Error("Storage denied"); storage.delete(name); },
  };
  const copied = [];
  const navigator = options.clipboard === false ? {} : { clipboard: { writeText: async (text) => copied.push(text) } };
  for (const textarea of document.querySelectorAll("textarea")) textarea.select = () => { textarea.dataset.selectedForCopy = "true"; };
  for (const form of document.querySelectorAll("form")) {
    form.reportValidity = () => Array.from(form.querySelectorAll('input[type="number"]')).every((field) => {
      if (!field.value.trim()) return !field.hasAttribute("required");
      const value = Number(field.value);
      return Number.isFinite(value) && (!field.hasAttribute("min") || value >= Number(field.getAttribute("min")));
    });
  }
  for (const [name, value] of Object.entries(options.prefill || {})) document.querySelector(`[name="${name}"]`).value = value;
  if (options.maximums) for (const [name, value] of Object.entries(options.maximums)) document.querySelector(`[name="${name}"]`).setAttribute("maxlength", value);
  class FormDataStub {
    constructor(form) { this.form = form; }
    get(name) { return this.form.querySelector(`[name="${name}"]`)?.value ?? null; }
  }
  class IntersectionObserverStub { observe() {} unobserve() {} }
  const handoffs = [];
  document.addEventListener("glorystarpack:planner-handoff", (event) => handoffs.push(event.detail));
  const requests = [];
  const localStorage = { getItem: () => options.consent || "granted", setItem() {} };
  const context = vm.createContext({
    window, document, location, navigator, URL, URLSearchParams, FormData: FormDataStub, Intl,
    sessionStorage, localStorage, Node: window.Node, CustomEvent: window.CustomEvent,
    IntersectionObserver: IntersectionObserverStub, AbortController, queueMicrotask,
    setTimeout: window.setTimeout, clearTimeout: window.clearTimeout,
    fetch: async (url) => { requests.push(url); assert.equal(url, "/api/health", "Tests must never submit an inquiry"); return { status: options.unconfigured ? 503 : 200, ok: !options.unconfigured, json: async () => ({ services: { quoteEmail: { configured: !options.unconfigured } } }) }; },
  });
  vm.runInContext(script, context);
  const loadAnalytics = () => {
    const loader = document.querySelector('script[data-measurement-id]');
    Object.defineProperty(document, "currentScript", { configurable: true, value: loader });
    vm.runInContext(analytics, context);
  };
  const click = (selector) => document.querySelector(selector).dispatchEvent(new window.Event("click", { bubbles: true, cancelable: true }));
  return { window, document, storage, copied, handoffs, requests, navigations, click, context, loadAnalytics };
}

// Delivery qualifiers are optional, uniquely labelled, and stay inside the optional panel.
for (const file of ["index.html", "products.html", "custom-clear-labels.html", "custom-tube-packaging.html"]) {
  const delivery = page(file, `/${file}`);
  for (const name of ["postalCode", "receivingType"]) {
    const fields = delivery.document.querySelectorAll(`[name="${name}"]`);
    assert.equal(fields.length, 1);
    assert.equal(fields[0].required || fields[0].hasAttribute("required"), false);
    assert.ok(fields[0].closest(".quote-form__optional"));
    assert.ok(delivery.document.querySelector(`label[for="${fields[0].id}"]`));
  }
  assert.equal(delivery.document.querySelector('[name="postalCode"]').getAttribute("maxlength"), "32");
  assert.equal(delivery.document.querySelectorAll('[name="receivingType"] option').length, 6);
  assert.equal(Boolean(delivery.document.querySelector(".quote-form__optional").open), false);
}

const deliveryFallback = page("index.html", "/", { unconfigured: true });
deliveryFallback.document.querySelector('[name="postalCode"]').value = "M5V 3L9";
deliveryFallback.document.querySelector('[name="receivingType"] option[value="Commercial warehouse"]').selected = true;
deliveryFallback.document.querySelector(".quote-form").dispatchEvent(new deliveryFallback.window.Event("submit", { cancelable: true }));
for (let step = 0; step < 12; step += 1) await Promise.resolve();
deliveryFallback.click(".form-fallback-actions button");
for (let step = 0; step < 4; step += 1) await Promise.resolve();
assert.match(deliveryFallback.copied[0], /Delivery ZIP \/ postal code: M5V 3L9/);
assert.match(deliveryFallback.copied[0], /Receiving location type: Commercial warehouse/);
assert.equal(deliveryFallback.requests.includes("/api/quote"), false, "Unconfigured delivery must keep the brief local");

// No automatic carryover from the example or a calculator edit.
const originalAttribution = JSON.stringify({ landingPage: `/${sourceFile}?utm_source=chatgpt`, discoveryChannel: "ai-search", discoverySource: "ChatGPT" });
const storage = new Map([["glorystarpack-attribution", originalAttribution]]);
const source = page(sourceFile, `/${sourceFile}`, { storage });
assert.equal(storage.has(key), false);
source.document.querySelector('[name="productCrossSection"]').value = "86";
source.click("[data-tube-quote-handoff]");
const saved = JSON.parse(storage.get(key));
assert.equal(saved.values.productCrossSection, 86, "Explicit carryover recomputes current fields without relying on an input event");
assert.deepEqual(Object.keys(saved).sort(), ["createdAt", "targetPath", "values", "version"]);
assert.deepEqual(Object.keys(saved.values).sort(), Object.keys(baseValues).sort());
assert.equal(source.document.querySelector('[data-tube-output="status"]').textContent, "Review shortfall");
assert.deepEqual(source.navigations, [`https://glorystarpacking.com/${targetFile}${marker}`]);
assert.equal(source.navigations[0].includes("86"), false, "Technical inputs must not enter URLs");
assert.equal(storage.get("glorystarpack-attribution"), originalAttribution);

const target = page(targetFile, `/${targetFile}${marker}`, { storage });
assert.match(target.document.querySelector('[name="dimensions"]').value, /cross-section 86 mm/);
assert.match(target.document.querySelector('[name="details"]').value, /REVIEW REQUIRED/);
assert.match(target.document.querySelector('[name="details"]').value, /ID margin: -16 mm/);
assert.equal(target.document.querySelector(".quote-form__optional").open, true);
assert.equal(target.document.querySelector("[data-tube-brief-status]").hidden, false);
assert.equal(storage.has(key), false, "A draft is consumed once");
assert.equal(storage.get("glorystarpack-attribution"), originalAttribution);
const replay = page(targetFile, `/${targetFile}${marker}`, { storage });
assert.equal(replay.document.querySelector('[name="dimensions"]').value, "");
assert.match(replay.document.querySelector("[data-tube-brief-status]").textContent, /unavailable or expired/);

// A marked target is required, and all stored values are validated and reconstructed.
for (const invalid of [
  "not json", JSON.stringify(draft({ padding: "x".repeat(4096) })), JSON.stringify(draft({ version: 2 })), JSON.stringify(draft({ createdAt: Date.now() - 31 * 60 * 1000 })),
  JSON.stringify(draft({ createdAt: Date.now() + 60000 })), JSON.stringify(draft({ targetPath: "https://evil.example/" })),
  JSON.stringify(draft({ targetPath: `/fr/${targetFile}` })), JSON.stringify(draft({ values: { ...baseValues, productHeight: "145" } })),
  JSON.stringify(draft({ values: { ...baseValues, radialAllowance: -1 } })),
  JSON.stringify(draft({ values: { ...baseValues, proposedId: 0 } })),
  JSON.stringify(draft({ values: { ...baseValues, productHeight: '<img id="injected">' } })),
]) {
  const bad = page(targetFile, `/${targetFile}${marker}`, { storage: new Map([[key, invalid]]) });
  assert.equal(bad.document.querySelector('[name="dimensions"]').value, "");
  assert.equal(bad.document.querySelector('[name="details"]').value, "");
  assert.equal(bad.storage.has(key), false);
}
for (const path of [`/${targetFile}`, `/${targetFile}?brief=wrong#quote`, `/custom-boxes.html${marker}`]) {
  const untouched = page(targetFile, path, { storage: new Map([[key, JSON.stringify(draft())]]) });
  assert.equal(untouched.document.querySelector('[name="dimensions"]').value, "");
  assert.equal(untouched.storage.has(key), true);
}
const injected = page(targetFile, `/${targetFile}${marker}`, { storage: new Map([[key, JSON.stringify(draft({ details: '<img id="injected">', dimensions: '<script>alert(1)</script>' }))]]) });
assert.equal(injected.document.querySelector("#injected"), null);
assert.equal(injected.document.querySelector('[name="details"]').value.includes("<img"), false);

// Existing form or catalogue content wins; imported values respect field limits.
const prefilled = page(targetFile, `/${targetFile}${marker}`, { storage: new Map([[key, JSON.stringify(draft())]]), prefill: { dimensions: "Customer dimensions", details: "Customer details" } });
assert.equal(prefilled.document.querySelector('[name="dimensions"]').value, "Customer dimensions");
assert.equal(prefilled.document.querySelector('[name="details"]').value, "Customer details");
assert.equal(prefilled.document.querySelector("[data-tube-quote]").dataset.quotePlannerHandoff, "kept_existing");
const catalog = page(targetFile, `/${targetFile}?brief=paper-tube-v1&catalog=GS-1234567#quote`, { storage: new Map([[key, JSON.stringify(draft())]]) });
assert.match(catalog.document.querySelector('[name="details"]').value, /^Catalog reference: GS-1234567/);
assert.match(catalog.document.querySelector('[name="dimensions"]').value, /Proposed tube ID/);
const limited = page(targetFile, `/${targetFile}${marker}`, { storage: new Map([[key, JSON.stringify(draft())]]), maximums: { dimensions: "20", details: "80" } });
assert.equal(limited.document.querySelector('[name="dimensions"]').value.length, 20);
assert.equal(limited.document.querySelector('[name="details"]').value.length, 80);

// Invalid current inputs cannot reuse a previously rendered valid result.
for (const [name, value] of [["productHeight", ""], ["productHeight", "NaN"], ["proposedId", "0"], ["wallThickness", "-1"], ["proposedHeight", "Infinity"]]) {
  const invalid = page(sourceFile, `/${sourceFile}`);
  invalid.document.querySelector(`[name="${name}"]`).value = value;
  invalid.click("[data-tube-quote-handoff]");
  assert.equal(invalid.storage.has(key), false);
  assert.equal(invalid.navigations.length, 0);
}

// Locale routes remain in the same supported language; no arbitrary target is used.
for (const language of ["fr", "es", "pt", "ru", "zh-CN"]) {
  const translated = page(sourceFile, `/${language}/${sourceFile}`, { language });
  translated.click("[data-tube-quote-handoff]");
  assert.deepEqual(translated.navigations, [`https://glorystarpacking.com/${language}/${targetFile}${marker}`]);
  const translatedTarget = page(targetFile, `/${language}/${targetFile}${marker}`, { language, storage: translated.storage });
  assert.match(translatedTarget.document.querySelector('[name="dimensions"]').value, /74 mm/);
}
const wrongSource = page(sourceFile, `/untrusted/${sourceFile}`);
wrongSource.click("[data-tube-quote-handoff]");
assert.equal(wrongSource.navigations.length, 0);

// Blocked storage offers a plain-text brief and an ordinary link, including clipboard denial.
const fallback = page(sourceFile, `/${sourceFile}`, { blockStorage: true, clipboard: false });
fallback.click("[data-tube-quote-handoff]");
assert.equal(fallback.navigations.length, 0);
assert.equal(fallback.document.querySelector("[data-tube-brief-panel]").hidden, false);
assert.match(fallback.document.querySelector("[data-tube-brief-text]").value, /Product loaded height: 145 mm/);
assert.ok(fallback.document.querySelector('[data-tube-brief-panel] a[href="custom-tube-packaging.html#quote"]'));
fallback.click("[data-tube-brief-copy]");
await Promise.resolve();
assert.equal(fallback.document.querySelector("[data-tube-brief-text]").dataset.selectedForCopy, "true");
const clipboard = page(sourceFile, `/${sourceFile}`, { blockStorage: true });
clipboard.click("[data-tube-quote-handoff]");
clipboard.click("[data-tube-brief-copy]");
await Promise.resolve();
assert.match(clipboard.copied[0], /Physical fit and production tolerances/);
clipboard.document.querySelector('[name="productHeight"]').value = "200";
clipboard.click("[data-tube-brief-copy]");
await Promise.resolve();
assert.match(clipboard.copied[1], /Product loaded height: 200 mm/);
assert.match(clipboard.copied[1], /REVIEW REQUIRED/, "Copy must also use current inputs rather than the earlier fallback");
clipboard.document.querySelector('[name="productHeight"]').dispatchEvent(new clipboard.window.Event("input", { bubbles: true }));
assert.equal(clipboard.document.querySelector("[data-tube-brief-panel]").hidden, true, "Editing the calculator hides the previous fallback brief");
assert.equal(clipboard.document.querySelector("[data-tube-brief-text]").value, "");
const fallbackMarkup = parseHTML(fs.readFileSync(sourceFile, "utf8")).document;
assert.equal(fallbackMarkup.querySelector("[data-tube-brief-panel]").children.length, 1, "Purchase-note layout needs one content wrapper");
assert.ok(fallbackMarkup.querySelector('.field > textarea[data-tube-brief-text]'));
assert.equal(fallbackMarkup.querySelector("[data-tube-quote-handoff]").hidden, true, "No-JavaScript mode keeps only the ordinary quote link");
assert.ok(fallbackMarkup.querySelector('a[href="custom-tube-packaging.html#quote"]'));
const blockedTarget = page(targetFile, `/${targetFile}${marker}`, { blockStorage: true });
assert.match(blockedTarget.document.querySelector("[data-tube-brief-status]").textContent, /unavailable or expired/);

// Handoff analytics includes only fixed action/type fields and honors consent.
target.loadAnalytics();
const importedEvent = target.window.dataLayer.find((args) => args[0] === "event" && args[1] === "quote_planner_handoff");
assert.ok(importedEvent);
assert.deepEqual(Object.keys(importedEvent[2]).sort(), ["action", "calculator_name", "page_path", "send_to"]);
assert.equal(importedEvent[2].action, "imported");
assert.equal(importedEvent[2].calculator_name, "paper_tube_size_and_fit");
const trackedSource = page(sourceFile, `/${sourceFile}`);
trackedSource.loadAnalytics();
trackedSource.click("[data-tube-quote-handoff]");
assert.equal(trackedSource.window.dataLayer.find((args) => args[1] === "quote_planner_handoff")[2].action, "prepared");
const before = trackedSource.window.dataLayer.length;
trackedSource.document.dispatchEvent(new trackedSource.window.CustomEvent("glorystarpack:planner-handoff", { detail: { action: "secret dimensions" } }));
assert.equal(trackedSource.window.dataLayer.length, before);
const denied = page(sourceFile, `/${sourceFile}`, { consent: "denied" });
denied.loadAnalytics();
denied.click("[data-tube-quote-handoff]");
assert.equal(denied.window.dataLayer.some((args) => args[1] === "quote_planner_handoff"), false);

console.log("Paper tube quote handoff tests passed: explicit current-value transfer, validation, one-use expiry, target isolation, non-overwrite, catalogue compatibility, maxlength, locale paths, storage/clipboard fallback, attribution, and consent-safe analytics. No inquiry was submitted.");
