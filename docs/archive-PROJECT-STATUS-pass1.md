# Project status

**Phase 3 is complete — all 3 batches (3a, 3b, 3c) built and verified.**
All 6 planned industry-hub pages are live, all 16 billing sub-pages link
up to their industry, and both case studies with a genuine industry match
(Accusize, Salon + AI Chatbot) link up too. See the dedicated sections
below and `PHASE-3-PLAN.md` for the full phase plan. The blog and
location pages remain a recommended no-go, unchanged from the plan.

## Phase 3, Batch 3a — Industries pilot (built this session)

Built exactly as scoped in `PHASE-3-PLAN.md`: the Industries hub plus 2
pilot pages.

**New pages:**
- `industries/index.html` — hub, lists the 2 live industries (will list
  all 6 once Batch 3b ships).
- `industries/beauty-wellness.html` — rolls up Salon & Spa and Gym &
  Fitness Studio billing, plus AI chatbots, AI-powered websites, AI
  automation, and digital marketing. Links out to the real Salon + AI
  Chatbot case study.
- `industries/manufacturing-trade.html` — rolls up Manufacturing
  Management, Wholesale & Distributor, and Automobile Garage billing,
  plus ERP development, AI automation, and cloud/DevOps. Links out to
  the real Accusize Gauges & Tools case study.

Each new page: unique title/meta/canonical, `CollectionPage` + `ItemList`
+ `BreadcrumbList` (+`FAQPage` on the 2 industry pages) JSON-LD matching
real page content, no fabricated ratings or stats, no personal names, no
dashes in body copy (all three checked by grep, zero matches).

**Wired into the existing site, not just built in isolation:**
- "Industries" added as a new top-level nav link (desktop + mobile) on
  all 42 existing pages, scripted so every page now links to it, plus
  the 3 new pages (45 total now carry it).
- Found and fixed a **pre-existing bug** while doing this: the 3 legal
  pages (`legal/privacy.html`, `terms.html`, `cookies.html`) had a stale
  footer "Company" column left over from before the About page and nav
  overhaul existed — it linked to `index.html#about` and a legacy
  `director.html` "Director" link, with no Case Studies link at all.
  Fixed to match the current standard footer (About → Industries → Case
  Studies → FAQ → Contact) on all 3.
- Upward links added from the 5 relevant billing sub-pages (salon-spa,
  gym-fitness-studio, manufacturing-management, wholesale-distributor,
  automobile-garage) to their parent industry page.
- A cross-link added from the Services hub ("Prefer to browse by
  industry instead?").
- `sitemap.xml` and `sitemap.html` both updated with the 3 new URLs.

**Verification actually run this session:**
- Full site: 45 HTML files, **0 broken links/assets**, **109/109 JSON-LD
  blocks valid** (98 before this batch + 11 new).
- Visual regression: all 3 new pages at 375/768/1440px, **0 overflow, 0
  console errors**, screenshots reviewed (not just measured) to confirm
  real rendering, correct breadcrumbs, correct nav, working case-study
  CTAs.
- Lighthouse on `industries/beauty-wellness.html` (CSP-enforcing local
  server): **Performance 89, Accessibility 100, Best Practices 100, SEO
  100.**

**CLS finding from this batch: fixed in the next session, see below.**

## Phase 3, Batch 3b — remaining 4 industries (built this session)

Built the last 4 of the 6 planned industry-hub pages, same bar as 3a:

- `industries/healthcare.html` — Hospital & Clinic + Pharmacy billing,
  plus AI chatbots, websites, automation, cyber security. No case study
  linked (none exists for healthcare yet, not forced).
- `industries/retail-fashion.html` — Retail Shop, Fashion & Apparel,
  Textile & Cloth Store, and Jewellery billing, plus websites and
  marketing. No dedicated case study exists, so none is claimed, but the
  overview and FAQ honestly name two real, already-public clients from
  the homepage "Trusted By" section (MAAAX Men's Hub, Rangrez) since
  that's true and already disclosed elsewhere on the site.
- `industries/hospitality-events.html` — Hotel & Lodge, Restaurant &
  Cafe, and Event & Banquet billing, plus websites, chatbots, marketing.
  No case study linked.
- `industries/education-services.html` — Coaching & School Fee and
  Rental Business billing, plus websites, automation, chatbots,
  marketing. No case study linked.

**Wired in:**
- Industries hub (`industries/index.html`) now lists and links all 6,
  its `ItemList` schema updated to match.
- Upward links added from the remaining 11 billing sub-pages to their
  new parent industry page (combined with the 5 done in Batch 3a, **all
  16 billing-industry pages now link up to their industry overview**).
- `beauty-wellness.html` and `manufacturing-trade.html`'s "Other
  Industries We Serve" links updated to point at 2 of the newly-built
  pages each, instead of just each other.
- `sitemap.xml` and `sitemap.html` updated with all 4 new URLs.

**Verified, same rigor as 3a:**
- 49 HTML files site-wide, **0 broken links**, **125/125 JSON-LD valid**
  (109 before this batch + 16 new, 4 blocks × 4 pages).
- Zero em-dashes, zero personal names, zero spaced-hyphen-as-punctuation
  in the new body copy (checked by grep on all 4 files, not assumed).
- Visual regression: all 4 new pages at 375/768/1440px, **0 overflow, 0
  console errors** (12/12 combinations), screenshots reviewed.
- Lighthouse on `industries/healthcare.html` (CSP-enforcing server):
  **Performance 92, Accessibility 100, Best Practices 100, SEO 100, CLS
  0.038** — confirms the font-fallback CLS fix (below) holds on pages
  built after it, not just the ones that originally flagged it.

## Phase 3, Batch 3c — final cross-linking (built this session)

Added the last piece of the industries rollout: upward links from the
two case studies that have a genuine, factual industry match.

- `case-studies/accusize.html` → new "Industry overview" section before
  "Get started", linking to `industries/manufacturing-trade.html` ("See
  everything we build for Manufacturing & Trade businesses →"). Genuine
  match: Accusize is a manufacturing/precision-tools business, already
  the case study linked from that industry page in Batch 3a.
- `case-studies/salon-ai-chatbot.html` → same pattern, linking to
  `industries/beauty-wellness.html` ("See everything we build for Beauty
  & Wellness businesses →"). Genuine match for the same reason.
- `case-studies/billing-software-gat.html` — deliberately **not** linked.
  Read its full content: it documents the internal billing
  product/engine itself (the shared foundation underlying all 16
  industry-specific billing systems), not a project for one specific
  industry vertical. No genuine single-industry match exists, so per the
  "don't force a link" instruction, it was left alone.

**Verified:**
- Full site: 49 HTML files, **0 broken links/assets**, **125/125 JSON-LD
  blocks valid** (unchanged from Batch 3b's count — these were plain
  `<a>` link insertions, no new JSON-LD added).
- Visual check on both touched pages: Accusize at 375px and 1440px,
  Salon + AI Chatbot at 375px — all screenshotted and reviewed (not just
  measured). The new link renders as a plain `.text-link`, consistent
  with the existing "Industry overview" links already used on the
  billing sub-pages, positioned cleanly between the results/story content
  and the "Get started" CTA card. No overlap, no overflow, no layout
  shift at any breakpoint checked.

**This completes the entire Phase 3 industries rollout**: 6 industry-hub
pages, all 16 billing sub-pages linking up, and both case studies with a
genuine match linking up. See `PHASE-3-PLAN.md` for the full phase record.

## Site-wide CLS fix (font-swap reflow)

The CLS finding flagged above (0.132 on `beauty-wellness.html`) was fixed
properly, not patched around, in the next session.

**Root cause, confirmed precisely**: the async Google Fonts loading (from
two sessions ago) is still the right call for performance — it is not
being undone — but the fallback system font (Segoe UI on Windows) has
different ascent/descent/average-character-width than the real webfonts
(Inter, Space Grotesk, IBM Plex Mono), so swapping from fallback to real
font reflows the page by a small but measurable amount. Short pages feel
it more because the reflowed content is a bigger fraction of what is
visible during the measurement window.

**Fix**: added 3 `@font-face` blocks (`Inter Fallback`, `Space Grotesk
Fallback`, `IBM Plex Mono Fallback`) using `ascent-override`,
`descent-override`, `line-gap-override`, and `size-adjust` so the
fallback font is sized to match each real font's actual metrics while it
loads. The override numbers are not estimated: installed
`@capsizecss/metrics` (the same verified metrics data real font-fallback
tooling like `next/font` and Astro use) and computed them directly from
Inter, Space Grotesk, and IBM Plex Mono's real OS/2/hhea tables against
Segoe UI's. Sanity check: the computed Inter `size-adjust` (107.71%)
landed almost exactly on the commonly cited community value for Inter
against Arial (~107.64%), which cross-validates the formula was applied
correctly. The 3 font-family CSS variables (`--f-display`, `--f-body`,
`--f-mono`) now list the matching fallback alias right after the real
font, before the generic `system-ui` keyword. Nothing about the loading
mechanism (`#gfonts-preload`, the JS swap, the CSP) changed.

**Verified, real numbers, same 3 pages, before → after:**

| Page | CLS before | CLS after | Performance before | Performance after |
|---|---|---|---|---|
| `industries/beauty-wellness.html` | 0.132 | **0.046** | 89 | 91 |
| `legal/privacy.html` | not measured before (new test page) | **0.009** | — | 96 |
| `services/billing-software/salon-spa-billing-software.html` | not measured before (new test page) | **0** | — | 92 |

All 3 now comfortably inside Lighthouse's "good" CLS band (<0.1).
Accessibility/Best Practices/SEO unaffected (100/100/100 on all 3, both
before and after). Re-confirmed zero CSP violations in the browser
console with the new `@font-face` rules present (`local()` font sources
are not network requests, so no CSP directive governs them — expected,
and confirmed). Full site re-validated after this CSS change: 0 broken
links, 109/109 JSON-LD still valid.

Note on provenance: no master-prompt document, CLAUDE.md, or project
tracker exists anywhere in this repository (checked: repo root and all
subdirectories contain only `README.md` and `PAGE-STRUCTURE.md`). This file
is being created now, from this audit pass, as the first tracker. If a
master prompt exists outside this repo, point me at it and I'll reconcile
this file against it.

Last audited: 2026-10-20.

## 🔴 URGENT — the contact form is not delivering leads right now

Submitted the live form end-to-end through the actual rendered page (real
browser, real network round-trip to `api.emailjs.com`, not a code read).
The request reaches EmailJS correctly (CORS preflight 204, real POST sent),
but EmailJS's backend rejects it with:

> `412 Gmail_API: Invalid grant. Please reconnect your Gmail account`

This means the Gmail account connected to your EmailJS "Email Service" has
had its authorization revoked or expired (common causes: Gmail password
changed, 2-factor re-enrolled, or the OAuth grant simply expired from
inactivity). **Every visitor who has submitted the contact form instead of
WhatsApp has had their enquiry silently lost** — they see a generic
"Something went wrong... WhatsApp us instead" message and most won't
realize their message never arrived anywhere.

This is not something I can fix from the code — it needs you (or whoever
has access) to log into the EmailJS dashboard → Email Services → the
connected Gmail service → reconnect/re-authenticate the Gmail account. Once
reconnected, resubmitting the form should work with no code changes needed
(the integration itself — service ID, template ID, public key — is all
correctly wired; only the Gmail connection is broken).

## Competitor research & international positioning (this pass)

### Competitors researched (live-fetched, not invented)
Picked realistic peer-tier custom software studios/agencies rather than
Accenture/IBM-tier giants, since those aren't a fair comparison for a
project-based studio this size:

- **Simform** (simform.com) — has grown into enterprise-scale "AI-native
  engineering" positioning; services organized as Engineering / Advisory /
  CX Transformation / Enterprise Platform / Managed Services; doesn't
  state its delivery model or time zones on the homepage at all, leans on
  client logos instead.
- **Daffodil Software** (daffodilsw.com) — "Your Trusted Partner for
  Software Engineering and AI Innovation"; explicitly lists Delaware
  (USA), Dubai (UAE), and Gurugram (India) offices; frames offshore work
  as "Offshore Development Center" / "Hire Dedicated Developers," i.e.
  extensions of the client's own team.
- **Classic Informatics** (classicinformatics.com) — "Trusted by Global
  Businesses Across 30+ Countries" as a headline stat; lists office
  contacts for India, Australia, USA, and UK; promises a response "within
  a few hours."
- **Net Solutions** (netsolutions.com) — closest match to the actual
  concern here: a client testimonial on the homepage reads "consistently
  exceed our expectations despite being in separate time zones," and a
  CTO testimonial explicitly endorses them for offshore development. This
  is the direct model for fixing framing without fabricating offices.

Common pattern across all 4: none of them hide that delivery is
India-based (or has an India component), but none lead with it as the
primary identity either — the frame is "global capability," with location
mentioned as a fact, not a limitation.

### Audit finding: this site read as India-only in 3 places
Checked hero, About, footer, FAQ, and contact. Footer ("Built in Pune.
Deployed worldwide.") and one FAQ answer were already fine. Three spots
actively signalled "Indian customers only" to a first-time international
reader:
1. Homepage hero lead: "...that **growing Indian businesses** run on..."
2. About hero lead: "...AI tools for **Indian businesses**."
3. About "Our Story": "...billing software for sixteen different kinds of
   **Indian businesses**..." presented with no indication the rest of the
   business serves anyone else.

No currency, local-only payment method, or India-only legal language was
found elsewhere (the GST/billing-software mentions are accurate — that
product line genuinely is India-specific, see below).

### Edits made (real content, not just reported)
- **Homepage hero**: eyebrow now reads "Pune, India" (was just "Pune");
  lead rewritten to "...growing businesses run on, **wherever they
  are**..." (removed "Indian"); added a 4th trust-bar item, "Clients
  across India & abroad."
- **Homepage FAQ** ("Where are you located and do you work remotely?"):
  rewritten to name remote-first working style explicitly — time-zone-
  scheduled calls, written updates, live previews — and the matching
  FAQPage JSON-LD answer text updated to stay in sync.
- **About hero lead**: "...for Indian businesses" → "...for businesses in
  India and abroad."
- **About "Our Story"**: kept the true, scoped claim that billing software
  is built for Indian businesses (it's GST-specific by nature — an honest
  constraint, not under-selling it) but added an explicit follow-up
  sentence: websites, custom software, chatbots, and automation don't
  carry that constraint and are delivered the same way for international
  clients.
- **About "How We Work"**: added a 5th principle, "Remote-first delivery,
  calls scheduled around your time zone, written updates so nothing waits
  on a meeting" — matching the Net Solutions pattern above, honestly
  (no claimed office, no claimed local number).
- Deliberately **did not touch** meta descriptions, `og:description`,
  `twitter:description`, or the Organization/LocalBusiness JSON-LD
  (`areaServed: India`) — those serve local-SEO search intent ("software
  development company Pune") and are factually correct; this task was
  about body copy read by a human visitor, a different concern from
  structured data read by a search engine.
- Verified: all edits screenshotted at 375px and 1440px, zero overflow;
  JSON-LD re-validated (parses clean) after the FAQ schema edit.

### hreflang / country-specific pages — not justified, and I'm not building them
All content is single-language (English), there are no region-specific
case studies, no region-specific pricing, and no compliance differences
to localize around. `hreflang` exists specifically to point search
engines at *alternate-language or alternate-region versions of the same
page* — there is only one version of each page here, so `hreflang` has
nothing to link to. Country landing pages (`/us/`, `/uk/`, etc.) with no
real differentiated content would be thin/doorway pages, which carries
real SEO risk (duplicate-content and low-value-page signals) rather than
benefit. Revisit this only if the business actually lands a cluster of
clients in one country with content to back a dedicated page (a real case
study, region-specific delivery detail) — not before.

## Verified complete

- **38 real content pages** live and indexable (10 service pillars, 2
  Custom-Software sub-pages, 16 billing-industry sub-pages, 3 case studies
  + case-studies hub, about, services hub, sitemap page, home). Plus
  `404.html`, `director.html` (redirect), and a Google verification file —
  correctly not indexed.
- Every page has a unique `<title>`, meta description, canonical URL (spot
  checked across all 38 in a prior pass; titles re-tightened on 7 pages
  that ran past ~70 characters).
- `sitemap.xml` (39 URLs) and `robots.txt` match the live route list —
  confirmed by direct count this session.
- 98 JSON-LD blocks site-wide, all valid JSON (confirmed programmatically),
  no fabricated `AggregateRating`/`Review` schema anywhere (confirmed by
  grep — zero matches).
- Internal linking is wired, not just planned: every pillar/sub-page is
  reachable from every page via the mega-menu/mobile accordion; billing
  sub-pages cross-link to 3 siblings each; pillar pages link 2 related
  services.
- Image `alt` attributes: 137/137 `<img>` elements have `alt` text
  (confirmed by exact count match, multi-line-aware — an initial single-line
  grep undercounted by 10 due to wrapped attributes, corrected before
  reporting).
- Contact form (`index.html#contact-form`): real client-side validation
  (name/phone/email/message), a working honeypot (`name="website"`,
  `tabindex="-1"`, `aria-hidden`) wired to silently drop bot submissions,
  and distinct success/error UI states — confirmed by reading the actual
  code path in `script.js`, not just the rendered form.
- Leadership section: role-only language ("Founder & CEO" / "Managing
  Director"), no personal names, present only on `about.html` (home page
  has no leadership section, so there is no cross-page inconsistency to
  reconcile).
- CTA presence: sticky-nav CTA + hero CTA + per-service "See the Full
  Service" CTAs + final contact section + floating WhatsApp/call buttons —
  confirmed present in the markup.
- Homepage "Trusted By" (named real clients) and homepage FAQ section
  (FAQPage schema, 6 Q&As) — confirmed present in the markup.

## Lighthouse — real scores (this session)

Ran via `lighthouse` npm package against a local `python -m http.server`,
headless Chrome, both run against 4 pages. These are **lower-bound
estimates**: a plain local dev server has no HTTP/2, no compression, no
CDN — Cloudflare Pages in production will score Performance higher than
this. Accessibility/Best Practices/SEO are not affected by that and are
accurate as-is.

| Page | Performance (original) | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Home (`index.html`) | 79 (see font/EmailJS fix below — now 84) | 100 | 100 | 100 |
| Pillar (`services/ai-websites.html`) | 85 | 100 | 100 | 100 |
| Billing (`salon-spa-billing-software.html`) | 86 (now 97 — see below) | 100 | 100 | 100 |
| Case study (`accusize.html`) | 91 | 100 | 100 | 100 |

Accessibility audits checked individually, all passing: color-contrast,
image-alt, aria-allowed-attr, button-name, link-name, label, tap-targets.
CLS: 0.02 (home), 0.096 (case study, inside the "good" <0.1 threshold but
closest to the line — no single large-shift element was flagged by
Lighthouse's own `layout-shifts` audit, so there's no one-line fix to
point at; likely several small reveal-animation shifts adding up).

### Fixed this pass — safe, verified
- **Home page: EmailJS SDK script was render-blocking.** It was a plain
  `<script src="https://cdn.jsdelivr.net/...">` in `<head>`, with no
  `defer`, costing ~770ms of the page's ~2s render-blocking time for a
  script that's only needed at submit time (long after load). Added
  `defer` — confirmed safe because it's still the first deferred script
  in document order, so `window.emailjs` is still ready before
  `script.js`'s `form.init()` runs (re-verified live: "EmailJS SDK
  loaded: true" during the form test below, and the SDK script itself
  still returned HTTP 200).

### Google Fonts render-blocking — fixed and verified against the real CSP
Previously: every page loaded `<link rel="stylesheet" href="fonts.googleapis.com/css2?...">`
directly, which is render-blocking (~830ms consistently, confirmed by
Lighthouse's `render-blocking-insight` audit in the prior pass).

The standard fix (`<link rel="stylesheet" media="print"
onload="this.media='all'">`) does not work on this site: `_headers` ships
`script-src 'self' 'sha256-...' https://cdn.jsdelivr.net` with no
`'unsafe-inline'` or `'unsafe-hashes'`, and that CSP governs inline
event-handler attributes (`onload=`, etc.) regardless of which element
they're on. An inline `onload` would be silently blocked, loading zero
fonts in production — while appearing to work on any local server that
doesn't send the real CSP header, which is exactly what tripped this up
initially.

**What was actually done**, with no CSP changes:
- All 40 HTML files: `<link rel="stylesheet" href="...fonts...">` →
  `<link rel="preload" as="style" href="...fonts..." id="gfonts-preload">`
  (never render-blocking) + a `<noscript><link rel="stylesheet" ...></noscript>`
  fallback for JS-disabled visitors.
- `script.js` (already self-hosted under `script-src 'self'`, already
  `defer`red on every page): added a small IIFE at the very top that
  finds `#gfonts-preload` and sets `.rel = "stylesheet"`, which actually
  applies the font CSS. No inline script, no new CSP directive, no hash.

**Verified against the real CSP, not assumed:**
- Read `_headers` directly this session (not from memory) and confirmed
  `style-src` has `'unsafe-inline'` but `script-src` does not — the
  relevant directive for an `onload=` handler is `script-src`, so the
  naive fix really would have broken font loading in production.
- Built a local Node server that parses `_headers` itself and sends the
  exact same headers Cloudflare Pages would, then loaded the homepage and
  a billing inner page in real headless Chrome against it.
- Result: **zero CSP violations** in the browser console on both pages.
  `document.getElementById('gfonts-preload').rel` reads `"stylesheet"`
  (the swap ran). `document.styleSheets` includes the Google Fonts sheet.
  `getComputedStyle(h1).fontFamily` resolves to `"Space Grotesk"` and body
  text to `"Inter"` — the real fonts are genuinely rendering, not
  silently falling back to system fonts.

**Lighthouse, before → after, same methodology (local server, lower-bound
estimate, but now CSP-enforcing so the comparison is meaningful):**

| Page | Performance before | Performance after |
|---|---|---|
| Home | 79 | 84 |
| Billing (salon-spa) | 86 | 97 |

The `render-blocking-insight` audit on the homepage went from 3 flagged
resources (fonts: 834ms, EmailJS SDK: 771ms, style.css: 1351ms — 2070ms
total) to 1 (style.css alone: 452ms, which is expected and necessary — the
page needs its CSS to paint anything). Both the fonts and EmailJS entries
are completely gone, not just smaller.

### Pharmacy page image fixed
- **Pharmacy page was showing the wrong industry's image.**
  `services/billing-software/pharmacy-medical-store-billing-software.html`
  was pointing to a real, detailed showcase image that was byte-for-byte
  identical (confirmed via MD5 hash) to the Retail Shop page's image — a
  POS screen with t-shirts, mugs, and bags, nothing pharmacy-specific.
  Replaced `assets/showcase/billing-pharmacy.webp` and
  `billing-pharmacy-mobile.webp` with the same honest generic placeholder
  used by the other 6 thin pages below, so the page now reads as
  "awaiting its real image" instead of silently showing a different
  business's product. No page code was touched — only the image files.

## Open items needing your input

### 7 pages still on a generic placeholder image
All 7 use the exact same two files (confirmed identical by MD5 hash), a
plain white card with a blue circle and three gray text bars — not broken,
just not industry-specific yet. Swap these two files per page (same
filenames, both desktop + mobile) and no page code needs to change:

| Page | Desktop file | Mobile file |
|---|---|---|
| `services/cloud-devops.html` | `assets/showcase/cloud-devops.webp` | `assets/showcase/cloud-devops-mobile.webp` |
| `services/cyber-security.html` | `assets/showcase/cyber-security.webp` | `assets/showcase/cyber-security-mobile.webp` |
| `services/billing-software/manufacturing-management-software.html` | `assets/showcase/billing-manufacturing.webp` | `assets/showcase/billing-manufacturing-mobile.webp` |
| `services/billing-software/jewellery-shop-billing-software.html` | `assets/showcase/billing-jewellery-shop.webp` | `assets/showcase/billing-jewellery-shop-mobile.webp` |
| `services/billing-software/textile-cloth-store-billing-software.html` | `assets/showcase/billing-textile-cloth.webp` | `assets/showcase/billing-textile-cloth-mobile.webp` |
| `services/billing-software/fashion-apparel-retail-billing-software.html` | `assets/showcase/billing-fashion-apparel.webp` | `assets/showcase/billing-fashion-apparel-mobile.webp` |
| `services/billing-software/pharmacy-medical-store-billing-software.html` | `assets/showcase/billing-pharmacy.webp` | `assets/showcase/billing-pharmacy-mobile.webp` (just fixed from the wrong-duplicate above) |

`services/index.html` also shows two of these (Cloud & DevOps, Cyber
Security) in its service-grid thumbnails — same files, no extra work once
the two are replaced.

### `Organization.sameAs` — still empty
Searched the entire project (HTML, JS, README) for `linkedin.com`,
`instagram.com`, `facebook.com`, `twitter.com`/`x.com`, `youtube.com` —
zero matches anywhere. No real social profile URLs exist in this project
to put here. Left omitted rather than fabricated, as before. Needs real
URLs from you.

### Contact form — Gmail reconnection required
See the urgent item at the top of this file. The form, validation,
honeypot, and EmailJS wiring are all confirmed correct; only the Gmail
connection on EmailJS's side needs reconnecting. Re-test after
reconnecting by submitting the form once with an obviously-fake name like
"TEST SUBMISSION - ignore" and confirming the email arrives.

### Taxonomy coverage — no tracker to check against
There's no "approved categories" list in this repo to re-walk. What
exists: 10 service pillars, 2 software sub-types, 16 billing industries,
all live with content I've read directly across this engagement and found
genuinely differentiated per industry (no formal text-similarity diff was
run, but no copy-paste clone pattern was found either). If there's an
external tracker with the approved list, send it and I'll reconcile.

## Final pre-merge QA sweep (this session)

Verification only, no new feature changes made. Everything below was
actually run this session, not inferred from earlier passes:

- **Full-site link/asset check**: 42 HTML files crawled, every `href`/`src`
  resolved against the filesystem. **0 broken internal links, 0 broken
  asset references.**
- **JSON-LD**: every `<script type="application/ld+json">` block
  site-wide parsed. **98/98 valid**, no change from the pre-pass baseline
  — the last two sessions' copy edits (hero, About, FAQ) didn't break
  anything, including the FAQPage schema text I kept in sync by hand.
- **Visual regression**: homepage, About, a pillar page
  (`ai-websites.html`), a billing sub-page (`salon-spa`), the services
  hub, and the sitemap page, each at 375px / 768px / 1440px (18
  combinations). **Zero horizontal overflow, zero browser console
  errors** on any of them. Screenshotted and eyeballed a sample of each
  at each breakpoint — fonts render correctly (Space Grotesk headings,
  Inter body), mega-menu and footer intact, no shifted or clipped
  elements from the font-loading or CSP changes.
- **Lighthouse re-run**, homepage + About (both touched this session),
  against the CSP-enforcing local server:
  - Home: Performance 84, Accessibility 100, Best Practices 100, SEO 100
    (matches the prior pass's post-fix number — stable, no regression).
  - About: Performance 97, Accessibility 100, Best Practices 100, SEO 100.
  - CLS 0.039 (home) / 0.048 (about), both comfortably under the 0.1
    "good" threshold. Color-contrast, image-alt, aria-allowed-attr,
    button-name, link-name all scored 1 (passing) individually, not just
    as a rounded category score.

## Go / no-go verdict

**Go.** This branch is safe to merge to `main` as-is. Nothing found this
session blocks merge. The only two outstanding items are the ones
already flagged as explicitly external to this codebase: the EmailJS/
Gmail reconnection (needs your action in the EmailJS dashboard) and the
7 placeholder images (need real photography/mockups from you). Neither
is a code defect — the code on both is correctly wired and will work the
moment those two external things are supplied, and both are already
documented above with exact file paths / exact steps.

## Recommended next prompt
"Reconnect the Gmail account in the EmailJS dashboard, then do one real
end-to-end contact-form submission with an obviously-test name and confirm
the email actually arrives. Once deployed, spot-check a real Cloudflare
Pages preview URL in a real browser (not just this local CSP-emulating
server) to confirm fonts render and there are no console errors, as a
final sanity check on the font-loading change."

## New: 6 additional Custom Software Development pages (this session, direct repo access)

Expanded the software taxonomy beyond CRM/ERP, following the master-prompt's
"every distinct, commercially relevant software category deserves its own
page" principle, applied with discipline (evaluated against what already
existed, picked only genuinely distinct categories, avoided padding).

**New pages** (`services/software-development/`):
- `hrms-development.html` — HRMS Development
- `inventory-management-software.html` — Inventory & Warehouse Management
- `lms-development.html` — Learning Management System
- `property-management-software.html` — Property & Real Estate Management
- `helpdesk-support-software.html` — Help Desk & Customer Support
- `ai-agents-development.html` — AI Agents & Intelligent Automation

**Distinctness checked against existing pages before building, not assumed:**
read `hospital-clinic-management-software.html` (already covers patient
records + billing, so no separate "hospital management" page was added),
`manufacturing-management-software.html` (already covers production +
inventory + billing for manufacturing specifically, so the new inventory
page is scoped as a general, cross-industry stock/warehouse system, not a
manufacturing duplicate), `wholesale-distributor-billing-software.html`
(bulk-order billing angle, not warehouse/stock tracking, confirming
inventory management is a genuine gap), and `ai-automation.html` (general
workflow automation framing, "give your team their hours back", confirming
AI Agents is a distinct, more modern multi-step/autonomous-action framing
rather than a duplicate).

Each page: unique title/meta/canonical/OG/Twitter tags, `Service` +
`FAQPage` + `BreadcrumbList` JSON-LD, 6 features, 6 benefits, 4 FAQs, all
written as original content per category (not reused text), no personal
names, no dashes in body copy (checked by script, 0 matches across all 6).
Uses the same generic placeholder showcase image as the other 7 pending
pages (`assets/showcase/<slug>.webp` + `-mobile.webp`), ready to swap once
real images are supplied, same pattern as the rest of the site.

**Wired into the existing site:**
- Added as 6 new `mega__link--sub` entries under "Custom Software
  Development" in the desktop mega-menu, across all 52 pages that carry
  the nav (46 pre-existing + cross-linked on the 6 new pages themselves).
  Verified at 1440px and 1000px breakpoints with real screenshots — the
  taller "Build" column renders cleanly, no overflow, no visual breakage.
  Mobile nav intentionally left unchanged (CRM/ERP were never listed
  individually in the mobile accordion either — consistent with that
  existing pattern, keeps the mobile menu from growing unbounded).
- `services/software-development.html` hub's "Explore by Category" grid
  now lists all 8 custom-software pages (was 2), each with a real,
  distinct one-line description.
- `sitemap.xml` and `sitemap.html` updated with all 6 new URLs.

**Verified, not assumed:**
- 55 HTML files site-wide, **0 broken links/assets**, **143/143 JSON-LD
  valid** (125 before this batch + 18 new, 3 blocks × 6 pages).
- Visual regression on 2 of the 6 new pages plus the updated hub page, at
  375px and 1440px (real Playwright screenshots, reduced-motion emulated
  to bypass the scroll-reveal animation that otherwise hides below-the-fold
  content from a one-shot full-page capture — confirmed this is a capture
  artifact, not a site bug, by reproducing the identical blank-section
  pattern on the untouched original `crm-development.html` first). **0
  horizontal overflow, 0 console errors** on all combinations checked.
- One caveat, stated plainly: this session's cloud sandbox only permits
  outbound requests to an allowlist (GitHub, package registries); Google
  Fonts itself could not be fetched here, so the actual font render and the
  real CSP header could not be re-verified in this pass the way the
  previous session's local server (with full network access) did. The new
  pages use the exact same `#gfonts-preload` swap markup as every existing
  page, copied from the same template, so there is no code-level reason to
  expect different behavior, but this is a real gap in what was verified
  this session, not a confirmed pass.

Not yet done for this batch: cross-linking from industry-hub pages (CRM/ERP
aren't linked from industry pages either, so this follows the existing
pattern rather than a gap) and a direct Lighthouse run (blocked by the same
font-fetch sandbox limit above; the page structure/CSS is unchanged from an
already-Lighthouse-verified template, so risk is low but unconfirmed).

Still open, unchanged: EmailJS/Gmail reconnection, 13 pages now on the
generic placeholder image (the original 7 + these 6 new ones, all
documented with exact file paths), `Organization.sameAs`.

## New: 7 more Custom Software Development pages (same session, following a full master-list audit)

The user supplied an external ~1000-item custom-software taxonomy
(`docs/SOFTWARE_CATEGORY_MASTER_LIST.md`-equivalent, received as a pasted
list covering 30 top-level categories). Audited it category-by-category
against everything already live on the site (the 24 pages above plus the 6
industry hubs and 11 core-service hubs), reported the coverage back
honestly, and — on explicit instruction — built the highest-value genuine
gaps identified by that audit.

**New pages** (`services/software-development/`):
- `ecommerce-platform-development.html` — E-Commerce Platform Development
- `business-intelligence-dashboard-development.html` — BI & Analytics Dashboard Development
- `fleet-management-software.html` — Fleet & Transportation Management
- `saas-platform-development.html` — SaaS Platform Development
- `construction-real-estate-billing-software.html` — Construction & Real Estate Billing
- `document-management-system.html` — Document Management System
- `customer-portal-development.html` — Customer & Vendor Portal Development

Each page: unique title/meta/canonical/OG/Twitter tags, `Service` +
`FAQPage` + `BreadcrumbList` JSON-LD, 6 features, 6 benefits, 4 FAQs,
original content per category, no personal names, no dashes in body copy
(checked by script, 0 matches across all 7). Generic placeholder showcase
image, same pattern as every other pending-image page.

**Two real bugs caught and fixed before commit, not after:**
1. The page generator's JSON-LD `name` fields were populated with the
   HTML-entity form (`&amp;`) for the 3 categories whose name contains an
   ampersand (BI & Analytics, Construction & Real Estate, Customer &
   Vendor Portal). `<script type="application/ld+json">` content is parsed
   as raw text, not HTML, so `&amp;` would have been indexed literally
   instead of decoding to `&`. Fixed by using the plain-`&` form inside the
   two JSON-LD `name` fields specifically, while the visible HTML (title,
   breadcrumb, eyebrow, mega-menu link text, CTA heading) correctly kept
   `&amp;`. Verified by parsing every JSON-LD block on the 7 pages with
   Python's `json.loads` and checking the decoded string value.
2. Discovered mid-way that the site's existing mega-menu self-link pattern
   is inconsistent: `crm-development.html` and `erp-development.html`
   (built earliest) link to themselves in their own "Build" column, but
   all 6 pages added in the previous batch (HRMS through AI Agents
   Development) deliberately do not. The sitewide injection script
   initially gave the new 7 pages self-links (following the majority
   pattern it happened to match first); caught this during verification,
   removed the self-link from each of the 7 new pages to match the more
   recent, more deliberate no-self-link precedent, and separately patched
   `ai-agents-development.html`, which had been silently skipped by the
   sitewide script in both this batch and (unnoticed) the previous one,
   since the anchor it searched for (a link to itself) never existed on
   that page.

**Wired into the existing site:**
- All 7 new pages added as `mega__link--sub` entries under "Custom
  Software Development" in the desktop mega-menu, anchored after "AI
  Agents Development", across all 59 pages that carry the nav (every page
  except `404.html`, `director.html` — a redirect stub — and the Google
  site-verification file, which correctly carry no site nav at all).
  Verified at 1440px and 1024px with real screenshots served over a local
  HTTP server (file:// loading hangs on this site's font-preload
  initialiser in this sandbox) — the 15-item "Build" column renders
  cleanly at both widths, no overflow, no visual breakage.
- `services/software-development.html` hub's "Explore by Category" grid
  now lists all 15 custom-software pages, each with a distinct one-line
  description.
- `sitemap.xml` and `sitemap.html` updated with all 7 new URLs.

**Verified, not assumed:**
- 62 HTML files site-wide, **0 broken links/assets**, **164/164 JSON-LD
  valid** (143 before this batch + 21 new, 3 blocks × 7 pages).
- Visual regression on the e-commerce page at 1440px (real Playwright
  screenshot, reduced-motion emulated) — clean render, correct breadcrumb,
  correct content, no layout defects.
- Same sandbox caveat as the previous batch: Google Fonts can't be fetched
  from here, so the real font render and CSP header weren't re-verified
  this pass. Code is copied unchanged from the same already-verified
  template, so risk is low but unconfirmed, same honest caveat as before.

Still open, unchanged: EmailJS/Gmail reconnection, now **13 pages** on the
generic placeholder image (unchanged count — all 7 new pages use the
already-counted placeholder pattern, no new ones added to the list since
these use the same generic fallback image, bringing total pages on a
placeholder to 20; see file paths below), `Organization.sameAs`.

## Homepage restructure + live-animation pass (2026-10-21)

User asked for a from-scratch, independently-reasoned homepage plan
(explicitly: ignore the current structure, no vanity stat-flex like
"56+ Projects Delivered", feel "very professional") — then said to apply
it and add tasteful, brand-fitting live animations.

**Structural changes to `index.html`:**
- Removed the `.hero__trust` vanity-stat list ("56+ Projects Delivered",
  etc.) from the hero. Replaced with one quiet credibility line
  (`.hero__proof`): "Engineering partner to clinics, retailers, and
  manufacturers across India · see the work →" linking to
  `case-studies/index.html`.
- Removed the "Four ways into GURU AI TECHNOLOGIES" `#explore` pathway-grid
  section entirely (filler navigation, confirmed no other page links to
  `#explore` before deleting).
- Removed the `.stats` number-grid ("56+ Projects / 10+ Services / 95+
  Lighthouse / 4000+ Bills") from the About/Fix section; it's now a single
  full-width copy column (new `.intro__grid--single` CSS modifier).
- Trimmed "Why Choose" from 6 cards (2 shown + 4 behind an expand toggle)
  to 4 cards, no expand mechanism: Production-Grade Engineering, Security
  by Default, Mobile-First Always, Direct Partnership. Dropped
  "Performance Obsessed" and "Practical AI" as redundant with messaging
  elsewhere. `.why-grid` now renders a clean 2×2 at desktop width.
- Reordered the whole page to a Problem → Fix → Capability → Proof →
  Trust narrative: Hero → Problems → About(Fix) → Services → Process(How
  We Work) → **Clients** (real named businesses — this *is* the proof
  section, moved earlier and given more weight) → **Industries** (new) →
  Testimonials → Why Choose → FAQ → Contact → Footer. Section `id`s were
  preserved throughout, so no anchor links (nav, footer, other pages)
  broke.
- Added a new `#industries` section on the homepage: a 6-card grid
  (Healthcare, Retail & Fashion, Hospitality & Events, Beauty & Wellness,
  Manufacturing & Trade, Education & Local Services) linking to each
  `industries/*.html` page, content matched to `industries/index.html`.

**Live-animation pass (one consistent motif, reused — not scattered):**
- Hero keeps its existing `.hero-live` component (the one big animated
  moment — unchanged this pass).
- Clients/Proof section: added a small `.industry-pulse` badge ("6
  businesses, actively running on what we built") reusing the exact
  pulse-badge component already shipped on the industries detail pages.
- New Industries grid: each card's icon chip carries a small pulsing dot
  (new `.industry-tile__dot`, reuses the existing `hero-pulse` keyframe —
  no new JS, no new keyframe cost).
- All new animation is `transform`/`opacity`/`box-shadow` only and is
  automatically neutralized by the site's existing global
  `prefers-reduced-motion` override — no extra work needed per component.

**Verified, not assumed:** 62 HTML files, 0 broken links/assets, JSON-LD
still valid everywhere (`verify.py` rerun clean). HTML tag-balance and CSS
brace-balance checked programmatically. Visually confirmed via real
Playwright screenshots (reduced-motion, 1440px and 390px) of hero,
clients, industries, and why sections, plus a full-page mobile capture to
confirm no layout gaps where the stats grid used to be.

### Fix: boot loader had no JS-independent fallback (2026-10-21)

Onkar reported the site repeatedly stuck on the black "Initialising"
loader while reviewing this branch. Root cause: `.loader` is a
`position:fixed; inset:0` overlay covering the entire page, and it was
only ever removed by `script.js` (on `window.load`, with a 2.5s JS
`setTimeout` fallback). If `script.js` ever fails to execute for any
reason — blocked request, flaky connection, `file://` edge cases — there
was no fallback at all and the overlay stayed up forever, blocking the
whole site. Added a pure-CSS hard-timeout (`@keyframes loader-force-hide`,
zero JS dependency) that force-hides it 5s after paint regardless of what
JS does. Verified clean dismissal over both HTTP and `file://` with
Playwright (no console errors either way) before and after the fix — the
JS path itself was never broken, this closes the one real gap. If the
loader still gets stuck after a hard refresh, it points to something
environment-specific (ad-blocker, corporate proxy, DNS/cache) rather than
site code.

### Updated: pages still on a generic placeholder image (20 total)

The original 7 + the 6-page batch + this 7-page batch all share one
generic placeholder (`assets/showcase/cloud-devops.webp` /
`-mobile.webp`, copied under each page's own filename). Swap-in is a
drop-in file replacement once real images are supplied — no code changes
needed. Full list maintained for your reference when images are ready;
ask if you want the complete 20-path list reprinted here.

## Pre-merge audit (2026-10-29): why the CSS broke on `main`, missing-image check

Before merging this branch into `main`, re-investigated the earlier
incident where the live site rendered with zero CSS applied right after
a `main` merge (unstyled mega-menu, oversized hero SVG).

**Could not reproduce it locally under the exact production conditions.**
Stood up a local server emitting the real production response headers
byte-for-byte (`_headers`' full CSP, `X-Content-Type-Options: nosniff`,
etc.) and loaded the homepage through Playwright: `style.css` served
with the correct `Content-Type: text/css`, zero CSP violations, and
`.hero-live__wire`'s computed width came back as a normal CSS-applied
value, not the oversized intrinsic SVG size you'd get with no CSS at
all. This rules out the two most likely code-level causes (a CSP block
on the stylesheet, or a MIME-type/nosniff mismatch) — the code itself
is not what broke. Given that, the earlier incident is most likely a
Cloudflare-side transient (stale edge cache or an incomplete deploy),
not a reproducible defect in this branch.

**Found and fixed one real, separate, previously-unnoticed bug while
auditing:** `404.html` had an inline `<script>` that was never covered
by the CSP's `script-src` hash, so browsers silently blocked it in
production (console CSP violation on every 404 hit). Extracted it to
`404.js` (same external-file pattern as every other page) and removed
the now-fully-unused stale hash from `_headers` — confirmed zero inline
`<script>` blocks remain anywhere on the site (ld+json excluded), and
`404.html` now loads with zero console/CSP errors under the production
headers. Low real-world impact (the footer year had a hardcoded 2026
fallback and the home links were already correct in production), but a
genuine bug nonetheless.

**Site-wide broken-link/missing-asset audit: clean.** Checked all 6,016
local `src=`/`href=`/`srcset` references across all 62 HTML files —
**zero missing files.** The only gap is the already-documented one
above: 20 pages still render the generic placeholder image instead of a
unique one (full list above). This environment has no image-generation
tool available, so those 20 can't be produced here without either (a)
real photos/screenshots supplied, or (b) a different approach agreed
with Onkar (e.g. custom brand-styled vector/CSS graphics built the same
way as the homepage's `.hero-live` component, rendered to `.webp`).

**Two items remain open and need Onkar's own action, not code:**
EmailJS/Gmail reconnection (contact form wiring is correct; EmailJS's
connected Gmail account needs re-authenticating in the EmailJS
dashboard — see the dedicated section above), and `Organization.sameAs`
is still `[]` — searched for a public GURU AI TECHNOLOGIES
LinkedIn/Instagram/Facebook page to fill it in honestly and found none,
so it needs the real URLs from Onkar if those pages exist.

**Verdict: code is ready for `main` except the 20 placeholder images —
waiting on Onkar's decision on those before merging.**
