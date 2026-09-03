"""Validate the built language editions without a network or browser dependency."""
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import urlsplit
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
LANGUAGES = ["en", "fr", "es", "pt", "ru", "zh-CN"]
pages = [p for p in ROOT.glob("*.html") if not re.search(r" \d+\.html$", p.name)]
errors = []
count = 0
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
print(f"Validated {count} pages: language navigation, localized URLs, assets, metadata, form values and script versions.")
