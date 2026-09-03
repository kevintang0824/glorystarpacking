"""Build local, indexable language editions from reviewed translation dictionaries.

Run with --extract to refresh source strings. Translation generation is separate;
the production build never calls a translation service or downloads a model.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit
from bs4 import BeautifulSoup, Comment, Doctype, NavigableString

ROOT = Path(__file__).resolve().parent.parent
ORIGIN = "https://glorystarpacking.com"
LANGUAGES = {"en": ("English", "🇺🇸"), "fr": ("Français", "🇫🇷"), "es": ("Español", "🇪🇸"), "pt": ("Português", "🇵🇹"), "ru": ("Русский", "🇷🇺"), "zh-CN": ("简体中文", "🇨🇳")}
ATTRIBUTES = ("alt", "title", "placeholder", "aria-label")
SCHEMA_TEXT = {"name", "description", "text", "headline", "caption", "articleBody", "knowsAbout"}
PAGES = sorted(p for p in ROOT.glob("*.html") if not re.search(r" \d+\.html$", p.name))
PAGE_NAMES = {p.name for p in PAGES}

def normalize(text):
    return re.sub(r"\s+", " ", str(text)).strip()

def prose(text):
    text = normalize(text)
    return bool(re.search(r"[A-Za-z]{2}", text)) and not re.search(r"https?://|www\.|@|^[\w./-]+\.(?:html|js|css|json|jpg|png|svg|webp)$", text) and not re.fullmatch(r"[A-Z\d–—_ /+×.,:;()%-]+", text)

def excluded(tag):
    return any(p.name in ("script", "style", "code", "pre", "textarea") or p.get("translate") == "no" or "logo" in p.get("class", []) or "form-trap" in p.get("class", []) for p in [tag, *tag.parents] if p.name)

def text_nodes(soup):
    for node in soup.find_all(string=True):
        if not isinstance(node, (Comment, Doctype)) and not excluded(node.parent) and prose(node):
            yield node

def schema_strings(value, key=""):
    if isinstance(value, dict):
        for k, v in value.items():
            yield from schema_strings(v, k)
    elif isinstance(value, list):
        for item in value:
            yield from schema_strings(item, key)
    elif isinstance(value, str) and key in SCHEMA_TEXT and prose(value):
        yield normalize(value)

def visible_strings(soup):
    yield from (normalize(node) for node in text_nodes(soup))
    for tag in soup.find_all(True):
        if excluded(tag):
            continue
        for attribute in ATTRIBUTES:
            if tag.get(attribute) and prose(tag[attribute]):
                yield normalize(tag[attribute])
    for tag in soup.select('meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[name="twitter:title"], meta[name="twitter:description"]'):
        if prose(tag.get("content", "")):
            yield normalize(tag["content"])
    for script in soup.select('script[type="application/ld+json"]'):
        yield from schema_strings(json.loads(script.string))

def runtime_strings():
    strings = set()
    source = ROOT / "tmp/i18n/runtime.json"
    if source.exists():
        for text in json.loads(source.read_text()):
            if "<" in text and ">" in text:
                strings.update(visible_strings(BeautifulSoup(text, "html.parser")))
            elif prose(text):
                strings.add(normalize(text))
    catalog = json.loads((ROOT / "assets/catalog/catalog.json").read_text())
    def collect(value, key=""):
        if isinstance(value, dict):
            for k, v in value.items(): collect(v, k)
        elif isinstance(value, list):
            for item in value: collect(item, key)
        elif isinstance(value, str) and key in {"title", "description", "category", "name", "imagePresentation"} and prose(value):
            strings.add(normalize(value))
    collect(catalog)
    # Catalog descriptions are composed from a title plus approved policy text.
    for key, text in catalog.get("copyPolicy", {}).items():
        strings.add(normalize(text.replace("{title}", "{{0}}")))
    strings.add("Select language")
    return strings

def extract():
    strings = set(runtime_strings())
    for page in PAGES:
        strings.update(visible_strings(BeautifulSoup(page.read_text(), "html.parser")))
    directory = ROOT / "translations"
    directory.mkdir(exist_ok=True)
    (directory / "en.json").write_text(json.dumps(sorted(strings), ensure_ascii=False, indent=2) + "\n")
    print(f"Extracted {len(strings)} strings from {len(PAGES)} pages and dynamic content.")

def route(file, language):
    suffix = "" if file == "index.html" else file
    return "/" + suffix if language == "en" else f"/{language}" + (f"/{suffix}" if suffix else "")

def localize_url(value, language):
    parsed = urlsplit(value)
    if parsed.netloc and parsed.netloc != "glorystarpacking.com":
        return value
    if parsed.scheme and parsed.scheme not in ("https", "http"):
        return value
    if not parsed.path:
        return value
    name = parsed.path.lstrip("/")
    if not name or name in PAGE_NAMES:
        target = route(name or "index.html", language)
    else:
        target = "/" + name
    return urlunsplit((parsed.scheme, parsed.netloc, target, parsed.query, parsed.fragment))

def picker(file, language):
    name, flag = LANGUAGES[language]
    links = "\n".join(f'<li><a href="{route(file, code)}" lang="{code}" hreflang="{code}" data-language="{code}"' + (' aria-current="true"' if code == language else '') + f'><span class="language-switcher__flag" aria-hidden="true">{item[1]}</span><span>{item[0]}</span></a></li>' for code, item in LANGUAGES.items())
    return f'''<details class="language-switcher" translate="no">
  <summary aria-label="Select language"><svg class="language-switcher__globe" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg><span>{name}</span></summary>
  <ul class="language-switcher__menu">{links}</ul>
</details>'''

def version(file):
    return hashlib.sha256((ROOT / file).read_bytes()).hexdigest()[:12]

def translate_page(page, language, dictionary):
    soup = BeautifulSoup(page.read_text(), "html.parser")
    def tr(value):
        key = normalize(value)
        if not key or not prose(key): return value
        translated = dictionary.get(key)
        if translated is None: raise ValueError(f"{language}: missing translation: {key[:100]}")
        # Preserve spacing at inline boundaries.
        return re.match(r"^\s*", value)[0] + translated + re.search(r"\s*$", value)[0]
    for node in list(text_nodes(soup)):
        node.replace_with(NavigableString(tr(str(node))))
    for tag in soup.find_all(True):
        if not excluded(tag):
            for attr in ATTRIBUTES:
                if tag.get(attr) and prose(tag[attr]): tag[attr] = tr(tag[attr])
        for attr in ("href", "src", "action", "poster"):
            if tag.get(attr): tag[attr] = localize_url(tag[attr], language)
        for attr in ("srcset", "imagesrcset"):
            if tag.get(attr):
                tag[attr] = re.sub(r"(?<![/\w])assets/", "/assets/", tag[attr])
    for tag in soup.select('meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[name="twitter:title"], meta[name="twitter:description"]'):
        tag["content"] = tr(tag["content"])
    for tag in soup.select('meta[property="og:url"]'):
        tag["content"] = ORIGIN + route(page.name, language)
    def translate_schema(value, key=""):
        if isinstance(value, dict): return {k: translate_schema(v, k) for k, v in value.items()}
        if isinstance(value, list): return [translate_schema(item, key) for item in value]
        if not isinstance(value, str): return value
        if key == "inLanguage": return language
        if key in SCHEMA_TEXT and prose(value): return tr(value)
        # Organization/website identities and shared images remain stable.
        if value.startswith(ORIGIN) and key in {"url", "@id"} and not value.endswith(("#organization", "#website")):
            return localize_url(value, language)
        return value
    for script in soup.select('script[type="application/ld+json"]'):
        script.string = json.dumps(translate_schema(json.loads(script.string)), ensure_ascii=False).replace("</", "<\\/")
    soup.html["lang"] = language
    headlines = json.loads((ROOT / "translations/pages.json").read_text())
    headline = headlines[page.name][headlines["_languages"].index(language)]
    soup.h1.clear()
    soup.h1.append(headline)
    title = headline.rstrip(".!?。？！") + " | GloryStarPack"
    soup.title.string = title
    for tag in soup.select('meta[property="og:title"], meta[name="twitter:title"]'):
        tag["content"] = title
    for script in soup.select('script[type="application/ld+json"]'):
        schema = json.loads(script.string)
        def update_headline(value):
            if isinstance(value, dict):
                if value.get("@type") in {"WebPage", "Article", "BlogPosting"}:
                    if "name" in value: value["name"] = title
                    if "headline" in value: value["headline"] = headline
                for item in value.values(): update_headline(item)
            elif isinstance(value, list):
                for item in value: update_headline(item)
        update_headline(schema)
        script.string = json.dumps(schema, ensure_ascii=False).replace("</", "<\\/")
    for existing in soup.select('.language-switcher, link[hreflang], script[data-language-dictionary]'):
        existing.decompose()
    soup.select_one(".site-nav").append(BeautifulSoup(picker(page.name, language), "html.parser"))
    soup.select_one('.language-switcher summary')["aria-label"] = dictionary["Select language"]
    for code in [*LANGUAGES, "x-default"]:
        link = soup.new_tag("link", rel="alternate", hreflang=code, href=ORIGIN + route(page.name, "en" if code == "x-default" else code))
        soup.head.append(link)
    for field in soup.select('input[name="sourcePage"]'):
        field["value"] = route(page.name, language)
    runtime_path = f"assets/i18n/{language}.js"
    script = soup.new_tag("script", src=f"/{runtime_path}?v={version(runtime_path)}", defer="", attrs={"data-language-dictionary": language})
    soup.select_one('script[src*="assets/languages.js"]').insert_before(script)
    return str(soup)

def build():
    runtime = runtime_strings()
    editorial = json.loads((ROOT / "translations/editorial.json").read_text())
    native_keys = ["Quote request received", "Quote request not sent", "Thank you. Your packaging brief has been delivered, and we will reply with the next technical questions.", "We could not deliver this form. Return to review the required fields, or send the brief directly by email or WhatsApp.", "GloryStarPack packaging project support", "Return to the quote form", "Email Kevin", "Continue by email", "Send by WhatsApp", "Direct channels may contain a shortened brief. Copy the full brief below to send every detail.", "Complete project brief"]
    native_copy = {}
    for language in LANGUAGES:
        if language == "en": continue
        dictionary = json.loads((ROOT / f"translations/{language}.json").read_text())
        language_index = editorial["_languages"].index(language)
        dictionary.update({key: value[language_index] for key, value in editorial.items() if not key.startswith("_")})
        native_copy[language] = {key: dictionary[key] for key in native_keys if key in dictionary}
        runtime_dict = {key: dictionary[key] for key in sorted(runtime) if key in dictionary}
        target = ROOT / "assets/i18n"
        target.mkdir(exist_ok=True)
        (target / f"{language}.js").write_text("window.GloryStarTranslations = " + json.dumps(runtime_dict, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/") + ";\n")
        (ROOT / language).mkdir(exist_ok=True)
        for page in PAGES:
            (ROOT / language / page.name).write_text(translate_page(page, language, dictionary))
        print(f"Built {language}: {len(PAGES)} pages; {len(runtime_dict)} dynamic translations.", flush=True)
    entries = [f"  <url><loc>{ORIGIN}{route(page.name, language)}</loc></url>" for language in LANGUAGES if language != "en" for page in PAGES if page.name != "404.html"]
    (ROOT / "sitemap-languages.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "\n".join(entries) + '\n</urlset>\n')
    (ROOT / "api/quote-locales.json").write_text(json.dumps(native_copy, ensure_ascii=False, indent=2) + "\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--extract", action="store_true")
    args = parser.parse_args()
    extract() if args.extract else build()
