// POST /api/leads  ->  persist a CONFIRMED project enquiry to Cloudflare D1 and notify the sales team.
// A success response is only returned after the row has really been written.
import { fail, json, readJson, sameOrigin, sha256Hex } from "../_lib/http.js";
import { validateLead } from "../_lib/validate.js";
import { rateLimit } from "../_lib/ratelimit.js";
import { turnstileEnabled, verifyTurnstile } from "../_lib/turnstile.js";
import { sendLeadNotification } from "../_lib/email.js";

const MAX_BODY_BYTES = 10 * 1024;
const refOf = (id) => `GURU-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;

export const onRequestPost = async (context) => {
  const { request, env } = context;
  if (!sameOrigin(request)) return fail(403, "forbidden_origin", "Cross-origin requests are not allowed.");

  const parsed = await readJson(request, MAX_BODY_BYTES);
  if (parsed.error === "too_large") return fail(413, "too_large", "Request is too large.");
  if (parsed.error) return fail(400, "bad_request", "Invalid request.");
  const body = parsed.data;

  // Honeypot: real visitors never fill this. Bots get a harmless fake success and nothing is stored.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return json({ ok: true, ref: "GURU-IGNORED", ignored: true });
  }

  const rl = await rateLimit(env, request, "lead", { limit: 5, windowSec: 3600 });
  if (!rl.ok) {
    return fail(429, "rate_limited", "Too many enquiries from this connection. Please try again later or contact us on WhatsApp.",
      { "Retry-After": String(rl.retryAfter) });
  }

  const checked = validateLead(body);
  if (checked.errors) return json({ ok: false, error: "validation", fields: checked.errors }, 422);
  const lead = checked.value;

  if (!env.DB) {
    return fail(503, "storage_unavailable", "Enquiries cannot be saved right now. Please contact us on WhatsApp or by email.");
  }

  if (turnstileEnabled(env)) {
    const t = await verifyTurnstile(env, body.turnstile_token, request);
    if (!t.ok) return fail(403, "captcha_failed", "Spam check failed. Please try again.");
  }

  try {
    // 1) Same idempotency key = same click/retry: return the original record.
    if (lead.idempotency_key) {
      const prior = await env.DB.prepare("SELECT id FROM project_leads WHERE idempotency_key = ?1").bind(lead.idempotency_key).first();
      if (prior) return json({ ok: true, id: prior.id, ref: refOf(prior.id), duplicate: true, notification: "already_handled" });
    }
    // 2) Same person + same service + same brief within 24h = duplicate.
    const dedupe = await sha256Hex(
      `${lead.email}|${lead.service}|${lead.project_description.toLowerCase().replace(/\s+/g, " ").slice(0, 200)}`
    );
    const dup = await env.DB
      .prepare("SELECT id FROM project_leads WHERE dedupe_hash = ?1 AND created_at > strftime('%Y-%m-%dT%H:%M:%fZ','now','-1 day') LIMIT 1")
      .bind(dedupe).first();
    if (dup) return json({ ok: true, id: dup.id, ref: refOf(dup.id), duplicate: true, notification: "already_handled" });

    const id = crypto.randomUUID();
    try {
      await env.DB
        .prepare(
          "INSERT INTO project_leads (id, name, company, email, phone, service, project_description, requirements, " +
          "budget_range, expected_timeline, consent, consent_text, status, source, language, page_path, idempotency_key, dedupe_hash) " +
          "VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,1,?11,'new','website-chatbot',?12,?13,?14,?15)"
        )
        .bind(id, lead.name, lead.company || null, lead.email, lead.phone, lead.service, lead.project_description,
          lead.requirements || null, lead.budget_range || null, lead.expected_timeline || null, lead.consent_text || null,
          lead.language, lead.page_path, lead.idempotency_key, dedupe)
        .run();
    } catch (e) {
      // Race: a parallel request with the same idempotency key won. Treat as duplicate, not an error.
      if (lead.idempotency_key && /UNIQUE/i.test(String(e && e.message))) {
        const prior = await env.DB.prepare("SELECT id FROM project_leads WHERE idempotency_key = ?1").bind(lead.idempotency_key).first();
        if (prior) return json({ ok: true, id: prior.id, ref: refOf(prior.id), duplicate: true, notification: "already_handled" });
      }
      throw e;
    }

    // The enquiry is now durably stored. Email is best-effort and never blocks or fakes the result.
    const note = await sendLeadNotification(env, { ...lead, ref: refOf(id) });
    try {
      if (note.status === "sent") {
        await env.DB.prepare("UPDATE project_leads SET notified_at = strftime('%Y-%m-%dT%H:%M:%fZ','now'), updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?1").bind(id).run();
      } else if (note.status === "failed") {
        await env.DB.prepare("UPDATE project_leads SET notify_error = ?2, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?1").bind(id, note.error || "failed").run();
      }
    } catch { /* bookkeeping only */ }

    return json({ ok: true, id, ref: refOf(id), duplicate: false, notification: note.status }, 201);
  } catch (e) {
    console.error("lead_save_failed", String(e && e.message ? e.message : e).slice(0, 200));
    return fail(500, "save_failed", "We could not save your enquiry. Please contact us on WhatsApp or by email.");
  }
};

const notAllowed = () => fail(405, "method_not_allowed", "Use POST.", { Allow: "POST" });
export const onRequestGet = notAllowed;
export const onRequestPut = notAllowed;
export const onRequestDelete = notAllowed;
export const onRequestPatch = notAllowed;
