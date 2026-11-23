#!/usr/bin/env python3
"""One-off 'distill' pass used for the v2 transformation (kept for the audit trail).
Removes generic AI-template patterns from every page, preserving all other markup byte-for-byte:
  - uppercase eyebrow / kicker paragraphs that sit above headings
  - decorative numeric section/card labels ("01 / 12", "01", "02"...) on cards and industry tiles
Real step sequences (.process-step__num, .nx-step-num) are intentionally kept.
Usage: python3 -I scripts/distill-ui.py <project-root> [--dry-run]"""
import os, re, sys
root = sys.argv[1]; dry = '--dry-run' in sys.argv
EYEBROW = re.compile(r'[ \t]*<(p|span|div|small)\s+class="(?:[\w-]*\s)*(?:eyebrow|[a-z]{1,3}-kicker|[a-z-]*__eyebrow|[a-z]{1,3}-eyebrow|home-contact-kicker|[a-z-]*-preview-eyebrow)(?:\s[\w-]+)*"[^>]*>[^<]{0,160}</\1>[ \t]*\n?', re.I)
NUMBER = re.compile(r'[ \t]*<(span|p|div|b|strong|small)\s+class="[^"]*(?:-feature-number|-card-number|-index|-pathway-number|home-service-card__number|-num(?:ber)?)\b[^"]*"[^>]*>\s*\d{1,2}(?:\s*/\s*\d{1,2})?\s*</\1>[ \t]*\n?', re.I)
KEEP_NUM = ('process-step__num', 'nx-step-num')
EMPTY_TOP = re.compile(r'[ \t]*<div class="[\w-]*(?:card-top|card__top)">\s*</div>[ \t]*\n?')
stats = {'eyebrow': 0, 'number': 0, 'empty': 0, 'files': 0}
def number_sub(m):
    return m.group(0) if any(k in m.group(0) for k in KEEP_NUM) else ''
for dp, _, fs in os.walk(root):
    if any(x in dp for x in ('node_modules', '/docs', '/tests', '/knowledge', '/functions', '/scripts', '.git')): continue
    for f in fs:
        if not f.endswith('.html'): continue
        p = os.path.join(dp, f); s = open(p, encoding='utf-8').read(); o = s
        s, a = EYEBROW.subn('', s)
        n_before = len(NUMBER.findall(s))
        s = NUMBER.sub(number_sub, s)
        s, c = EMPTY_TOP.subn('', s)
        stats['eyebrow'] += a; stats['number'] += n_before; stats['empty'] += c
        if s != o:
            stats['files'] += 1
            if not dry: open(p, 'w', encoding='utf-8').write(s)
print(stats)
