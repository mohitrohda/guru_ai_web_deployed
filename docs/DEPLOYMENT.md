# Deployment (Cloudflare Pages)

1. Push repo to GitHub; Cloudflare Pages → Create project → connect. Framework preset: None. Build command: none (or `npm run build:public` for hardened output). Output dir: `/` (or `dist`).
2. Create/bind D1 (docs/DATABASE-SETUP.md). Add variables/secrets (docs/ENVIRONMENT-VARIABLES.md).
3. Deploy; then check: `/`, `/api/config`, chat reply, a test enquiry, `/sitemap.xml`, `/robots.txt`.
4. Custom domain `guruaitechnologies.com`; `_redirects` sends www → apex.

**Hardening trade-off:** with output dir `.`, files such as `docs/`, `migrations/`, `*.md`, `knowledge/` are publicly reachable. They contain no secrets, but for a cleaner surface run `npm run build:public`, set `pages_build_output_dir = "dist"` and Pages build command `npm run build:public`. `functions/` is still read from the repo root.

**Headers/CSP** are in `_headers` (Turnstile origin allowed; `/api/*` is `no-store`). Clean URLs are canonical: Pages 308-redirects `/x.html` → `/x`.
**Rollback:** Pages → Deployments → Rollback.
