#!/usr/bin/env node
// Builds functions/_kb/kb.json (the assistant's knowledge base) from:
//   1. knowledge/*.json  - curated, hand-verified facts (company, services, pricing, contact, process, policies, FAQs, technologies)
//   2. every public page on the site - title, meta description, headings and page-level FAQ (auto-extracted)
// Zero dependencies. Run after editing site content:  node scripts/build-kb.mjs
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKIP_DIRS = new Set(["node_modules", ".git", "functions", "migrations", "knowledge", "scripts", "docs", "tests", "dist", ".wrangler"]);
const SKIP_FILES = new Set(["404.html", "director.html", "googlee4263199676567a6.html", "sitemap.html"]);

const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name) || name.startsWith(".")) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".html") && !SKIP_FILES.has(name)) out.push(p);
  }
  return out;
};

const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;|&rsquo;/g, "'").replace(/&nbsp;/g, " ");
const text = (html) => decode(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const first = (re, s) => { const m = s.match(re); return m ? m[1] : ""; };

const shortTitle = (t) => decode(t).replace(/\s*[|–—-]\s*GURU AI.*$/i, "").trim();

const pageChunk = (file) => {
  const html = readFileSync(file, "utf8");
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  /* noindex pages stay in the KB: they are valid pages the assistant may link to */
  const title = shortTitle(first(/<title>([\s\S]*?)<\/title>/i, html));
  const desc = decode(first(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i, html));
  const h1 = text(first(/<h1[^>]*>([\s\S]*?)<\/h1>/i, html));
  const main = first(/<main[\s\S]*?>([\s\S]*?)<\/main>/i, html) || html;
  const h3s = [...main.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)].map((m) => text(m[1])).filter((t) => t && t.length < 70).slice(0, 12);

  const faqs = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      const d = JSON.parse(m[1]);
      for (const node of d["@graph"] || [d]) {
        if (node["@type"] === "FAQPage") for (const q of node.mainEntity || []) faqs.push(`Q: ${q.name} A: ${q.acceptedAnswer?.text || ""}`);
      }
    } catch { /* invalid JSON-LD is caught by scripts/validate-site.mjs */ }
  }

  const body = [desc, h1 && h1 !== title ? `Headline: ${h1}.` : "", h3s.length ? `Covers: ${h3s.join("; ")}.` : "", ...faqs.slice(0, 3)]
    .filter(Boolean).join(" ").slice(0, 1400);
  const url = rel === "index.html" ? "/" : rel.endsWith("/index.html") ? "/" + rel.slice(0, -10) : "/" + rel.slice(0, -5);
  return { id: "page:" + rel, type: "page", title: title || h1 || rel, url, keywords: [], text: body };
};

const curated = [];
const company = {};
for (const f of readdirSync(join(ROOT, "knowledge")).filter((n) => n.endsWith(".json")).sort()) {
  const d = JSON.parse(readFileSync(join(ROOT, "knowledge", f), "utf8"));
  if (d.core) Object.assign(company, d.core);
  curated.push(...(d.chunks || []));
}

const pages = walk(ROOT).map(pageChunk).filter((c) => c && c.text);
const kb = {
  meta: { version: 2, built: "static", curatedChunks: curated.length, pageChunks: pages.length },
  company,
  chunks: [...curated, ...pages],
};
mkdirSync(join(ROOT, "functions/_kb"), { recursive: true });
writeFileSync(join(ROOT, "functions/_kb/kb.json"), JSON.stringify(kb));
console.log(`kb.json: ${curated.length} curated + ${pages.length} page chunks, ${(JSON.stringify(kb).length / 1024).toFixed(0)} KB`);
