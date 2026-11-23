# Page structure standard

This file documents the content structure every page on this site should
follow, by page type. When adding a new page, copy the closest matching type
below rather than inventing a new layout. When editing an existing page,
check it still matches its type before committing to other changes.

## 1. Service pillar pages
`services/ai-websites.html`, `software-development.html`, `ai-automation.html`,
`chatbots-voice.html`, `mobile-apps.html`, `billing-software.html`,
`digital-marketing.html`, `ai-consulting.html`, `cloud-devops.html`,
`cyber-security.html`

Section order, top to bottom:

1. **Hero** — breadcrumb, eyebrow, H1, lead paragraph, two CTAs (WhatsApp quote + call).
2. **Overview** (`eyebrow: Overview`) — 2 short paragraphs, what the service actually means for the visitor.
3. **Explore by Category** (`eyebrow: Explore by Category`) — **only on pillars that have sub-pages** (Billing Software → 16 industries; Custom Software → CRM, ERP). Comes immediately after Overview, before any other content, because a visitor who already knows which sub-page they want should see it before generic feature/benefit copy. Pillars without sub-pages skip this section entirely.
4. **Visual preview** — framed showcase image, lightbox-enabled, caption below the frame (never an overlay on top of the image).
5. **What's Included** (`eyebrow: What's Included`) — a grid of feature cards.
6. **Outcomes** (`eyebrow: Outcomes`) — a checklist of business benefits.
7. **FAQ** (`eyebrow: FAQ`) — native `<details>/<summary>`, matched 1:1 by an FAQPage JSON-LD block.
8. *(optional second visual preview, same showcase/lightbox pattern)*
9. **CTA** (`Get started`) — "Apply for Quote" / "Apply for Free Demo" / "Back to Home".
10. **You Might Also Need** — 2 links to related pillar services.

Every pillar page also carries Service + FAQPage + BreadcrumbList JSON-LD in
`<head>`.

## 2. Billing-software industry sub-pages
`services/billing-software/*.html` (16 pages)

Same section order as a pillar page, minus "Explore by Category" (that's the
parent pillar's job), plus one addition:

1. Hero (breadcrumb includes: Home → Billing Software → *this industry*)
2. Overview
3. Visual preview
4. What's Included
5. Outcomes
6. FAQ
7. CTA
8. **Other Industries We Bill For** — links to exactly 3 sibling industry pages. This is the sideways cross-link; the breadcrumb and the mega-menu are the upward link back to the Billing Software pillar.

Every sub-page carries Service + FAQPage + BreadcrumbList JSON-LD.

## 3. Case study pages
`case-studies/accusize.html`, `salon-ai-chatbot.html`, `billing-software-gat.html`

1. **Hero** — breadcrumb, eyebrow (industry · what was delivered), H1, lead paragraph that states the challenge in one sentence.
2. **Visual preview**
3. **The Project** (`h2: What we built`) — the challenge (woven into the opening sentences) and what was built, in that order.
4. **Results** (`h2: What changed`) — the outcome.
5. **CTA**

## 4. Hub / index pages
`services/index.html`, `case-studies/index.html`, `about.html`

These are navigation aids, not sales pages, so they don't follow the pillar
structure. Standard shape: Hero → visual preview → a card grid linking to
every child page → CTA. `about.html` additionally has an Our Story and How
We Work section between the visual and the CTA.

## 5. Legal pages
`legal/privacy.html`, `terms.html`, `cookies.html`

Plain content pages, no CTA, no showcase. Not held to the pillar structure.

## 6. Global, every page
- One `<h1>`, breadcrumb matching the BreadcrumbList schema exactly.
- Nav + mega-menu + footer are identical across every page (generated from
  one template per directory depth — see the header/footer markup in any
  page for the canonical version).
- Footer legal row always starts with a link to `/sitemap.html`.
