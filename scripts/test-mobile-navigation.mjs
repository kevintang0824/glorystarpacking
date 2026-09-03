import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { parseHTML } from "../tmp/i18n-tools/node_modules/linkedom/esm/index.js";

const { window, document } = parseHTML(`<!doctype html><html><body>
  <header class="site-header">
    <a class="logo" href="/">Home</a>
    <button class="nav-toggle" aria-expanded="false">Menu</button>
    <nav class="site-nav"><a href="/products.html">Products</a></nav>
  </header>
  <main id="main-content" tabindex="-1"></main>
</body></html>`);

const timers = [];
window.location = new URL("https://glorystarpacking.com/zh-CN");
window.matchMedia = () => ({ matches: true, addEventListener() {} });
window.setTimeout = (callback) => { timers.push(callback); return timers.length; };
window.requestAnimationFrame = (callback) => callback();
window.innerHeight = 800;

class IntersectionObserverStub {
  observe() {}
  unobserve() {}
}

const context = vm.createContext({
  window,
  document,
  navigator: window.navigator,
  location: window.location,
  history: window.history,
  URL,
  URLSearchParams,
  FormData: window.FormData,
  Intl,
  Node: window.Node,
  CustomEvent: window.CustomEvent,
  IntersectionObserver: IntersectionObserverStub,
  AbortController,
  fetch: async () => ({ status: 503, ok: false, json: async () => ({ services: { quoteEmail: { configured: false } } }) }),
  queueMicrotask,
  setTimeout: window.setTimeout,
  clearTimeout() {},
});

vm.runInContext(fs.readFileSync("assets/site.js", "utf8"), context);

const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
const link = nav.querySelector("a");
toggle.dispatchEvent(new window.Event("click", { bubbles: true }));
assert.equal(nav.hasAttribute("inert"), false, "open mobile navigation must be interactive");

link.dispatchEvent(new window.Event("click", { bubbles: true, cancelable: true }));
assert.equal(nav.hasAttribute("inert"), false, "link must remain interactive until its default navigation runs");
assert.ok(timers.length, "closing the mobile navigation should be deferred");
timers.splice(0).forEach((callback) => callback());
assert.equal(nav.hasAttribute("inert"), true, "mobile navigation should close after navigation begins");

console.log("Mobile navigation test passed: links remain active through their default navigation, then the menu closes.");
