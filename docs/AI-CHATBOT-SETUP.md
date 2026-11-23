# GURU AI assistant setup

**Flow:** browser (`chatbot/loader.js` idle-loads the bundle) → `POST /api/chat` (SSE stream) → retrieval (BM25 over `functions/_kb/kb.json`) → OpenAI-compatible provider. If AI is unconfigured, times out or fails twice, the client circuit breaker switches to the local rule-based engine for 60 s.

**Enable AI:** set `AI_API_BASE_URL`, `AI_API_KEY`, `AI_MODEL` (works with any OpenAI-compatible chat-completions endpoint). Verify with `GET /api/config` → `{"ai":true,...}`.

**Behaviour & safety**
- Answers only from retrieved facts; no invented prices, clients, stack lists or guarantees (pricing = custom quote).
- Languages: English, Hinglish, Roman Marathi.
- Limits: 600-char message, 8 history turns, 12 KB body, 20 req/5 min + 200/day per hashed IP.
- Prompt-extraction attempts get a refusal without calling the model; a canary token detects leakage and the reply is replaced.
- Control markers `[[START_PROJECT]]`/`[[HUMAN]]` are stripped server-side, even across stream chunks.
- Conversation context lives in browser memory only; nothing is persisted unless the user completes the lead flow with consent.

**Lead flow:** name → company → email → phone → service → description → requirements → budget → timeline → summary + explicit consent → `POST /api/leads`. The UI says "submitted" only when the API returns `ok`. Human handoff uses verified contacts only: WhatsApp +91 80876 95569, contact@guruaitechnologies.com, Mon–Sat 10:00–19:00 IST.

**Updating knowledge:** edit `knowledge/*.json` → `npm run build:kb` → `node scripts/build-chatbot.mjs` → deploy.
