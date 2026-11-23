# SEO implementation

**Indexing policy (measured):** 254 HTML pages. 73 indexable and listed in `sitemap.xml`. 177 templated leaf pages under `services/more_services/*/*` have ~58–79 unique words each → `noindex, follow`, excluded from sitemap; the hub `/services/more_services/` stays indexable. Utility pages (404, director, Google verification, sitemap.html) are excluded. Promote a leaf page back by adding unique content, removing the robots meta and re-running `node scripts/build-sitemap.mjs`.

**Canonical form:** clean URLs (no `.html`) in canonicals, sitemap, JSON-LD, internal links and the chatbot — matching Cloudflare's 308 behaviour. Verified: 329 internal URLs crawl as 200 with no redirects.
**Structured data:** 195 JSON-LD blocks, all valid JSON, no fabricated reviews/ratings; `priceRange` removed (unverified).
**Meta:** every page has unique title/description within length targets (`npm run check`).
**Honest imagery:** case-study previews are illustrations, stated on the page.

**Keyword map (primary → page)**
| Intent | Page |
|---|---|
| AI website / AI chatbot development Pune | `/services/ai-websites`, `/services/chatbots-voice`, `/services/ai-engineering/` |
| Billing / invoicing software India | `/services/billing-software` |
| Custom software development Pune | `/services/software-development` |
| Business automation / workflow | `/services/ai-automation` |
| Industry software (clinics, retail, hospitality, education, manufacturing, beauty) | `/industries/*` |
| Brand / contact / local | `/`, `/about`, contact section (Pune, +91 80876 95569) |

**Search Console checklist**
1. Verify domain property (file `googlee4263199676567a6.html` already present, or DNS TXT).
2. Submit `https://guruaitechnologies.com/sitemap.xml`; expect 73 URLs.
3. URL-inspect `/`, `/services/`, `/about`; request indexing.
4. Confirm leaf pages report "Excluded by noindex" (expected).
5. Watch Coverage, Core Web Vitals, and Rich results (Organization/LocalBusiness) weekly for 4 weeks.
6. Do not buy/fake reviews; add Review markup only for real, visible, verifiable reviews.
Performance: chatbot is idle-loaded (one 127 KB bundle + css), no layout shift from launcher; run Lighthouse on the live URL (not measured here — no public network from the build sandbox).
