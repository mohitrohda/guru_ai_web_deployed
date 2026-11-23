// Fixed-window rate limiter. Uses D1 when bound (shared across all Workers isolates),
// and falls back to per-isolate memory (best effort) when D1 is absent or unreachable.
import { clientIp, sha256Hex } from "./http.js";

const mem = new Map(); // key -> { windowStart, count }

export const rateLimit = async (env, request, name, { limit, windowSec }) => {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - (now % windowSec);
  const ipHash = (await sha256Hex(`${env.RATE_LIMIT_SALT || "guru-ai"}|${clientIp(request)}`)).slice(0, 32);
  const bucket = `${name}:${ipHash}`;
  const retryAfter = windowStart + windowSec - now;

  if (env.DB) {
    try {
      const row = await env.DB
        .prepare(
          "INSERT INTO rate_limits (bucket, window_start, count) VALUES (?1, ?2, 1) " +
          "ON CONFLICT(bucket, window_start) DO UPDATE SET count = count + 1 RETURNING count"
        )
        .bind(bucket, windowStart)
        .first();
      if (Math.random() < 0.02) {
        // Housekeeping: drop windows older than a day. Failure here is harmless.
        env.DB.prepare("DELETE FROM rate_limits WHERE window_start < ?1").bind(now - 86400).run().catch(() => {});
      }
      return { ok: row.count <= limit, retryAfter };
    } catch {
      /* table missing or D1 hiccup: degrade to memory limiter below */
    }
  }

  if (mem.size > 5000) mem.clear();
  const cur = mem.get(bucket);
  if (!cur || cur.windowStart !== windowStart) {
    mem.set(bucket, { windowStart, count: 1 });
    return { ok: true, retryAfter };
  }
  cur.count += 1;
  return { ok: cur.count <= limit, retryAfter };
};
