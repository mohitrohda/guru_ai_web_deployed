# GURU AI TECHNOLOGIES — Production Website

Premium, handcrafted static site. No build step, no dependencies, no framework.
Optimized for Cloudflare Pages.

## Latest UI/UX Update

Site-wide shift from the dark futurist palette to a **clean, light-corporate
AI/SaaS look** — closer to the direction shown in the current reference
mockups, without touching functionality, content, or the tech stack.

**Design system**
- Palette flipped to white / very-light surfaces, deep navy text
  (`#0E1E3D`), slate body (`#47566E`), Electric Blue `#2F6BFF` as the
  primary accent, and a restrained cyan `#0AA6C7` for subtle touches
- Muted grey retuned to `#646F84` and small accent text to `#1E50D8` so
  every label / eyebrow / link meets WCAG AA on white and on `--c-carbon`
- Soft, navy-tinted elevation replaces the old heavy black shadows;
  neon glows and glassmorphism dialed back to a corporate whisper
- Refined ghost + primary + signal buttons, softer signal divider line,
  cleaner focus rings

**Hero**
- Restructured into a proper 2-column CSS Grid — the visual can no longer
  overlap the copy at any viewport (verified at 1024 / 1280 / 1440 /
  1600 / 1920)
- Existing headline and CTAs kept; the previous heavy raster hero image
  has been replaced with a lightweight, native inline-SVG dashboard
  preview (crisp at every DPR, zero extra download)
- Mobile CTAs go full-width below 520px for cleaner, more tappable pairs

**Cards, chips & sections**
- Service, why-choose, testimonial, stat and contact tiles now render as
  soft white cards with subtle blue-tinted borders and layered shadows
- Service and why-choose icons upgraded to filled soft-blue chips
- Testimonial tag chips and avatars use the accessible accent + white
- Process step markers, hero trust dots and FAQ chevrons re-inked in blue
- Service-page CTA panel: soft blue-tinted gradient card

**Chatbot (GURU)**
- Full re-tint for the light theme without touching any logic: white
  window shell, tinted header/composer bars, tinted bot bubbles so
  nothing renders as white-on-white
- Launcher becomes a solid brand-gradient pill; teaser popup is now a
  white card with a soft arrow

**Images**
- Removed the 14 legacy showcase raster graphics from the layout: they
  were dark-cyberpunk styled and, more importantly, contained fabricated
  content (invented stats, fake testimonials with stock faces, an off-brand
  tech stack, and one wrong phone number) that conflicted with the site's
  real content
- Lightbox engine and `showcase` styles remain intact — drop-in ready for
  clean light preview graphics whenever they're produced

**Other**
- `theme-color` meta updated on all 14 HTML pages; `site.webmanifest`
  background/theme also updated to `#FFFFFF`
- 404 page (self-contained styles) re-tinted to match

**Verified before delivery**
- 29 / 29 functional tests pass in headless Chromium: mobile nav,
  expand/collapse regions with correct ARIA, FAQ accordion, form
  validation, chatbot open → reply → close, testimonials marquee,
  to-top, scroll progress, sticky nav state, all WhatsApp / tel /
  service links, JSON-LD schema on service pages
- Zero horizontal overflow at 320, 390, 430, 768, 1280, 1600 on home,
  service, legal and 404
- Zero JS errors on home and service pages
- No broken asset references anywhere

**Files changed**: `style.css`, `index.html`, all 10 `services/*.html`,
`404.html`, `site.webmanifest`, `README.md`. Legal pages are unchanged —
they restyle automatically via CSS tokens.


## Structure
```
index.html                 Home — 11 sections + contact form
services/  (10 pages)      One page per service: unique content, FAQs,
                           Service + FAQPage JSON-LD schema
legal/     (3 pages)       Privacy, Terms, Cookies
404.html                   Branded not-found page (self-contained)

style.css                  Entire design system + every page's styles
script.js                  Site logic: nav, reveals, form, loader
testimonials.js            Auto-scrolling, drag/swipe testimonials marquee

chatbot/                   GURU assistant — kept modular on purpose
  context.js               Session state (name, language, turn memory)
  engine.js                Intent matching, language detection, rendering
  provider.js              Adapter: rule-based now, API-swappable later
  ui.js                    Launcher, teaser popup, chat window
  data/                    Trilingual knowledge base (English / Hinglish /
                           Roman Marathi) — 9 intent files, typo-tolerant
                           matching (shorthand + fuzzy spelling)

assets/icons              favicon.svg + 32 / 180 / 192 / 512 PNG set
assets/og                 1200×630 social share image
assets/brand              Official logo (navbar/footer/schema) — WebP + master PNG
assets/showcase           Product preview visuals: 12 images x (desktop + mobile crop)
sitemap.xml  robots.txt  _headers  _redirects  site.webmanifest
```

## Deploy on Cloudflare Pages
1. Push this folder to a GitHub repo (repo root = this folder).
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → connect the repo.
3. Build settings: **Framework preset: None · Build command: (leave empty) · Output directory: /**
4. Deploy, then add the custom domain `guruaitechnologies.com`.
   `_redirects` already forwards www → apex.

## Commit & push (this repo)
This project is already connected to:
`https://github.com/Onkarkamthe/GURUAITECH.git` (branch `main`).

```bash
cd guru-ai                     # repo root — the folder containing index.html

git status                     # review what changed before committing
git add -A                     # stage everything, including new asset folders
git commit -m "Update images, SEO, expand/collapse, and lightbox"
git push origin main
```

Cloudflare Pages redeploys automatically on every push to `main` (if you've
connected the repo via the Cloudflare dashboard as in step 2 above). No
manual upload step is needed after the first connection.

**Important:** `assets/brand/` and `assets/showcase/` must be committed —
they are real image folders, not generated at build time. If `git status`
ever shows them as "Untracked," the site's logo and product visuals will
be broken on anyone who clones/deploys from that commit, even though they
render correctly locally. Always run `git add -A` (not `git add <file>`
one-by-one) before committing to avoid missing a new folder.

`_headers` ships a strict Content-Security-Policy. It's already configured
for everything this site uses (including the 404 page's inline script, which
is allowed via a SHA-256 hash). **If you edit the inline script inside
404.html, recompute its hash** and update the `script-src` value, or that
script will be blocked in production.

## Local preview — works everywhere, no setup
All paths are relative, so the site works in every scenario:
- **Double-click** `index.html`
- **VS Code Live Server** from any folder level
- **python3 -m http.server** from any folder level

## Contact details (used site-wide)
- Phone / WhatsApp: **+91 80876 95569**
- Role-based email: `contact@` (general), `sales@` (quotes),
  `support@` (post-launch), `careers@` (hiring), `info@` (legal)

## Contact form — activate a provider (2-minute setup)
The form ships in **WhatsApp fallback mode**: submissions open WhatsApp with
the enquiry pre-filled, so nothing is ever lost. To enable direct email
delivery, edit `script.js` → the `CONFIG` object inside the form module:
- **Web3Forms (free):** endpoint `https://api.web3forms.com/submit` + access key
- **Formspree:** endpoint `https://formspree.io/f/YOUR_ID`
- **Cloudflare Pages Function:** endpoint `/api/contact`

No markup changes needed. `_headers` CSP already allows Web3Forms and Formspree.

## Chatbot — upgrading to a live AI later
`chatbot/provider.js` has an `ApiProvider` template. Point it at a Cloudflare
Pages Function backed by any LLM (OpenAI / Claude / Gemini / Groq / Cloudflare
AI) and switch the active provider — the UI and datasets don't change.

## Notes
- Update the "Last updated" date in the legal pages if you edit them.
- To add analytics later, extend the CSP `script-src` / `connect-src` in `_headers` first.

## Recent updates (Aug 2026)

**Delivery fix** — a prior handoff shipped only changed HTML/CSS/JS files and
omitted `assets/brand/` and `assets/showcase/`, which were never committed to
git (confirmed via `git status` — they showed as untracked). Every image and
the navbar logo rendered broken as a result. This ZIP contains the **complete
project**, including both asset folders, verified against a fresh checkout.


**Branding** — Official GURU AI TECHNOLOGIES logo (brain mark) applied across
navbar, footer, 404, favicons (32/180/192/512), SVG favicon, and the OG social
image. Source files in `assets/brand/`.

**Imagery** — 12 production visuals in `assets/showcase/` (WebP, all <200 KB),
presented in framed preview panels: hero, 10 service pages, plus company,
why-choose and portfolio visuals on the home page. All lazy-loaded with fixed
dimensions (CLS measured at 0.007 mobile / 0.001 desktop).

**Expand / collapse** — Why GURU AI (2 of 6 shown), Services (3 of 10),
Process (3 of 5) collapse by default behind "View All" buttons, cutting the
mobile page length by ~25%. Powered by `GURU.expand` in `script.js` using a
CSS `grid-template-rows` animation; fully keyboard accessible with correct
`aria-expanded` states and reduced-motion support.

**SEO** — Organization + LocalBusiness + WebSite + FAQPage schema on the home
page; Service + FAQPage on all 10 service pages. Complete Open Graph and
Twitter Card tags on all 14 pages, unique canonicals, sitemap with lastmod,
and "Related Services" cross-linking between service pages.

> **CSP note:** `_headers` allows `https://cdn.jsdelivr.net` in `script-src`
> and `https://api.emailjs.com` in `connect-src` — both are required for the
> EmailJS contact form. Removing them will silently break form submissions in
> production.
21 aug 2026 
change guru ai technologies logo 
19/sep/2026
update director page and other designs