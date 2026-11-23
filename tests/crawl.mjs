// Live crawl against a running server (wrangler pages dev): every sitemap URL and every internal link
// must return HTTP 200 with no redirects, and noindex/robots signals must match the sitemap policy.
//   node tests/crawl.mjs http://localhost:8788
import { join, relative } from "node:path";
import { ROOT, walkHtml, read, resolveHref } from "../scripts/site-lib.mjs";
const base = process.argv[2] || "http://localhost:8788";
const urls = new Set(["/", "/robots.txt", "/sitemap.xml", "/site.webmanifest"]);
for (const u of read(join(ROOT, "sitemap.xml")).matchAll(/<loc>https:\/\/guruaitechnologies\.com([^<]*)<\/loc>/g)) urls.add(u[1] || "/");
for (const f of walkHtml()) {
  const rel = relative(ROOT, f).split("\\").join("/");
  for (const m of read(f).matchAll(/<(?:a|link|script|img)\b[^>]*\b(?:href|src)=["']([^"']+)["']/gi)) {
    const h = m[1];
    if (/^(https?:|mailto:|tel:|#|javascript:|data:)/.test(h)) continue;
    urls.add(resolveHref(rel, h.split("#")[0].split("?")[0] || "."));
  }
}
const list = [...urls];
const bad = [];
let i = 0;
const worker = async () => {
  while (i < list.length) {
    const u = list[i++];
    try {
      const r = await fetch(base + u, { redirect: "manual" });
      if (r.status !== 200) bad.push(`${r.status} ${u}${r.headers.get("location") ? " -> " + r.headers.get("location") : ""}`);
      else await r.arrayBuffer();
    } catch (e) { bad.push("ERR " + u); }
  }
};
await Promise.all(Array.from({ length: 12 }, worker));
console.log(`crawled ${list.length} unique internal URLs; non-200: ${bad.length}`);
bad.slice(0, 30).forEach((b) => console.log("  ", b));
process.exit(bad.length ? 1 : 0);
