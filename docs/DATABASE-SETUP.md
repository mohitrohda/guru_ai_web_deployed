# Database setup (Cloudflare D1)

1. `npx wrangler d1 create guru-ai-leads` → copy the `database_id`.
2. In `wrangler.toml` uncomment the `[[d1_databases]]` block (binding `DB`) and paste the id; or bind `DB` in the Pages dashboard (Settings → Bindings → D1).
3. `npm run db:migrate:remote` (local: `npm run db:migrate:local`).
4. Redeploy.

Tables: `project_leads` (migration 0001: contact fields, service, description, budget/timeline, `consent`, `consent_text`, `status` new/contacted/qualified/won/lost/spam, `idempotency_key` UNIQUE, `dedupe_hash`, notification state) and `rate_limits` (0002).
Full chat transcripts are never stored. A lead is stored only after the visitor sees a summary and consents.

View leads: `npx wrangler d1 execute guru-ai-leads --remote --command "SELECT id,name,email,service,status,created_at FROM project_leads ORDER BY id DESC LIMIT 20"`
or `GET /api/admin/leads` with `Authorization: Bearer <ADMIN_TOKEN>`; `PATCH` updates status.
Retention/deletion: delete rows on request (`DELETE FROM project_leads WHERE email = ?`) — see privacy page.
