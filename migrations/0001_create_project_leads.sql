-- GURU AI Technologies: project enquiries captured by the website assistant.
-- Apply with:  npx wrangler d1 migrations apply guru-ai-leads --remote
-- Privacy: full chat transcripts are NOT stored. Only the confirmed enquiry fields.

CREATE TABLE IF NOT EXISTS project_leads (
  id                  TEXT PRIMARY KEY,               -- random UUID
  name                TEXT NOT NULL,
  company             TEXT,
  email               TEXT NOT NULL,
  phone               TEXT,
  service             TEXT NOT NULL,
  project_description TEXT NOT NULL,
  requirements        TEXT,
  budget_range        TEXT,
  expected_timeline   TEXT,
  consent             INTEGER NOT NULL CHECK (consent IN (0, 1)),
  consent_text        TEXT,                           -- exact wording the visitor agreed to
  status              TEXT NOT NULL DEFAULT 'new'
                      CHECK (status IN ('new','contacted','qualified','won','lost','spam')),
  source              TEXT NOT NULL DEFAULT 'website-chatbot',
  language            TEXT,                           -- en | hi | mr
  page_path           TEXT,                           -- page the visitor was on
  idempotency_key     TEXT UNIQUE,                    -- blocks double-click / retry duplicates
  dedupe_hash         TEXT,                           -- same person + same brief within 24h
  notified_at         TEXT,                           -- set when the sales email was sent
  notify_error        TEXT,                           -- last email failure reason, if any
  created_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_project_leads_created ON project_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_leads_status  ON project_leads (status);
CREATE INDEX IF NOT EXISTS idx_project_leads_dedupe  ON project_leads (dedupe_hash, created_at);
