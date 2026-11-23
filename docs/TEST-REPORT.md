# Test report

Date: 2026-11-22. Environment: build sandbox (no public internet, so no live AI provider, email provider, Turnstile, Lighthouse or Search Console).
**MOCK** = against local mock servers; **LOCAL** = real runtime/DB but local; **LIVE** = real third-party service. **No LIVE tests were possible.**

| Area | Type | Result |
|---|---|---|
| API integration (`npm test`, 30 tests): chat streaming, marker stripping across chunks, prompt-extraction refusal, canary leak, AI 500/hang fallback, limits (413/422/405), rate limiting, lead validation, honeypot, idempotency, 24h dedupe, 503 without DB, Turnstile pass/fail, email adapter success/failure, admin auth, secret never in responses | MOCK AI/email/Turnstile + LOCAL wrangler runtime & real local D1 | 30/30 pass |
| Site validation (`npm run check`): 254 pages, 73 indexable = 73 sitemap URLs, 195 JSON-LD blocks, 14,351 internal links, titles/descriptions/canonicals | LOCAL | 0 errors, 0 warnings |
| Crawl (`npm run test:crawl`): 329 unique internal URLs | LOCAL | all 200, no redirects |
| Browser chatbot e2e (`tests/browser-e2e.cjs`): AI streaming, EN lead flow → summary → consent → D1 row with consent=1, duplicate submit, Hinglish and Roman Marathi flow start, cancel, AI-500 → rule-based fallback, Esc/Enter keyboard, XSS payload inert, no page errors | MOCK AI + LOCAL D1 | 12/12 pass (Hinglish trigger bug found and fixed during testing) |
| Responsive (`tests/browser-responsive-a11y.cjs`): 13 pages × widths 320/375/390/430/768/1024/1280/1440/1920, horizontal overflow | LOCAL Chromium | 0 overflow findings |
| Accessibility: axe-core WCAG 2.0/2.1/2.2 A+AA on key pages (mobile+desktop) and chat window | LOCAL Chromium | Found grey-text/primary-button contrast + chat status/link issues → fixed; page contrast scan re-run clean; chat fixes applied (CSS) but not re-scanned after the final change |
| Visual review of home/services/about screenshots at 390 and 1440 | manual | Looks consistent; decorative numbers removed (a last list numbering on the home goal list was removed after review) |

**Not tested / limits:** live AI quality, live email delivery, real Turnstile widget, real Cloudflare edge (headers/CSP enforcement and 308 behaviour were verified only via wrangler locally), Lighthouse/Core Web Vitals, real-device and Safari/Firefox testing, screen-reader testing, full keyboard audit of every page, chat Turnstile widget UI. Turnstile server-side verification is covered by mock only.
**Design audit:** the Impeccable skill was not available; a manual audit against the master prompt checklist was performed instead (see docs/audit/).
