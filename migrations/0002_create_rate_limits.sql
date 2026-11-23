-- Fixed-window rate limiter used by /api/chat and /api/leads.
-- Keys are salted hashes of the visitor IP, never the raw address.
CREATE TABLE IF NOT EXISTS rate_limits (
  bucket       TEXT NOT NULL,      -- e.g. "chat:<hash>" or "lead:<hash>"
  window_start INTEGER NOT NULL,   -- unix seconds, floored to the window
  count        INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket, window_start)
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits (window_start);
