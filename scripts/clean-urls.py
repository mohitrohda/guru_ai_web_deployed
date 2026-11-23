#!/usr/bin/env python3
"""Convert .html URLs to the clean URLs Cloudflare Pages actually serves with HTTP 200.
Cloudflare Pages answers /about.html with a 308 redirect to /about, and /services/index.html to /services/.
So canonicals, og:url, JSON-LD, the sitemap and internal links must use the clean form.
Usage: python3 -I scripts/clean-urls.py <project-root>"""
import os, re, sys
root = sys.argv[1]
ORIGIN = 'https://guruaitechnologies.com'

def clean_path(p):
    """p has no scheme/host/fragment. Returns the clean equivalent."""
    if p.endswith('index.html'):
        base = p[:-len('index.html')]
        return base if base not in ('',) else './'
    if p.endswith('.html'):
        return p[:-5]
    return p

def clean_href(h):
    if re.match(r'^(https?:|mailto:|tel:|#|javascript:|data:)', h): return h
    m = re.match(r'^([^#?]*)([?#].*)?$', h)
    path, tail = m.group(1), m.group(2) or ''
    if not path.endswith('.html'): return h
    new = clean_path(path)
    if new == './' and tail.startswith('#'): return './' + tail
    return new + tail

def fix_text(s):
    s = re.sub(r'(href=")([^"]+)(")', lambda m: m.group(1) + clean_href(m.group(2)) + m.group(3), s)
    s = re.sub(r"(href=')([^']+)(')", lambda m: m.group(1) + clean_href(m.group(2)) + m.group(3), s)
    # absolute site URLs anywhere (canonical, og:url, JSON-LD, text)
    def absu(m):
        rest = m.group(1)
        new = clean_path(rest)
        return ORIGIN + '/' + (new if new != './' else '')
    s = re.sub(re.escape(ORIGIN) + r'/([\w\-./]*\.html)\b', absu, s)
    return s

n = 0
for dp, _, fs in os.walk(root):
    if any(x in dp for x in ('node_modules', '.git', '.wrangler', '/docs', '/tests')): continue
    for f in fs:
        p = os.path.join(dp, f)
        if f.endswith('.html') or f.endswith('.xml'):
            s = open(p, encoding='utf-8').read(); t = fix_text(s)
            if t != s: open(p, 'w', encoding='utf-8').write(t); n += 1
print('files changed', n)
