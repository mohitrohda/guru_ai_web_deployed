# GURU AI TECHNOLOGIES — Production Website

Premium, handcrafted static site. No build step, no dependencies, no framework.
Static pages with a Vercel function for the project enquiry form.

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

## Deployment and canonical domain

The canonical site is `https://guruaitechnologies.com`. The page canonicals,
social cards, structured data, sitemap, and robots file point there.

1. Connect this repository in the Vercel project. Use the Other framework preset with the repository root and the default build and output settings. Confirm the project uses Node.js 22 or 24.
2. Configure the server environment variables below. Create a preview, test the project form from that same origin, and verify delivery in the intended inbox before releasing it.
3. Add `guruaitechnologies.com` in Vercel Domains. Apply the DNS records Vercel shows for this project and wait for verification and HTTPS. Check the homepage, a deep service page, a buying guide, the contact endpoint, and `/sitemap.xml` on the new host. [Vercel domain setup](https://vercel.com/docs/domains/working-with-domains/add-a-domain)
4. Once the custom domain serves this release, set a 301 from the attached `guruaiwebdeployed.vercel.app` alias and `www.guruaitechnologies.com` to the apex. Confirm a deep path with a query string redirects to its matching destination. [Vercel domain redirects](https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting)
5. Verify the custom domain in Search Console, submit the live sitemap, and align the Google Business Profile website, public phone, and hours. Run PageSpeed Insights on the live homepage and a core service page. [Google sitemap submission](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)

The security policy is configured in `vercel.json` and `_headers`. Keep their
Content-Security-Policy values in sync and put executable JavaScript in
external files. The sitemap contains the canonical URL for each indexable
HTML page. Update it when adding or removing a page.

## Local preview

Run `python3 -m http.server` from the repository root and open
[localhost:8000](http://localhost:8000/).

## Public contact details

- Phone and WhatsApp: **+91 80876 95569**
- General, quote and legal enquiries: **contact@guruaitechnologies.com**
- Hours: **Mon–Sat · 10:00 AM–7:00 PM IST**

## Project brief form

`contact-brief.mjs` posts to the same-origin `/api/contact` Vercel function.
Configure `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`,
and `EMAILJS_PRIVATE_KEY` in the Vercel server environment for Preview and
Production. Reuse the existing project service and template, confirm
private-key API access in EmailJS, and keep the recipient set in the
template. Render enquiry fields as escaped text.
[EmailJS REST API](https://www.emailjs.com/docs/rest-api/send/)

Set both `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for shared
rate limiting and duplicate protection across Vercel instances. Without
these variables, the controls apply within each process. Store credentials
in the host environment. The browser gets an acknowledgement only after
the provider accepts the brief. A static preview supports direct WhatsApp
and email links. Mock provider responses for automated checks.

## Approved starting prices and proof

`project-evidence.mjs` can display approved starting prices for website,
software and automation projects. The current site offers custom quotes.
Only add an approved amount in INR after confirming what the quote covers.
The same file accepts business metrics with an approved integer value, a
label, and a public source description. Review chatbot copy when prices
change and date guides when they are first published.

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

21 aug 2026 
change guru ai technologies logo 
19/sep/2026
update director page and other designs
