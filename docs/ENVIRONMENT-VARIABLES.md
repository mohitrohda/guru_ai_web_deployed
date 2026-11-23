# Environment variables

Set in Cloudflare Pages → Settings → Variables and Secrets (use **Secret** type for keys). Locally use `.dev.vars` (git-ignored).
No real secret is in this repository. All are optional; features degrade safely when unset.

| Name | Type | Purpose |
|---|---|---|
| `AI_API_BASE_URL` | var | OpenAI-compatible base URL, e.g. `https://api.openai.com/v1` (https required; localhost allowed for dev) |
| `AI_API_KEY` | secret | Provider key. Unset → chatbot uses rule-based fallback |
| `AI_MODEL` | var | Model name, e.g. `gpt-4o-mini` |
| `AI_TIMEOUT_MS` | var | 1000–60000, default 15000 |
| `DB` | D1 binding | D1 database for leads + rate limits |
| `EMAIL_PROVIDER` | var | `resend` or `brevo` |
| `EMAIL_API_KEY` | secret | Email provider key |
| `LEAD_NOTIFY_TO` / `LEAD_NOTIFY_FROM` | var | Recipient / verified sender |
| `TURNSTILE_SITE_KEY` | var | Public key, exposed via `/api/config` |
| `TURNSTILE_SECRET_KEY` | secret | Server-side verification. If set, leads require a valid token |
| `ADMIN_TOKEN` | secret | Bearer token for `/api/admin/leads`. Unset → endpoint returns 404 |
| `RATE_LIMIT_SALT` | secret | Salt for hashed IP rate-limit keys |
| `EMAIL_API_BASE_URL`, `TURNSTILE_VERIFY_URL` | test-only | Point at mocks in tests; leave unset in production |
