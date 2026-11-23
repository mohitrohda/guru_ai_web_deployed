# Changelog

## 2.0.0 — AI assistant, lead capture, SEO & security pass
**Added** `/api/chat` (SSE, OpenAI-compatible, retrieval KB, EN/Hinglish/Roman Marathi, safety rules, rule-based fallback); conversational lead flow with consent summary; `/api/leads` + D1 `project_leads`/`rate_limits`; Resend/Brevo notification adapters; Turnstile; dedupe + idempotency + honeypot; token-protected admin endpoint; `scripts/` (KB, sitemap, validation, public build); API integration tests; docs.
**Changed** Chatbot rewritten as lazy-loaded single bundle on 253 pages (was 28); removed unverified claims from chatbot data (tech lists, "100%", same-day/within-the-hour, portfolio); 1,874 eyebrow/numbered decorative elements removed; neutral shadows/tokens; sub-11px text raised; contrast fixes (muted text, primary button, hero goals); clean-URL canonicals site-wide; sitemap 59 → 73 curated URLs; 177 thin leaf pages set `noindex, follow`; CSP/headers updated for Turnstile and `/api/*` no-store; privacy page now covers the AI assistant and stored enquiries; case-study previews labelled as illustrations; unverifiable `priceRange` removed.
**Fixed** Wrong phone number in old chatbot link renderer; marker split across stream chunks; name extraction including connector words.
**Known/not done** see PROJECT-STATUS.md.
**Performance** 18 oversized showcase WebPs (up to 2.3 MB) recompressed (q76, max 1600px/900px mobile): assets/showcase 38 MB → ~7 MB.
