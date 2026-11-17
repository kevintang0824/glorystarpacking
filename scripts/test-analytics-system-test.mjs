import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {parseHTML} from "../tmp/i18n-tools/node_modules/linkedom/esm/index.js";

const script = fs.readFileSync("assets/analytics.js", "utf8");
function visit(path, {storage = new Map(), consent = "granted", blockStorage = false} = {}) {
  const {document, window: dom} = parseHTML('<html><head><script data-measurement-id="G-TEST123"></script></head><body><form class="quote-form"><input name="email" value="buyer@example.test"><textarea name="details">Keep my project brief</textarea></form></body></html>');
  Object.defineProperty(document, "currentScript", {value: document.querySelector("script")});
  Object.defineProperty(document, "readyState", {value: "complete"});
  document.cookie = "";
  const location = new URL(path, "https://glorystarpacking.com");
  const preferences = new Map([["glorystarpack-analytics-consent", consent]]);
  const window = {location, addEventListener() {}};
  const context = vm.createContext({window, document, URL, URLSearchParams, Date,
    localStorage: {getItem: k => preferences.get(k), setItem: (k,v) => preferences.set(k,v)},
    sessionStorage: {getItem(k) {if (blockStorage) throw Error("Blocked"); return storage.get(k) ?? null;}, setItem(k,v) {if (blockStorage) throw Error("Blocked"); storage.set(k,v);}},
    CustomEvent: dom.CustomEvent,
  });
  vm.runInContext(script, context);
  const lead = () => document.dispatchEvent(new dom.CustomEvent("glorystarpack:lead", {detail: {product: "custom-boxes", email: "private@example.test", details: "Private buyer message"}}));
  const tags = () => [...document.querySelectorAll("script[src]")].map(x => x.src);
  const events = () => (window.dataLayer || []).filter(x => x[0] === "event");
  return {document, window, storage, preferences, lead, tags, events};
}

const regular = visit("/custom-boxes.html");
assert.equal(regular.tags().length, 2, "A consented regular visit loads Google and Vercel analytics");
regular.lead();
assert.equal(regular.events().filter(e => e[1] === "generate_lead").length, 1);
assert(!JSON.stringify(regular.events()).includes("private@example.test"));
assert(!JSON.stringify(regular.events()).includes("Private buyer message"));

const store = new Map([["buyer-draft", "preserve me"]]);
const qa = visit("/?utm_source=system_test&utm_medium=qa", {storage: store});
qa.lead();
assert.equal(qa.tags().length, 0, "QA does not load either analytics provider");
assert.equal(qa.events().length, 0, "QA cannot send a production lead event");
assert.equal(qa.document.documentElement.dataset.analyticsMode, "system-test");
assert.equal(qa.preferences.get("glorystarpack-analytics-consent"), "granted");
assert.equal(qa.document.querySelector('[name="email"]').value, "buyer@example.test");
assert.equal(qa.document.querySelector('[name="details"]').value, "Keep my project brief");
assert.equal(store.get("buyer-draft"), "preserve me");

const next = visit("/custom-mailer-boxes.html#quote", {storage: store});
next.lead();
assert.equal(next.tags().length, 0, "Following an internal link without UTM remains a QA journey");
assert.equal(next.events().length, 0);
assert.equal(visit("/custom-mailer-boxes.html").tags().length, 2, "A separate session remains measurable");
assert.equal(visit("/?utm_source=system_test", {blockStorage: true}).tags().length, 0);
assert.equal(visit("/", {blockStorage: true}).tags().length, 2);
const denied = visit("/", {consent: "denied"});
denied.lead();
assert.equal(denied.tags().length, 0);
assert.equal(denied.events().length, 0);
const undecided = visit("/", {consent: ""});
assert.equal(undecided.tags().length, 0);
assert(undecided.document.querySelector(".analytics-consent"));
undecided.document.querySelector("[data-analytics-allow]").dispatchEvent(new undecided.document.defaultView.Event("click", {bubbles: true}));
assert.equal(undecided.tags().length, 2, "A regular visitor can still grant analytics consent");
assert.equal(undecided.preferences.get("glorystarpack-analytics-consent"), "granted");
console.log("Analytics isolation passed: QA and same-tab journeys excluded from Google/Vercel; ordinary consent, blocked-storage fallback and private buyer data preserved. No network requests or real inquiries.");
