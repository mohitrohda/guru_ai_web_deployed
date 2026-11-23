// Shared helpers for the site scripts (zero dependencies).
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, dirname, posix } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const ORIGIN = "https://guruaitechnologies.com";
const SKIP = new Set(["node_modules", ".git", ".wrangler", "functions", "migrations", "knowledge", "scripts", "docs", "tests", "dist"]);
/** Pages that exist but must never be indexed or listed in the sitemap. */
export const UTILITY = new Set(["404.html", "director.html", "googlee4263199676567a6.html", "sitemap.html"]);

export const walkHtml = (dir = ROOT, out = []) => {
  for (const n of readdirSync(dir)) {
    if (SKIP.has(n) || n.startsWith(".")) continue;
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walkHtml(p, out);
    else if (n.endsWith(".html")) out.push(p);
  }
  return out;
};

/** File path (relative, posix) -> the URL path Cloudflare Pages serves with HTTP 200. */
export const cleanUrlPath = (rel) => {
  rel = rel.split("\\").join("/");
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return "/" + rel.slice(0, -10);
  return "/" + rel.slice(0, -5);
};

/** URL path served by Pages -> file it comes from (or null). Mirrors Pages' pretty-URL behaviour. */
export const fileForUrlPath = (urlPath) => {
  const p = urlPath.replace(/^\//, "");
  const cands = urlPath.endsWith("/") || p === "" ? [join(p, "index.html")] : [p + ".html", join(p, "index.html"), p];
  for (const c of cands) {
    const f = join(ROOT, c);
    if (existsSync(f) && statSync(f).isFile()) return { file: f, rel: c, servedClean: !c.endsWith(".html") || c === p + ".html" };
  }
  return null;
};

export const read = (f) => readFileSync(f, "utf8");
export const attr = (html, re) => { const m = html.match(re); return m ? m[1] : ""; };
export const meta = (html, name) => attr(html, new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["']([^"']*)["']`, "i"));
export const canonicalOf = (html) => attr(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i);
export const isNoindex = (html) => /noindex/i.test(meta(html, "robots"));
export const resolveHref = (fromRel, href) => {
  const base = cleanUrlPath(fromRel);
  return new URL(href, "https://x.test" + base).pathname;
};
export { relative, posix };
