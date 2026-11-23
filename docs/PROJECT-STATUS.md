# Project status — v2.0.0

**Ready:** static site (254 pages), AI assistant with rule-based fallback, lead capture code + migrations, SEO policy, security headers, tests, docs.
**Requires owner action before the AI/leads work in production**
1. Create D1 and bind as `DB`; run migrations (DATABASE-SETUP.md).
2. Set AI provider variables (AI-CHATBOT-SETUP.md).
3. Set email provider + recipient/sender (verify sender domain).
4. Create Turnstile widget; set site/secret keys (and add the domain).
5. Set `ADMIN_TOKEN`, `RATE_LIMIT_SALT`.
6. Submit sitemap in Search Console; run Lighthouse on live URL.
7. Confirm homepage testimonials/client names are genuine; review legal text with a lawyer.
**Known gaps:** no live-service testing; Service schema not on every service page; layout standardisation and nav review were light-touch; leaf `more_services` pages are thin and noindexed pending real content; `.html` URLs still exist on disk but are served clean; Hindi/Marathi chat copy should be reviewed by a native speaker.
Older status documents: `docs/archive-*.md` (outdated, kept for history).
