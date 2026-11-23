#!/usr/bin/env node
// Static site validator. Exits non-zero on any error. Run: node scripts/validate-site.mjs
import { readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { ROOT, ORIGIN, UTILITY, walkHtml, read, meta, canonicalOf, isNoindex, cleanUrlPath, fileForUrlPath, resolveHref } from "./site-lib.mjs";

const errors = [], warnings = [];
const err = (p, m) => errors.push(`${p}: ${m}`);
const warn = (p, m) => warnings.push(`${p}: ${m}`);
const titles = new Map(), descs = new Map();
const sitemap = new Set([...read(join(ROOT, "sitemap.xml")).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
let pages = 0, ld = 0, links = 0, indexable = 0;

for (const f of walkHtml()) {
  const rel = relative(ROOT, f).split("\\").join("/");
  const html = read(f);
  pages++;
  const url = ORIGIN + cleanUrlPath(rel);
  const noindex = isNoindex(html);
  const utility = UTILITY.has(rel);
  const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1]?.trim() || "";
  const desc = meta(html, "description");
  const canon = canonicalOf(html);
  const h1s = (html.match(/<h1[\s>]/g) || []).length;

  if (!utility || rel === "404.html") {
    if (!title) err(rel, "missing <title>");
    if (title.length > 70 && !noindex) warn(rel, `title ${title.length} chars`);
  }
  if (!utility) {
    if (!desc) err(rel, "missing meta description");
    else if (desc.length > 165 && !noindex) warn(rel, `description ${desc.length} chars`);
    if (h1s !== 1) err(rel, `${h1s} <h1> elements`);
    if (canon !== url) err(rel, `canonical ${canon || "(none)"} != ${url}`);
    if (!/<meta[^>]+name=["']viewport["']/i.test(html)) err(rel, "missing viewport meta");
    if (!/<html[^>]+lang=/i.test(html)) err(rel, "missing html lang");
  }
  if (!noindex && !utility) {
    indexable++;
    if (!sitemap.has(url)) err(rel, "indexable page missing from sitemap.xml");
    if (titles.has(title)) err(rel, `duplicate title with ${titles.get(title)}`); else titles.set(title, rel);
    if (descs.has(desc)) err(rel, `duplicate description with ${descs.get(desc)}`); else descs.set(desc, rel);
  }
  if ((noindex || utility) && sitemap.has(url)) err(rel, "noindex/utility page listed in sitemap.xml");

  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    ld++;
    try { JSON.parse(m[1]); } catch (e) { err(rel, "invalid JSON-LD: " + e.message); }
    if (/aggregateRating|"Review"|ratingValue/.test(m[1])) err(rel, "review/rating markup is not allowed (no verified reviews)");
  }
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) if (!/\balt=/.test(m[0])) err(rel, "img without alt: " + m[0].slice(0, 80));
  for (const m of html.matchAll(/<(?:a|link)\b[^>]*\bhref=["']([^"']+)["']/gi)) {
    const h = m[1];
    if (/^(https?:|mailto:|tel:|#|javascript:|data:)/.test(h)) continue;
    links++;
    const path = resolveHref(rel, h.split("#")[0].split("?")[0] || ".");
    if (/\.html$/.test(path)) { err(rel, `link to redirecting .html URL: ${h}`); continue; }
    const hit = fileForUrlPath(path);
    if (!hit) err(rel, `broken link: ${h}`);
  }
  if (/\.html["']/.test(html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<!--[\s\S]*?-->/g, "")) && !/href="[^"]*\.html/.test(html)) { /* only non-link mentions */ }
}
for (const u of sitemap) {
  const path = u.replace(ORIGIN, "") || "/";
  if (!fileForUrlPath(path)) err("sitemap.xml", `URL has no file: ${u}`);
}
const robots = readFileSync(join(ROOT, "robots.txt"), "utf8");
if (!/Sitemap:\s*https:\/\/guruaitechnologies\.com\/sitemap\.xml/.test(robots)) err("robots.txt", "missing Sitemap line");

console.log(`pages=${pages} indexable=${indexable} sitemapUrls=${sitemap.size} jsonld=${ld} internalLinks=${links}`);
warnings.slice(0, 20).forEach((w) => console.log("WARN ", w));
errors.slice(0, 60).forEach((e) => console.log("ERROR", e));
console.log(`${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
