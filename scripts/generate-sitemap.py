#!/usr/bin/env python3
"""Regenerate the sitemap from indexable HTML pages' canonical URLs."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
NAMESPACE = 'http://www.sitemaps.org/schemas/sitemap/0.9'


class Metadata(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonical = None
        self.noindex = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical = attrs.get('href')
        if tag == 'meta' and attrs.get('name', '').lower() == 'robots':
            self.noindex = 'noindex' in attrs.get('content', '').lower()


def main():
    urls = set()
    for page in sorted(ROOT.rglob('*.html')):
        if any(part.startswith('.') for part in page.relative_to(ROOT).parts):
            continue
        metadata = Metadata()
        metadata.feed(page.read_text(encoding='utf-8'))
        if metadata.noindex:
            continue
        if not metadata.canonical:
            raise ValueError(f'Missing canonical URL: {page.relative_to(ROOT)}')
        url = urlsplit(metadata.canonical)
        if url.scheme != 'https' or url.netloc != 'rentgen.io' or url.query or url.fragment:
            raise ValueError(f'Invalid canonical URL: {metadata.canonical}')
        target = ROOT / unquote(url.path).lstrip('/')
        if target.is_dir():
            target /= 'index.html'
        if target.resolve() != page.resolve():
            raise ValueError(f'Canonical does not point to its own page: {page.relative_to(ROOT)}')
        if metadata.canonical in urls:
            raise ValueError(f'Duplicate canonical URL: {metadata.canonical}')
        urls.add(metadata.canonical)

    ET.register_namespace('', NAMESPACE)
    sitemap = ET.Element(f'{{{NAMESPACE}}}urlset')
    for url in sorted(urls):
        entry = ET.SubElement(sitemap, f'{{{NAMESPACE}}}url')
        ET.SubElement(entry, f'{{{NAMESPACE}}}loc').text = url
    ET.indent(sitemap, space='  ')
    ET.ElementTree(sitemap).write(ROOT / 'sitemap.xml', encoding='utf-8', xml_declaration=True)
    print(f'Generated sitemap.xml with {len(urls)} canonical URLs.')


if __name__ == '__main__':
    main()
