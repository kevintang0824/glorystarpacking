(() => {
  const codes = ["en", "fr", "es", "pt", "ru", "zh-CN"];
  const language = document.documentElement.lang || "en";
  const storageKey = "glorystarpack-language";
  const dictionary = window.GloryStarTranslations || {};
  const normalize = (value) => String(value).replace(/\s+/g, " ").trim();
  const escapePattern = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = Object.entries(dictionary).filter(([key]) => /\{\{\d+\}\}/.test(key)).map(([key, value]) => {
    const indices = [...key.matchAll(/\{\{(\d+)\}\}/g)].map((match) => match[1]);
    return { pattern: new RegExp("^" + key.split(/\{\{\d+\}\}/).map(escapePattern).join("([\\s\\S]*?)") + "$"), indices, value };
  });
  const translate = (value, depth = 0) => {
    const text = normalize(value);
    if (language === "en" || !text) return value;
    if (/^(?:GS-\d+|[\w.+-]+@[\w.-]+|https?:\/\/|mailto:|tel:|#|\.|\/)/i.test(text)) return value;
    let result = dictionary[text];
    if (result === undefined && depth < 2) {
      for (const entry of patterns) {
        const match = entry.pattern.exec(text);
        if (!match) continue;
        const parameters = Object.fromEntries(entry.indices.map((id, index) => [id, translate(match[index + 1], depth + 1)]));
        result = entry.value.replace(/\{\{(\d+)\}\}/g, (_, id) => parameters[id] ?? "");
        break;
      }
    }
    if (result === undefined) return value;
    return String(value).match(/^\s*/)[0] + result + String(value).match(/\s*$/)[0];
  };
  window.GloryStarI18n = { language, translate };

  const pickers = [...document.querySelectorAll(".language-switcher")];
  function syncLanguageLinks() {
    document.querySelectorAll("a[data-language]").forEach((link) => {
      const url = new URL(link.href, location.href);
      url.search = location.search;
      url.hash = location.hash;
      link.href = url.href;
    });
  }
  syncLanguageLinks();
  pickers.forEach((picker) => {
    picker.addEventListener("toggle", () => { if (picker.open) syncLanguageLinks(); });
    picker.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && picker.open) {
        event.preventDefault();
        event.stopPropagation();
        picker.open = false;
        picker.querySelector("summary")?.focus();
      }
      if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        picker.open = true;
        const options = [...picker.querySelectorAll("a[data-language]")];
        const current = options.indexOf(document.activeElement);
        const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (current + (event.key === "ArrowUp" ? -1 : 1) + options.length) % options.length;
        options[next]?.focus();
      }
    });
    picker.addEventListener("focusout", () => {
      queueMicrotask(() => { if (!picker.contains(document.activeElement)) picker.open = false; });
    });
  });
  document.addEventListener("click", (event) => {
    pickers.forEach((picker) => { if (!picker.contains(event.target)) picker.open = false; });
    const link = event.target.closest("a[data-language]");
    if (!link || !codes.includes(link.dataset.language)) return;
    try { localStorage.setItem(storageKey, link.dataset.language); } catch { /* Navigation works without storage. */ }
  });
  // Explicit language URLs always win. Remember the selection for home visits.
  if (location.pathname === "/" || location.pathname === "/index.html") {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved && saved !== "en" && codes.includes(saved)) {
        location.replace(`/${saved}${location.search}${location.hash}`);
        return;
      }
    } catch { /* Storage is optional. */ }
  }

  if (language === "en") return;
  const excluded = "script, style, code, pre, textarea, input, [translate='no'], .logo, .form-trap";
  const translatedValues = new WeakMap();
  const translateNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (!node.parentElement || node.parentElement.closest(excluded)) return;
      if (translatedValues.get(node) === node.nodeValue) return;
      const translated = translate(node.nodeValue);
      if (translated !== node.nodeValue) {
        translatedValues.set(node, translated);
        node.nodeValue = translated;
      }
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE || node.closest(excluded)) return;
    for (const attribute of ["aria-label", "title", "alt", "placeholder"]) {
      const value = node.getAttribute(attribute);
      if (value) {
        const translated = translate(value);
        if (translated !== value) node.setAttribute(attribute, translated);
      }
    }
    [...node.childNodes].forEach(translateNode);
  };
  translateNode(document.body);
  // Translate only newly rendered UI, never form values, customer artwork or IDs.
  new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "childList") record.addedNodes.forEach(translateNode);
      else translateNode(record.target);
    }
  }).observe(document.body, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ["aria-label", "title", "alt", "placeholder"] });
})();
