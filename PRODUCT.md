# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Mid-market businesses in India and abroad looking for custom software development, AI integration, and digital infrastructure. Primary contacts are founders, managing directors, and operations leads — decision-makers who evaluate vendors directly, not through procurement layers. Many have outgrown off-the-shelf tools and need purpose-built systems. Indian SMBs needing GST-compliant billing software for specific industry verticals are a significant, proven segment.

## Product Purpose

GURU AI TECHNOLOGIES is a software studio based in Pune, India, that builds AI-powered websites, custom business software (CRM, ERP, HRMS, LMS, e-commerce platforms, BI dashboards, SaaS products, and 16 industry-specific billing systems), AI chatbots, automation workflows, mobile apps, cloud/DevOps infrastructure, and digital marketing — delivered as a unified service from one team. The website is the primary sales surface: it needs to earn trust with new visitors, demonstrate capability across the full service range, and convert enquiries through the contact form and WhatsApp.

Success means a mid-market prospect — whether in India or abroad — landing on the site, understanding what GURU AI builds, finding their specific need represented, and reaching out with confidence.

## Positioning

Direct access to founders and senior engineers with no account-management layer, full-stack delivery from a single team that covers billing software to AI agents to production websites, and speed-and-cost advantages over larger agencies — without compromising engineering quality. The Indian billing-software line (16 industry verticals, GST-native) is a proven, differentiated product that larger studios don't offer at this specificity.

## Operating Context

Clients engage via the website contact form, WhatsApp (+91 80876 95569), or direct email. Delivery is remote-first, with calls scheduled around the client's time zone and written updates so nothing waits on a meeting. The site is deployed on Cloudflare Pages from a GitHub repo; no build step, no framework — static HTML/CSS/JS pushed to `main` auto-deploys. The in-page GURU chatbot handles initial FAQ-level queries in English, Hinglish, and Roman Marathi, with a planned upgrade path to a live LLM via Cloudflare AI.

## Capabilities and Constraints

**Live services (each has a dedicated page):** AI-powered websites, custom software development (CRM, ERP, HRMS, LMS, inventory management, property management, helpdesk, e-commerce, BI dashboards, SaaS platforms, document management, customer portals, fleet management, AI agents), AI chatbots & voice agents, AI automation, billing software (16 Indian industry verticals: salon & spa, gym, manufacturing, wholesale, automobile, hospital, pharmacy, retail, fashion, textile, jewellery, hotel, restaurant, event, coaching, rental), digital marketing, cloud & DevOps, cyber security, mobile apps, AI consulting, AI engineering.

**Case studies published:** Accusize Gauges & Tools (Canadian manufacturing client — billing + AI), Salon + AI Chatbot, GAT Billing Software (the shared billing engine).

**Technical constraints:** strict Content-Security-Policy via `_headers` (no `unsafe-inline` for scripts), async font loading with metric-matched fallbacks, EmailJS for form delivery (currently needs Gmail reconnection — external fix, not a code issue). No analytics installed yet. 7+ service pages still on generic placeholder showcase images.

**Undecided:** social media profile URLs (`Organization.sameAs` empty), analytics provider, whether to add a blog or location pages (currently a recommended no-go).

## Brand Commitments

- **Name:** GURU AI TECHNOLOGIES
- **Logo:** Brain-mark icon, present in navbar/footer/favicons/OG image. Source files in `assets/brand/`.
- **Voice:** Friendly and conversational — like talking to a trusted technical partner. Not stiff-corporate, not overly casual.
- **Domain:** guruaitechnologies.com
- **Contact:** +91 80876 95569 (phone/WhatsApp), role-based emails at guruaitechnologies.com (contact@, sales@, support@, careers@, info@).
- **Locale:** `en_IN`, primary language English.
- **Tagline in hero:** "AI websites and software that growing businesses run on, wherever they are."

## Evidence on Hand

- 3 published case studies with real client work (Accusize is a named, international client).
- Named "Trusted By" clients on the homepage: MAAAX Men's Hub, Rangrez.
- 29/29 functional tests passing in headless Chromium (prior verified pass).
- Lighthouse scores: Accessibility 100, Best Practices 100, SEO 100 across all tested pages; Performance 84–97 on local server (Cloudflare will score higher).
- 164/164 JSON-LD blocks valid across 62 HTML pages.
- No fabricated testimonials, ratings, stats, or invented client names anywhere on the site.

## Product Principles

1. **Ship real work, not promises.** Every claim on the site must be backed by a real case study, a named client, or working code — never by invented stats or stock testimonials.
2. **One team, full stack.** The value is that a single studio handles billing software, AI chatbots, production websites, and cloud infrastructure — the client doesn't need to coordinate three vendors.
3. **Direct access, no layers.** Founders and senior engineers are the people on the call. The studio's size is a feature: decisions happen fast, context is never lost in handoffs.
4. **Indian depth, international reach.** Deep, proven domain expertise in Indian business verticals (GST billing, local workflows), combined with remote-first delivery that works across time zones.
5. **Engineering quality is non-negotiable.** Accessibility 100, valid structured data, strict CSP, no broken links — the site itself is the proof that the studio builds to production standards.

## Accessibility & Inclusion

WCAG AA colour contrast enforced across the current palette (verified against `--c-carbon`, white, and all accent values). All 137 images carry `alt` text. Keyboard-accessible navigation, expand/collapse, and accordion controls with correct `aria-expanded` states. `prefers-reduced-motion` respected for all scroll-reveal animations. No specific product-level accessibility requirement beyond these web-standard practices has been established.
