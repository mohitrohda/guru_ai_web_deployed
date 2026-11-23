# Baseline audit (before changes) — Part 0

Input: 3 ZIPs, 425 files, all present with paths intact. 254 HTML pages; 195 JSON-LD blocks (valid, no review markup); sitemap had 59 URLs.
**Pass 1 (18/20) claims checked**
- "Infinite animations removed": partly. Remaining ones are in dead hero CSS or guarded by prefers-reduced-motion.
- "No tiny text": false — 37 font sizes under 11px (fixed).
- Chatbot coverage: only 28 of 254 pages loaded it (now 253; verification file excluded).
- Docs said 62 pages; actual 254.
- Old chatbot data contained unverifiable claims (tech lists, "100%", same-day/within-the-hour, portfolio) and a wrong phone number in the link renderer (fixed).
- Case-study images are illustrations, not screenshots (now labelled).
- Homepage testimonials cannot be verified from the repository — left unchanged, flagged for the owner to confirm they are real and permitted.
- With output dir `.`, internal docs/migrations are publicly served (documented; `build:public` provided).
