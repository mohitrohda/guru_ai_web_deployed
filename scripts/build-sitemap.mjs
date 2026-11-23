#!/usr/bin/env node
// Generates sitemap.xml. A page is listed only if: it is not a utility page, it is not noindex,
// and its canonical URL is its own clean (HTTP 200) URL. Run: node scripts/build-sitemap.mjs
import { writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { ROOT, ORIGIN, UTILITY, walkHtml, read, canonicalOf, isNoindex, cleanUrlPath } from "./site-lib.mjs";

const lastmod = process.env.SITEMAP_DATE || new Date().toISOString().slice(0, 10);
const urls = [];
const skipped = [];
for (const f of walkHtml()) {
  const rel = relative(ROOT, f).split("\\").join("/");
  const html = read(f);
  const url = ORIGIN + cleanUrlPath(rel);
  if (UTILITY.has(rel)) { skipped.push([rel, "utility"]); continue; }
  if (isNoindex(html)) { skipped.push([rel, "noindex"]); continue; }
  if (canonicalOf(html) !== url) { skipped.push([rel, `canonical mismatch (${canonicalOf(html)})`]); continue; }
  urls.push(url);
}
urls.sort((a, b) => (a === ORIGIN + "/" ? -1 : b === ORIGIN + "/" ? 1 : a.localeCompare(b)));
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${u}</loc><lastmod>${lastmod}</lastmod></url>`).join("\n") + "\n</urlset>\n";
writeFileSync(join(ROOT, "sitemap.xml"), xml);
const reasons = skipped.reduce((a, [, r]) => ((a[r.split(" ")[0]] = (a[r.split(" ")[0]] || 0) + 1), a), {});
console.log(`sitemap.xml: ${urls.length} URLs. Excluded: ${JSON.stringify(reasons)}`);
for (const [p, r] of skipped.filter(([, r]) => r.startsWith("canonical"))) console.warn("  WARN", p, r);
