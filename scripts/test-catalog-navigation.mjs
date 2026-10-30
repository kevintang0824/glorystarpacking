import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { parseHTML } from "../tmp/i18n-tools/node_modules/linkedom/esm/index.js";

for (const mode of ["offscreen", "visible", "initial", "interacted"]) {
  const fragmentVisible = mode === "visible";
  const { document, window: domWindow } = parseHTML(`<html><body>
    <section data-authorized-catalog>
      <ul data-catalog-library-categories></ul>
      <div data-catalog-library-grid></div>
      <h2 data-catalog-library-title></h2>
      <div data-catalog-library-results></div>
      <p data-catalog-library-status></p>
    </section>
    <section id="quote"></section>
  </body></html>`);
  const listeners = new Map();
  const scrolls = [];
  domWindow.HTMLElement.prototype.scrollIntoView = function () { scrolls.push(this); };
  domWindow.HTMLElement.prototype.focus = () => {};
  document.getElementById("quote").getBoundingClientRect = () => ({ top: fragmentVisible ? 100 : 2000 });
  const window = {
    location: new URL(`https://glorystarpacking.com/products.html#${["initial", "interacted"].includes(mode) ? "quote" : "packaging-set-brief"}`),
    addEventListener: (name, callback) => listeners.set(name, callback),
    requestAnimationFrame: (callback) => callback(),
    matchMedia: () => ({ matches: false }),
    IntersectionObserver: class { observe() {} disconnect() {} },
    innerHeight: 800,
  };
  window.history = {
    pushState: (_state, _title, url) => { window.location = new URL(url); },
    replaceState: (_state, _title, url) => { window.location = new URL(url); },
  };
  let resolveCatalog;
  let fetchCount = 0;
  const response = new Promise((resolve) => { resolveCatalog = resolve; });
  vm.runInNewContext(fs.readFileSync("assets/catalog.js", "utf8"), {
    document, window, URL, console,
    IntersectionObserver: window.IntersectionObserver,
    fetch: () => { fetchCount += 1; return response; },
  });

  // A native fragment history event must not start the catalog or move the page.
  window.location.hash = "quote";
  listeners.get("popstate")();
  assert.equal(fetchCount, 0);
  if (mode === "interacted") listeners.get("wheel")();
  const root = document.querySelector("[data-authorized-catalog]");
  root.dispatchEvent(new domWindow.Event("focusin"));
  assert.equal(fetchCount, 1);
  resolveCatalog({ ok: true, json: async () => ({ products: [], categories: [], total: 0 }) });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(root.hasAttribute("aria-busy"), false);
  const shouldPreserve = fragmentVisible || mode === "initial";
  assert.equal(scrolls.length, shouldPreserve ? 1 : 0, "Preserve a visible or untouched initial fragment without overriding user scrolling");
  if (shouldPreserve) assert.equal(scrolls[0], document.getElementById("quote"));
  scrolls.length = 0;

  window.location.hash = "packaging-set-brief";
  listeners.get("popstate")();
  assert.equal(scrolls.length, 0, "A hash-only history event must preserve native scrolling");

  window.location.search = "?catalogSort=az";
  listeners.get("popstate")();
  assert.equal(scrolls.length, 1, "Catalog history changes still scroll to results");
  assert.equal(scrolls[0], document.querySelector("[data-catalog-library-results]"));

  scrolls.length = 0;
  document.querySelector("[data-catalog-library-category]").click();
  assert.ok(scrolls.includes(document.querySelector("[data-catalog-library-results]")), "Category selection still reveals results");
}
console.log("PASS catalog navigation: fragment history, late loading, catalog history, category selection");
