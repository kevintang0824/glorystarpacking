"""Validate the built language editions without a network or browser dependency."""
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import urlsplit
from bs4 import BeautifulSoup, Comment, NavigableString, Tag

ROOT = Path(__file__).resolve().parent.parent
LANGUAGES = ["en", "fr", "es", "pt", "ru", "zh-CN"]
pages = [p for p in ROOT.glob("*.html") if not re.search(r" \d+\.html$", p.name)]
page_names = {page.name for page in pages}
errors = []
count = 0

def route(file, language):
    suffix = "" if file == "index.html" else file
    return "/" + suffix if language == "en" else f"/{language}" + (f"/{suffix}" if suffix else "")

def localized_url(value, language):
    parsed = urlsplit(value)
    if parsed.netloc and parsed.netloc != "glorystarpacking.com": return value
    if parsed.scheme and parsed.scheme not in ("https", "http"): return value
    if not parsed.path: return value
    name = parsed.path.lstrip("/")
    if not name or name in page_names:
        target = route(name or "index.html", language)
    else:
        target = "/" + name
    suffix = ("?" + parsed.query if parsed.query else "") + ("#" + parsed.fragment if parsed.fragment else "")
    if parsed.scheme or parsed.netloc:
        return f"{parsed.scheme}://{parsed.netloc}{target}{suffix}"
    return target + suffix

def ignored_parity_node(tag):
    return (
        tag.name == "link" and tag.has_attr("hreflang")
        or tag.name == "script" and tag.has_attr("data-language-dictionary")
        or "language-switcher" in tag.get("class", [])
    )

def structural_signature(tag):
    children = []
    for child in tag.children:
        if isinstance(child, Tag):
            if ignored_parity_node(child): continue
            stable_attributes = []
            for name, value in child.attrs.items():
                if name in {"lang", "href", "src", "srcset", "imagesrcset", "action", "poster", "content", "value", "alt", "title", "placeholder", "aria-label"}:
                    continue
                stable_attributes.append((name, tuple(value) if isinstance(value, list) else value))
            children.append((child.name, tuple(sorted(stable_attributes)), structural_signature(child)))
        elif isinstance(child, NavigableString) and not isinstance(child, Comment) and str(child).strip():
            children.append("#text")
    return tuple(children)

def normalized_asset(value):
    parsed = urlsplit(value)
    if parsed.scheme or parsed.netloc: return value
    return parsed.path.lstrip("/") + ("?" + parsed.query if parsed.query else "")

def normalized_srcset(value):
    candidates = []
    for candidate in value.split(","):
        parts = candidate.strip().split()
        if parts:
            candidates.append(" ".join([normalized_asset(parts[0]), *parts[1:]]))
    return ", ".join(candidates)

def media_signature(soup):
    values = []
    for tag in soup.select("img, source, video"):
        values.append(tuple(
            (name, normalized_srcset(tag[name]) if name in {"srcset", "imagesrcset"} else normalized_asset(tag[name]))
            for name in ("src", "srcset", "imagesrcset", "poster") if tag.get(name)
        ))
    return values

expected_files = page_names
for language in LANGUAGES[1:]:
    actual_files = {file.name for file in (ROOT / language).glob("*.html")}
    if actual_files != expected_files:
        for missing in sorted(expected_files - actual_files): errors.append(f"{language}: missing page matching English: {missing}")
        for extra in sorted(actual_files - expected_files): errors.append(f"{language}: extra page without English source: {extra}")

for language in LANGUAGES:
    for page in pages:
        file = page if language == "en" else ROOT / language / page.name
        soup = BeautifulSoup(file.read_text(), "html.parser")
        expected = ("/" if page.name == "index.html" else "/" + page.name) if language == "en" else "/" + language + ("" if page.name == "index.html" else "/" + page.name)
        def check(condition, message):
            if not condition: errors.append(f"{file.relative_to(ROOT)}: {message}")
        check(soup.html.get("lang") == language, "incorrect document language")
        check(len(soup.select("h1")) == 1, "expected one headline")
        check(len(soup.select('.language-switcher a[data-language]')) == 6, "missing language choices")
        check(soup.select_one('.language-switcher a[aria-current="true"]').get("data-language") == language, "incorrect selected language")
        if page.name != "404.html":
            check(soup.select_one('link[rel="canonical"]')["href"] == "https://glorystarpacking.com" + expected, "incorrect canonical")
        alternates = {link["hreflang"]: link["href"] for link in soup.select('link[hreflang]')}
        check(set(alternates) == set([*LANGUAGES, "x-default"]), "incomplete hreflang set")
        for link in soup.select('a[href], script[src], link[href], img[src], source[src]'):
            value = link.get("href") or link.get("src")
            url = urlsplit(value)
            if url.scheme or url.netloc or not url.path: continue
            target = ROOT / url.path.lstrip("/") if url.path.startswith("/") else file.parent / url.path
            check(target.exists(), f"missing local resource: {value}")
        for script in soup.select('script[src*="?v="]'):
            parsed = urlsplit(script["src"])
            target = ROOT / parsed.path.lstrip("/") if parsed.path.startswith("/") else file.parent / parsed.path
            if target.exists():
                check(parsed.query == "v=" + hashlib.sha256(target.read_bytes()).hexdigest()[:12], f"stale script: {parsed.path}")
        original = BeautifulSoup(page.read_text(), "html.parser")
        if language != "en":
            check(structural_signature(original) == structural_signature(soup), "page structure differs from English")
            check(media_signature(original) == media_signature(soup), "image or media content differs from English")
            original_links = [tag["href"] for tag in original.select("a[href]:not(.language-switcher a)")]
            localized_links = [tag["href"] for tag in soup.select("a[href]:not(.language-switcher a)")]
            expected_links = [localized_url(value, language) for value in original_links]
            check(localized_links == expected_links, "page links differ from the localized English link set")
            original_forms = [(tag.name, tag.get("name"), tag.get("type"), tag.get("required") is not None) for tag in original.select("form input, form select, form textarea, form button")]
            localized_forms = [(tag.name, tag.get("name"), tag.get("type"), tag.get("required") is not None) for tag in soup.select("form input, form select, form textarea, form button")]
            check(original_forms == localized_forms, "form controls differ from English")
        original_values = [(tag.get("name"), tag.get("type"), tag.get("value")) for tag in original.select("input:not([name=sourcePage]), option")]
        localized_values = [(tag.get("name"), tag.get("type"), tag.get("value")) for tag in soup.select("input:not([name=sourcePage]), option")]
        check(original_values == localized_values, "form machine values changed")
        for form in soup.select("form.quote-form"):
            check(form["action"] == "/api/quote", "incorrect quote endpoint")
            check(form.select_one('[name="sourcePage"]')["value"] in {expected, expected + "/"}, "incorrect quote source")
        check(not re.search(r"translate_a/|cdn\.gtranslate|translate\.google", str(soup)), "external translation dependency")
        check(not re.search(r"\{\{\d+\}\}|▁", soup.get_text()), "unresolved content token")
        count += 1
if errors:
    print("\n".join(errors))
    raise SystemExit(f"Language validation failed: {len(errors)} issue(s)")
print(f"Validated {count} pages: every language matches the English page set, DOM structure, media, links, forms, assets, metadata and script versions.")
