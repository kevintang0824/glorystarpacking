import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { parseHTML } from "../tmp/i18n-tools/node_modules/linkedom/esm/index.js";

const routes = [
  { id: "perfume-insert-v1", source: "perfume-box-insert-checklist.html", target: "custom-perfume-boxes.html", field: "bottleLength", label: "Maximum bottle length (mm)", calculator: "perfume_bottle_insert_fit" },
  { id: "clear-label-trial-v1", source: "clear-label-white-ink-artwork-guide.html", target: "custom-clear-labels.html", field: "containerVariants", label: "Container / contents variants", calculator: "clear_label_applied_trial_matrix" },
];
const keyFor = (id) => `glorystarpack-guide-brief-${id}`;
function page(file, url, options = {}) {
  const { window: dom, document } = parseHTML(fs.readFileSync(file, "utf8"));
  const location = new URL(url, "https://glorystarpacking.com");
  const navigations = [];
  location.assign = (path) => navigations.push(new URL(path, location.href).href);
  document.cookie = "";
  document.referrer = "";
  const storage = options.storage || new Map();
  const sessionStorage = {
    getItem(key) { if (options.blockStorage) throw Error("Blocked"); return storage.get(key) ?? null; },
    setItem(key, value) { if (options.blockStorage) throw Error("Blocked"); storage.set(key, value); },
    removeItem(key) { if (options.blockStorage) throw Error("Blocked"); storage.delete(key); },
  };
  const copied = [];
  const navigator = options.noClipboard ? {} : { clipboard: { writeText: async (value) => copied.push(value) } };
  const window = {
    location, Node: dom.Node, CustomEvent: dom.CustomEvent, Event: dom.Event,
    addEventListener: dom.addEventListener.bind(dom), innerHeight: 800, scrollY: 0,
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    setTimeout: () => 1, clearTimeout() {}, requestAnimationFrame: (callback) => callback(),
  };
  for (const form of document.querySelectorAll("form")) form.reportValidity = () => true; // The module must also reject invalid stored values itself.
  for (const textarea of document.querySelectorAll("textarea")) textarea.select = () => { textarea.dataset.selected = "true"; };
  for (const [name, value] of Object.entries(options.prefill || {})) document.querySelector(`[name="${name}"]`).value = value;
  if (options.maxlength) document.querySelector('[name="details"]').setAttribute("maxlength", options.maxlength);
  class FormDataStub { constructor(form) { this.form = form; } get(name) { return this.form.querySelector(`[name="${name}"]`)?.value ?? null; } }
  class Observer { observe() {} unobserve() {} }
  const requests = [];
  const context = vm.createContext({
    window, document, location, sessionStorage, navigator, URL, URLSearchParams, Intl,
    CustomEvent: dom.CustomEvent, Node: dom.Node, FormData: FormDataStub, IntersectionObserver: Observer,
    AbortController, queueMicrotask, setTimeout: window.setTimeout, clearTimeout: window.clearTimeout,
    localStorage: { getItem: () => options.consent || "granted", setItem() {} },
    fetch: async (url) => { requests.push(url); assert.equal(url, "/api/health", "Never send a real inquiry"); return { ok: true, json: async () => ({ services: { quoteEmail: { configured: true } } }) }; },
  });
  const language = document.documentElement.lang;
  if (language !== "en") {
    vm.runInContext(fs.readFileSync(`assets/i18n/${language}.js`, "utf8"), context);
    window.GloryStarI18n = { translate: (text) => window.GloryStarTranslations[text] || text };
  }
  vm.runInContext(fs.readFileSync("assets/site.js", "utf8"), context);
  Object.defineProperty(document, "currentScript", { value: document.querySelector("script[data-measurement-id]") });
  vm.runInContext(fs.readFileSync("assets/analytics.js", "utf8"), context);
  vm.runInContext(fs.readFileSync("assets/guide-quote-brief.js", "utf8"), context);
  const click = (selector) => document.querySelector(selector).dispatchEvent(new dom.Event("click", { bubbles: true, cancelable: true }));
  const events = () => window.dataLayer.filter((args) => args[0] === "event" && args[1] === "quote_planner_handoff");
  return { window, document, storage, navigations, copied, requests, click, events };
}

for (const route of routes) {
  const key = keyFor(route.id);
  const targetUrl = `/${route.target}?planning=${route.id}#quote`;
  const attribution = JSON.stringify({ landingPage: `/${route.source}?utm_source=chatgpt`, discoveryChannel: "ai-search", discoverySource: "ChatGPT" });
  const storage = new Map([["glorystarpack-attribution", attribution]]);
  const source = page(route.source, `/${route.source}`, { storage });
  assert.equal(storage.has(key), false, "Loading a planner must not save example inputs");
  source.document.querySelector(`[name="${route.field}"]`).value = "87";
  assert.equal(storage.has(key), false, "Editing alone must not trigger a handoff");
  source.click("[data-guide-brief-send]");
  const saved = storage.get(key);
  assert.equal(JSON.parse(saved).values[route.field], 87, "Read current controls even without an input event");
  assert.deepEqual(source.navigations, [`https://glorystarpacking.com${targetUrl}`]);
  assert.equal(source.navigations[0].includes("87"), false, "No buyer inputs in URL");
  assert.equal(storage.get("glorystarpack-attribution"), attribution);
  const target = page(route.target, targetUrl, { storage });
  const details = target.document.querySelector('[name="details"]');
  assert.ok(details.value.includes(`${route.label}: 87`));
  assert.ok(details.value.includes(`https://glorystarpacking.com/${route.source}`));
  assert.ok(details.value.length < 3000);
  assert.equal(details.closest("details").open, true);
  assert.equal(target.document.querySelector('[name="quantity"]').value, "", "Trial counts must not become order quantities");
  assert.equal(target.document.querySelector('[name="dimensions"]').value, "", "Cavity dimensions must not become finished box dimensions");
  assert.equal(storage.has(key), false, "Consume a draft once");
  assert.equal(storage.get("glorystarpack-attribution"), attribution);
  assert.equal(target.events()[0][2].action, "imported");
  assert.equal(target.events()[0][2].calculator_name, route.calculator);
  assert.deepEqual(Object.keys(target.events()[0][2]).sort(), ["action", "calculator_name", "page_path", "send_to"]);
  assert.equal(target.window.dataLayer.some((args) => args[1] === "generate_lead"), false);

  const existing = page(route.target, targetUrl, { storage: new Map([[key, saved]]), prefill: { details: "Keep my project", quantity: "5000", dimensions: "80 × 70 × 40 mm" } });
  assert.equal(existing.document.querySelector('[name="details"]').value, "Keep my project");
  assert.equal(existing.document.querySelector('[name="quantity"]').value, "5000");
  assert.equal(existing.document.querySelector('[name="dimensions"]').value, "80 × 70 × 40 mm");
  existing.click("[data-guide-brief-copy]");
  await Promise.resolve();
  assert.ok(existing.copied[0].includes(`${route.label}: 87`));
  assert.equal(existing.events()[0][2].action, "kept_existing");
  const shortField = page(route.target, targetUrl, { storage: new Map([[key, saved]]), maxlength: "30" });
  assert.equal(shortField.document.querySelector('[name="details"]').value, "", "Do not truncate a planning boundary");

  const valid = JSON.parse(saved);
  for (const invalid of [
    null, "{", "x".repeat(5000),
    JSON.stringify({ ...valid, version: 2 }),
    JSON.stringify({ ...valid, createdAt: Date.now() - 31 * 60 * 1000 }),
    JSON.stringify({ ...valid, createdAt: Date.now() + 60000 }),
    JSON.stringify({ ...valid, targetPath: `/fr/${route.target}` }),
    JSON.stringify({ ...valid, values: { ...valid.values, [route.field]: -1 } }),
    JSON.stringify({ ...valid, values: { ...valid.values, [route.field]: "<script>" } }),
    JSON.stringify({ ...valid, values: { ...valid.values, [route.field]: null } }),
  ]) {
    const rejected = page(route.target, targetUrl, { storage: new Map([[key, invalid]]) });
    assert.equal(rejected.document.querySelector('[name="details"]').value, "");
    assert.match(rejected.document.querySelector('[data-guide-brief-status]').textContent, /unavailable or expired/);
  }
  const wrongTarget = page(route.target, `/${route.target}?planning=unknown`, { storage: new Map([[key, saved]]) });
  assert.equal(wrongTarget.document.querySelector('[data-guide-brief]').hidden, true);
  assert.equal(wrongTarget.storage.get(key), saved);
  const wrongSource = page(route.source, `/untrusted/${route.source}`);
  assert.equal(wrongSource.document.querySelector('[data-guide-brief-send]').hidden, true);

  for (const value of ["", "-1", "Infinity", "not-a-number", "10000001", ...(route.id === "clear-label-trial-v1" ? ["1.5"] : [])]) {
    const invalid = page(route.source, `/${route.source}`);
    invalid.document.querySelector(`[name="${route.field}"]`).value = value;
    invalid.click('[data-guide-brief-send]');
    assert.equal(invalid.navigations.length, 0);
    assert.equal(invalid.storage.has(key), false);
  }
  const fallback = page(route.source, `/${route.source}`, { blockStorage: true, noClipboard: true });
  fallback.click('[data-guide-brief-send]');
  assert.equal(fallback.navigations.length, 0);
  assert.equal(fallback.document.querySelector('[data-guide-brief-preview]').open, true);
  assert.match(fallback.document.querySelector('[data-guide-brief-status]').textContent, /Automatic transfer is unavailable/);
  fallback.click('[data-guide-brief-copy]');
  await Promise.resolve();
  assert.equal(fallback.document.querySelector('[data-guide-brief-text]').dataset.selected, "true");
  const copy = page(route.source, `/${route.source}`);
  copy.document.querySelector(`[name="${route.field}"]`).value = "99";
  copy.click('[data-guide-brief-copy]');
  await Promise.resolve();
  assert.ok(copy.copied[0].includes(`${route.label}: 99`), "Copy uses the latest inputs");
  const denied = page(route.source, `/${route.source}`, { consent: "denied" });
  denied.click('[data-guide-brief-send]');
  assert.equal(denied.events().length, 0);
  const count = source.events().length;
  for (const detail of [{ calculator: route.calculator, action: "buyer secret" }, { calculator: "buyer secret", action: "prepared" }]) {
    source.document.dispatchEvent(new source.window.CustomEvent("glorystarpack:guide-brief", { detail }));
  }
  assert.equal(source.events().length, count, "Analytics accepts only known values");

  for (const language of ["fr", "es", "pt", "ru", "zh-CN"]) {
    const localized = page(`${language}/${route.source}`, `/${language}/${route.source}`);
    localized.click('[data-guide-brief-send]');
    assert.deepEqual(localized.navigations, [`https://glorystarpacking.com/${language}/${route.target}?planning=${route.id}#quote`]);
    const translated = page(`${language}/${route.target}`, `/${language}/${route.target}?planning=${route.id}#quote`, { storage: localized.storage });
    const dictionary = JSON.parse(fs.readFileSync(`translations/${language}.json`, "utf8"));
    assert.ok(translated.document.querySelector('[name="details"]').value.includes(dictionary[route.label]));
    assert.equal(translated.document.querySelector('[data-guide-brief-status]').textContent, dictionary["Planning inputs added to your project details. Review them and add your order quantity before sending."]);
  }
  const html = fs.readFileSync(route.source, "utf8");
  const markup = parseHTML(html).document;
  assert.equal(markup.querySelector('[data-guide-brief-send]').hidden, true);
  assert.ok(markup.querySelector(`[data-guide-brief] a[href="${route.target}#quote"]`), "Ordinary quote link works without JavaScript");
  for (const file of [route.source, route.target]) {
    const body = fs.readFileSync(file, "utf8");
    assert.ok(body.indexOf('src="assets/analytics.js') < body.indexOf('src="assets/guide-quote-brief.js'), "Analytics listener loads before the import event");
  }
}
console.log("Guide quote briefs passed: both routes, current inputs, expiry, tamper checks, non-overwrite, bounded fields, locale paths/copy, attribution, consent-safe analytics and fallbacks. No inquiry was submitted.");
