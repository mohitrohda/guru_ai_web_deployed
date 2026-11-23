// POST /api/chat  ->  server-side AI assistant (streams Server-Sent Events by default).
// The browser never sees AI_API_KEY; it only talks to this same-origin endpoint.
import { fail, json, readJson, sameOrigin } from "../_lib/http.js";
import { clean } from "../_lib/validate.js";
import { rateLimit } from "../_lib/ratelimit.js";
import { search, company } from "../_lib/retrieve.js";
import { aiConfigured, streamCompletion } from "../_lib/llm.js";
import { CANARY, REFUSAL, buildSystemPrompt, looksLikeExtraction } from "../_lib/prompt.js";

const MAX_MESSAGE_CHARS = 600;
const MAX_HISTORY_TURNS = 8;
const MAX_HISTORY_CHARS = 700;
const MAX_BODY_BYTES = 12 * 1024;
const MARKERS = { "[[START_PROJECT]]": "start_lead", "[[HUMAN]]": "human" };
const MARKER_MAX = Math.max(...Object.keys(MARKERS).map((m) => m.length));

const sse = (obj) => `data: ${JSON.stringify(obj)}\n\n`;

const linksFrom = (hits) => {
  const seen = new Set();
  const out = [];
  for (const h of hits) {
    const u = h.chunk.url;
    if (!u || !u.startsWith("/") || seen.has(u)) continue;
    seen.add(u);
    out.push({ title: h.chunk.title.slice(0, 80), url: u });
    if (out.length === 3) break;
  }
  return out;
};

export const onRequestPost = async (context) => {
  const { request, env } = context;
  if (!sameOrigin(request)) return fail(403, "forbidden_origin", "Cross-origin requests are not allowed.");

  const parsed = await readJson(request, MAX_BODY_BYTES);
  if (parsed.error === "too_large") return fail(413, "too_large", "Request is too large.");
  if (parsed.error) return fail(400, "bad_request", "Invalid request.");
  const body = parsed.data;

  const raw = typeof body.message === "string" ? body.message : "";
  if (raw.length > MAX_MESSAGE_CHARS * 2) return fail(413, "message_too_long", `Please keep messages under ${MAX_MESSAGE_CHARS} characters.`);
  const message = clean(raw, MAX_MESSAGE_CHARS * 2, { multiline: true });
  if (!message) return fail(400, "empty_message", "Please type a message.");
  if (message.length > MAX_MESSAGE_CHARS) return fail(413, "message_too_long", `Please keep messages under ${MAX_MESSAGE_CHARS} characters.`);

  const lang = ["en", "hi", "mr"].includes(body.lang) ? body.lang : "en";
  const wantsStream = body.stream !== false;

  if (!aiConfigured(env)) return fail(503, "ai_unavailable", "The AI service is not configured.");

  const burst = await rateLimit(env, request, "chat", { limit: 20, windowSec: 300 });
  const daily = burst.ok ? await rateLimit(env, request, "chat-day", { limit: 200, windowSec: 86400 }) : burst;
  if (!burst.ok || !daily.ok) {
    return fail(429, "rate_limited", "You're sending messages quickly. Please wait a moment and try again.",
      { "Retry-After": String(burst.ok ? daily.retryAfter : burst.retryAfter) });
  }

  // Untrusted history: only user/assistant text, capped in count and size.
  const history = (Array.isArray(body.history) ? body.history : [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_HISTORY_TURNS)
    .map((m) => ({ role: m.role, content: clean(m.content, MAX_HISTORY_CHARS, { multiline: true }) }))
    .filter((m) => m.content);

  // Prompt-extraction / override attempts get a fixed in-character refusal, with no model call.
  if (looksLikeExtraction(message)) {
    if (!wantsStream) return json({ ok: true, reply: REFUSAL[lang], links: [], action: null, refused: true });
    return new Response(sse({ t: REFUSAL[lang] }) + sse({ done: true, links: [], action: null, refused: true }), {
      headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
    });
  }

  // Retrieval: short follow-ups ("and how long does it take?") borrow the previous user turn for context.
  const prevUser = [...history].reverse().find((m) => m.role === "user");
  const query = message.length < 45 && prevUser ? `${prevUser.content} ${message}` : message;
  const hits = search(query, { limit: 6 });

  const messages = [
    { role: "system", content: buildSystemPrompt({ company, lang, hits }) },
    ...history,
    { role: "user", content: message },
  ];
  const links = linksFrom(hits);

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const enc = new TextEncoder();
  const write = (obj) => writer.write(enc.encode(sse(obj)));

  const run = async () => {
    let full = "";
    let pending = "";
    let action = null;
    let started = false;
    const flush = async (final) => {
      for (const [m, a] of Object.entries(MARKERS)) {
        while (pending.includes(m)) { pending = pending.replace(m, ""); action = action || a; }
      }
      let cut = pending.length;
      if (!final) {
        // Hold back a trailing fragment that could still grow into a marker (e.g. "[[STA").
        for (let i = Math.max(0, pending.length - MARKER_MAX + 1); i < pending.length; i++) {
          const tail = pending.slice(i);
          if (Object.keys(MARKERS).some((m) => m.startsWith(tail))) { cut = i; break; }
        }
      }
      const out = pending.slice(0, cut);
      pending = pending.slice(cut);
      if (out) { started = true; await write({ t: out }); }
    };
    try {
      for await (const delta of streamCompletion(env, messages)) {
        full += delta;
        if (full.includes(CANARY)) throw Object.assign(new Error("canary"), { code: "canary" });
        pending += delta;
        await flush(false);
      }
      await flush(true);
      if (!full.trim()) throw Object.assign(new Error("empty"), { code: "provider_empty" });
      await write({ done: true, links, action });
    } catch (e) {
      if (e.code === "canary") {
        await write({ replace: REFUSAL[lang] });
        await write({ done: true, links: [], action: null, refused: true });
      } else {
        // Tell the client how far we got so it can append a graceful fallback instead of a blank bubble.
        await write({ error: String(e.code || "provider_error").slice(0, 40), partial: started });
      }
    } finally {
      try { await writer.close(); } catch {}
    }
  };

  if (!wantsStream) {
    // Buffered JSON mode (used by tests and non-streaming clients).
    let text = "";
    let action = null;
    try {
      for await (const delta of streamCompletion(env, messages)) {
        text += delta;
        if (text.includes(CANARY)) return json({ ok: true, reply: REFUSAL[lang], links: [], action: null, refused: true });
      }
    } catch (e) {
      const timeout = e.code === "provider_timeout";
      return fail(timeout ? 504 : 502, timeout ? "provider_timeout" : "provider_error", "The AI service is temporarily unavailable.");
    }
    for (const [m, a] of Object.entries(MARKERS)) if (text.includes(m)) { text = text.split(m).join(""); action = action || a; }
    if (!text.trim()) return fail(502, "provider_error", "The AI service returned an empty reply.");
    return json({ ok: true, reply: text.trim(), links, action });
  }

  const job = run();
  if (typeof context.waitUntil === "function") context.waitUntil(job);
  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Content-Type-Options": "nosniff",
      "X-Accel-Buffering": "no",
    },
  });
};

const notAllowed = () => fail(405, "method_not_allowed", "Use POST.", { Allow: "POST" });
export const onRequestGet = notAllowed;
export const onRequestPut = notAllowed;
export const onRequestDelete = notAllowed;
export const onRequestPatch = notAllowed;
