// Token-protected lead access for the GURU team (no public lead listing exists).
//   GET   /api/admin/leads?status=new&limit=50&before=<ISO timestamp>
//   PATCH /api/admin/leads   { "id": "...", "status": "contacted" }
// Disabled (404) unless ADMIN_TOKEN is set. Send:  Authorization: Bearer <ADMIN_TOKEN>
import { fail, json, readJson, safeEqual } from "../../_lib/http.js";
import { rateLimit } from "../../_lib/ratelimit.js";
import { STATUSES } from "../../_lib/validate.js";

const authorise = async (request, env) => {
  if (!env.ADMIN_TOKEN) return fail(404, "not_found", "Not found.");
  const rl = await rateLimit(env, request, "admin", { limit: 30, windowSec: 300 });
  if (!rl.ok) return fail(429, "rate_limited", "Too many attempts.", { "Retry-After": String(rl.retryAfter) });
  const header = request.headers.get("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token || !(await safeEqual(token, env.ADMIN_TOKEN))) return fail(401, "unauthorized", "Unauthorized.", { "WWW-Authenticate": "Bearer" });
  if (!env.DB) return fail(503, "storage_unavailable", "Database not bound.");
  return null;
};

export const onRequestGet = async ({ request, env }) => {
  const denied = await authorise(request, env);
  if (denied) return denied;
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "50", 10) || 50, 1), 200);
  const before = url.searchParams.get("before");
  const where = [];
  const args = [];
  if (status && STATUSES.includes(status)) { args.push(status); where.push(`status = ?${args.length}`); }
  if (before && /^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/.test(before)) { args.push(before); where.push(`created_at < ?${args.length}`); }
  args.push(limit);
  const sql = `SELECT id, name, company, email, phone, service, project_description, requirements, budget_range,
    expected_timeline, consent, status, source, language, page_path, notified_at, notify_error, created_at, updated_at
    FROM project_leads ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY created_at DESC LIMIT ?${args.length}`;
  const { results } = await env.DB.prepare(sql).bind(...args).all();
  return json({ ok: true, count: results.length, leads: results });
};

export const onRequestPatch = async ({ request, env }) => {
  const denied = await authorise(request, env);
  if (denied) return denied;
  const parsed = await readJson(request, 2048);
  if (parsed.error) return fail(400, "bad_request", "Invalid request.");
  const { id, status } = parsed.data;
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/.test(id) || !STATUSES.includes(status)) {
    return fail(422, "validation", "Provide a valid id and status.");
  }
  const r = await env.DB
    .prepare("UPDATE project_leads SET status = ?2, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?1")
    .bind(id, status).run();
  if (!r.meta || r.meta.changes === 0) return fail(404, "not_found", "Lead not found.");
  return json({ ok: true, id, status });
};
