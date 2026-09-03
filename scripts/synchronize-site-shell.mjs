import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const primaryTopline = "Factory-direct custom packaging · Technical project support";
const footerBrand = "Custom boxes, bags, inserts, and labels developed through one accountable sampling, production, and delivery workflow.";
const footerSignature = "Custom packaging · Boxes · Bags · Labels";
const footerHeadings = ["Products", "Explore", "Contact"];
const contentVersion = (relativePath) => crypto.createHash("sha256")
  .update(fs.readFileSync(path.join(root, relativePath)))
  .digest("hex")
  .slice(0, 12);
const assetVersions = {
  "assets/site.css": contentVersion("assets/site.css"),
  "assets/site.js": contentVersion("assets/site.js"),
  "assets/catalog.js": contentVersion("assets/catalog.js"),
  "assets/analytics.js": contentVersion("assets/analytics.js"),
  "assets/languages.css": contentVersion("assets/languages.css"),
  "assets/languages.js": contentVersion("assets/languages.js"),
};
const languages = [
  ["en", "English", "🇺🇸"], ["fr", "Français", "🇫🇷"],
  ["es", "Español", "🇪🇸"], ["pt", "Português", "🇵🇹"],
  ["ru", "Русский", "🇷🇺"], ["zh-CN", "简体中文", "🇨🇳"],
];
const languagePath = (file, code) => code === "en" ? (file === "index.html" ? "/" : `/${file}`) : `/${code}${file === "index.html" ? "" : `/${file}`}`;
const languagePicker = (file) => `<details class="language-switcher" translate="no">
          <summary aria-label="Select language"><svg class="language-switcher__globe" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg><span>English</span></summary>
          <ul class="language-switcher__menu">${languages.map(([code, name, flag]) => `<li><a href="${languagePath(file, code)}" lang="${code}" hreflang="${code}" data-language="${code}"${code === "en" ? ' aria-current="true"' : ""}><span class="language-switcher__flag" aria-hidden="true">${flag}</span><span>${name}</span></a></li>`).join("")}</ul>
        </details>`;
const floatingContact = `<nav class="floating-contact floating-contact--home" aria-label="Quick contact">
    <a href="mailto:kevin@GloryStarPack.com" aria-label="Email GloryStarPack">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5h18v13H3z"></path><path d="m4 7 8 6 8-6"></path></svg>
      <span class="floating-contact__tooltip" aria-hidden="true">Email</span>
    </a>
    <a href="https://wa.me/8619577608248" target="_blank" rel="noopener" aria-label="Message GloryStarPack on WhatsApp">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z"></path><path d="M8.2 7.3c.5 4.1 2.4 6 6.5 6.5"></path><path d="m8.2 7.3 1.7 2.1-1.4 1.3M14.7 13.8l-2.1-1.7 1.3-1.4"></path></svg>
      <span class="floating-contact__tooltip" aria-hidden="true">WhatsApp</span>
    </a>
    <a href="tel:+8619577608248" aria-label="Call GloryStarPack at +86 195 7760 8248">
      <span class="floating-contact__call-icon" aria-hidden="true">☎</span>
      <span class="floating-contact__tooltip" aria-hidden="true">Call</span>
    </a>
  </nav>`;

const pages = fs.readdirSync(root)
  .filter((file) => file.endsWith(".html") && !/ \d+\.html$/i.test(file))
  .sort();

let changed = 0;

for (const file of pages) {
  const filePath = path.join(root, file);
  const source = fs.readFileSync(filePath, "utf8");
  let html = source;

  html = html.replace(/\s*<details class="language-switcher"[\s\S]*?<\/details>/g, "");
  html = html.replace(/(<nav class="site-nav"[\s\S]*?)(\s*<\/nav>)/, `$1\n        ${languagePicker(file)}$2`);
  if (!/href="\/?assets\/languages\.css/.test(html)) {
    html = html.replace(/(<link rel="stylesheet" href="\/?assets\/site\.css[^>]+>)/, `$1\n  <link rel="stylesheet" href="/assets/languages.css?v=${assetVersions["assets/languages.css"]}">`);
  }
  if (!/src="\/?assets\/languages\.js/.test(html)) {
    html = html.replace(/(<script src="\/?assets\/site\.js[^>]+>)/, `<script src="/assets/languages.js?v=${assetVersions["assets/languages.js"]}" defer></script>\n  $1`);
  }
  html = html.replace(/\s*<link\b(?=[^>]*\bhreflang=)[^>]*>/g, "");
  const languageAlternates = [...languages.map(([code]) => [code, code]), ["x-default", "en"]]
    .map(([hreflang, code]) => `  <link rel="alternate" hreflang="${hreflang}" href="https://glorystarpacking.com${languagePath(file, code)}">`).join("\n");
  html = html.replace("</head>", `${languageAlternates}\n</head>`);

  for (const [asset, version] of Object.entries(assetVersions)) {
    html = html.replace(new RegExp(`${asset.replace(".", "\\.")}\\?v=[a-f0-9]{12}`, "g"), `${asset}?v=${version}`);
  }

  const mainContentPattern = /<main id="main-content"(?: tabindex="-1")?>/i;
  if (!mainContentPattern.test(html)) throw new Error(`${file}: shared main-content target is missing`);
  html = html.replace(mainContentPattern, '<main id="main-content" tabindex="-1">');

  const primaryNavigationPattern = /<nav class="site-nav" id="site-navigation" aria-label="Primary navigation">[\s\S]*?<\/nav>/i;
  const primaryNavigation = html.match(primaryNavigationPattern)?.[0] || "";
  if (!primaryNavigation) throw new Error(`${file}: primary navigation is missing`);
  const currentPath = file === "index.html" ? "/" : `/${file}`;
  let currentItemCount = 0;
  const normalizedNavigation = primaryNavigation.replace(/<a\b[^>]*\baria-current="(?:page|location)"[^>]*>/gi, (anchor) => {
    currentItemCount += 1;
    const href = anchor.match(/\bhref="([^"]+)"/i)?.[1];
    if (!href) throw new Error(`${file}: current navigation item is missing href`);
    const targetPath = new URL(href.replace(/&amp;/g, "&"), `https://glorystarpacking.com${currentPath}`).pathname;
    const token = targetPath === currentPath ? "page" : "location";
    return anchor.replace(/aria-current="(?:page|location)"/i, `aria-current="${token}"`);
  });
  if (currentItemCount > 1) throw new Error(`${file}: primary navigation has more than one current item`);
  html = html.replace(primaryNavigation, normalizedNavigation);

  const quoteForms = html.match(/<form class="quote-form"[^>]*>/gi) || [];
  if (quoteForms.length > 1) throw new Error(`${file}: expected at most one quote form`);
  if (quoteForms.length === 1) {
    const formTag = quoteForms[0];
    const formIndex = html.indexOf(formTag);
    const quoteSectionIndex = html.lastIndexOf("<section", formIndex);
    const quoteSectionMarkup = html.slice(quoteSectionIndex, formIndex);
    const sectionHeadings = [...quoteSectionMarkup.matchAll(/<h2\b[^>]*>/gi)];
    const heading = sectionHeadings.at(-1)?.[0];
    if (quoteSectionIndex < 0 || !heading) throw new Error(`${file}: quote form heading is missing`);
    const normalizedHeading = heading.includes('id="quote-section-title"')
      ? heading
      : heading.replace(/^<h2\b/i, '<h2 id="quote-section-title"');
    const headingIndex = html.lastIndexOf(heading, formIndex);
    html = `${html.slice(0, headingIndex)}${normalizedHeading}${html.slice(headingIndex + heading.length)}`;

    const normalizedFormTag = formTag
      .replace(/\saria-labelledby="[^"]*"/gi, "")
      .replace(/\saria-describedby="[^"]*"/gi, "")
      .replace('<form class="quote-form"', '<form class="quote-form" aria-labelledby="quote-section-title" aria-describedby="quote-form-status"');
    html = html.replace(formTag, normalizedFormTag);
    html = html.replace(
      /<p class="form-status"(?: id="[^"]*")? role="status" aria-live="polite"><\/p>/i,
      '<p class="form-status" id="quote-form-status" role="status" aria-live="polite"></p>'
    );
    html = html.replace(
      /<input\b([^>]*\bname="attachment"[^>]*)>\s*<small(?: id="[^"]*")?>/i,
      (match, attributes) => {
        const inputId = attributes.match(/\bid="([^"]+)"/i)?.[1];
        if (!inputId) throw new Error(`${file}: quote attachment input is missing id`);
        const normalizedAttributes = attributes.replace(/\saria-describedby="[^"]*"/gi, "");
        return `<input${normalizedAttributes} aria-describedby="${inputId}-help"><small id="${inputId}-help">`;
      }
    );
  }

  const toplinePattern = /(<div class="topline">\s*<div class="container topline__inner">\s*<span>)[\s\S]*?(<\/span>)/i;
  if (!toplinePattern.test(html)) throw new Error(`${file}: primary topline message is missing`);
  html = html.replace(toplinePattern, `$1${primaryTopline}$2`);

  const footerMatch = html.match(/<footer class="site-footer">[\s\S]*?<\/footer>/i);
  if (!footerMatch) throw new Error(`${file}: site footer is missing`);
  let footer = footerMatch[0];

  const footerBrandPattern = /(<div class="footer-brand">[\s\S]*?<p>)[\s\S]*?(<\/p>)/i;
  if (!footerBrandPattern.test(footer)) throw new Error(`${file}: footer brand statement is missing`);
  footer = footer.replace(footerBrandPattern, `$1${footerBrand}$2`);

  const footerSignaturePattern = /(<div class="footer-bottom">\s*<span>[\s\S]*?<\/span>\s*<span>)[\s\S]*?(<\/span>)/i;
  if (!footerSignaturePattern.test(footer)) throw new Error(`${file}: footer signature is missing`);
  footer = footer.replace(footerSignaturePattern, `$1${footerSignature}$2`);

  let headingIndex = 0;
  footer = footer.replace(/(<div class="footer-col">\s*<h2>)[\s\S]*?(<\/h2>)/gi, (match, before, after) => {
    const heading = footerHeadings[headingIndex++];
    if (!heading) throw new Error(`${file}: footer has more than three navigation columns`);
    return `${before}${heading}${after}`;
  });
  if (headingIndex !== footerHeadings.length) {
    throw new Error(`${file}: expected three footer navigation columns, found ${headingIndex}`);
  }

  html = html.replace(footerMatch[0], footer);

  const floatingContactPattern = /<(?:div|nav) class="floating-contact\b[^"]*"[^>]*>[\s\S]*?<\/(?:div|nav)>/i;
  if (floatingContactPattern.test(html)) {
    html = html.replace(floatingContactPattern, floatingContact);
  } else {
    html = html.replace(/\s*<footer class="site-footer">/i, `\n\n  ${floatingContact}\n\n  <footer class="site-footer">`);
  }
  if (html !== source) {
    fs.writeFileSync(filePath, html);
    changed += 1;
  }
}

console.log(`Synchronized the shared site shell across ${pages.length} published HTML files; ${changed} file(s) changed.`);
