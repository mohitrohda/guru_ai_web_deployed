// Shared HTTP helpers for GURU AI Pages Functions.

const BASE_HEADERS = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
};

export const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...BASE_HEADERS, ...extra },
  });

export const fail = (status, code, message, extra = {}) =>
  json({ ok: false, error: code, message }, status, extra);

/** Reject cross-origin browser requests. Same-origin fetches always send a matching Origin. */
export const sameOrigin = (request) => {
  const origin = request.headers.get("Origin");
  if (!origin) return true; // non-browser client (curl, server-to-server); still rate limited
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
};

/** Read a JSON body with a hard byte cap (does not trust Content-Length alone). */
export const readJson = async (request, maxBytes) => {
  const declared = Number(request.headers.get("Content-Length") || 0);
  if (declared > maxBytes) return { error: "too_large" };
  const ct = request.headers.get("Content-Type") || "";
  if (!ct.toLowerCase().includes("application/json")) return { error: "bad_content_type" };
  let text;
  try {
    const reader = request.body.getReader();
    const chunks = [];
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        try { await reader.cancel(); } catch {}
        return { error: "too_large" };
      }
      chunks.push(value);
    }
    const buf = new Uint8Array(total);
    let off = 0;
    for (const c of chunks) { buf.set(c, off); off += c.byteLength; }
    text = new TextDecoder().decode(buf);
  } catch {
    return { error: "bad_body" };
  }
  try {
    const data = JSON.parse(text);
    if (data === null || typeof data !== "object" || Array.isArray(data)) return { error: "bad_json" };
    return { data };
  } catch {
    return { error: "bad_json" };
  }
};

export const sha256Hex = async (text) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
};

/** Constant-time string comparison (hash both sides first so length does not leak). */
export const safeEqual = async (a, b) => {
  const [ha, hb] = await Promise.all([sha256Hex(String(a)), sha256Hex(String(b))]);
  let diff = 0;
  for (let i = 0; i < ha.length; i++) diff |= ha.charCodeAt(i) ^ hb.charCodeAt(i);
  return diff === 0;
};

export const clientIp = (request) =>
  request.headers.get("CF-Connecting-IP") ||
  (request.headers.get("X-Forwarded-For") || "").split(",")[0].trim() ||
  "unknown";
