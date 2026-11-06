import { createHmac } from "node:crypto";
import { goals, validateBrief } from "../brief-rules.mjs";

const bodyLimit = 12_000;
const ttl = 900;
const local = new Map();
const provider = "https://api.emailjs.com/api/v1.0/email/send";

const reply = (status, code, extra = {}, headers = {}) => Response.json(
  { ok: status === 200, code, ...extra },
  { status, headers: { "Cache-Control": "no-store", ...headers } },
);

async function readJson(request) {
  if (Number(request.headers.get("content-length")) > bodyLimit) throw new RangeError();
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError();
  const decoder = new TextDecoder();
  let text = "";
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > bodyLimit) {
        await reader.cancel();
        throw new RangeError();
      }
      text += decoder.decode(value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } finally {
    reader.releaseLock();
  }
}

// A shared Redis instance makes limits and idempotency work across deployments.
function contactStore() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url || token) {
    if (!url?.startsWith("https://") || !token) throw new Error("Incomplete contact store configuration");
    const command = async (...args) => {
      const response = await fetch(url, {
        method: "POST",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify(args),
        signal: AbortSignal.timeout(2200),
      });
      if (!response.ok) throw new Error("Contact store unavailable");
      const data = await response.json();
      if (data.error) throw new Error("Contact store command failed");
      return data.result;
    };
    return {
      claim: async (key, value) => await command("SET", key, value, "NX", "EX", ttl) === "OK",
      get: key => command("GET", key),
      set: (key, value) => command("SET", key, value, "EX", ttl),
      delete: key => command("DEL", key),
      increment: key => command("EVAL", "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]); end; return n", 1, key, ttl),
    };
  }

  // Local preview and single-instance fallback. No names or messages are stored.
  const get = key => local.get(key)?.value;
  const now = Date.now();
  for (const [key, record] of local) if (record.until <= now) local.delete(key);
  const set = (key, value) => {
    if (local.size >= 1500 && !local.has(key)) throw new Error("Contact store is full");
    local.set(key, { value, until: now + ttl * 1000 });
  };
  return {
    claim(key, value) {
      if (get(key) !== undefined) return false;
      set(key, value);
      return true;
    },
    get, set,
    delete: key => local.delete(key),
    increment(key) {
      const record = local.get(key);
      if (record) return ++record.value;
      set(key, 1);
      return 1;
    },
  };
}

async function deliver(brief, env) {
  const params = {
    from_name: brief.name,
    name: brief.name,
    reply_to: brief.email,
    email: brief.email,
    from_email: brief.email,
    phone: brief.phone,
    service: brief.service,
    goal: goals[brief.goal],
    message: "Goal: " + goals[brief.goal] + "\n\n" + brief.message,
    to_name: "GURU AI TECHNOLOGIES",
  };
  return fetch(provider, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: env.EMAILJS_SERVICE_ID,
      template_id: env.EMAILJS_TEMPLATE_ID,
      user_id: env.EMAILJS_PUBLIC_KEY,
      accessToken: env.EMAILJS_PRIVATE_KEY,
      template_params: params,
    }),
    redirect: "error",
    signal: AbortSignal.timeout(7000),
  });
}

async function contact(request) {
  if (request.method !== "POST") return reply(405, "method_not_allowed", {}, { Allow: "POST" });
  if (request.headers.get("origin") !== new URL(request.url).origin ||
      ["cross-site", "same-site"].includes(request.headers.get("sec-fetch-site"))) return reply(403, "invalid_origin");
  const contentType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (contentType !== "application/json") return reply(415, "invalid_content_type");

  let raw;
  try {
    raw = await readJson(request);
  } catch (error) {
    return error instanceof RangeError ? reply(413, "too_large") : reply(400, "invalid_request");
  }
  if (!raw || Array.isArray(raw) || typeof raw !== "object" || raw.website !== "" ||
      typeof raw.key !== "string" || !/^[0-9a-f]{32}$/.test(raw.key)) return reply(400, "invalid_request");
  const { values, errors } = validateBrief(raw);
  if (Object.keys(errors).length) return reply(422, "invalid_fields", { fields: errors });

  const env = process.env;
  if (!env.EMAILJS_PUBLIC_KEY || !env.EMAILJS_PRIVATE_KEY ||
      !env.EMAILJS_SERVICE_ID || !env.EMAILJS_TEMPLATE_ID) return reply(503, "delivery_unconfigured");
  const fingerprint = value => createHmac("sha256", env.EMAILJS_PRIVATE_KEY).update(value).digest("hex");
  const digest = fingerprint(JSON.stringify(values));
  const key = "guru:brief:" + raw.key;

  try {
    const store = contactStore();
    if (!await store.claim(key, "pending:" + digest)) {
      const [state, previous] = String(await store.get(key)).split(":");
      if (previous !== digest) return reply(409, "conflicting_brief");
      if (state === "sent") return reply(200, "accepted");
      return reply(409, state === "uncertain" ? "delivery_uncertain" : "delivery_pending");
    }

    const address = request.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim();
    const fromAddress = address ? await store.increment("guru:brief:ip:" + fingerprint(address)) : 0;
    const fromEmail = await store.increment("guru:brief:mail:" + fingerprint(values.email.toLowerCase()));
    if (fromAddress > 8 || fromEmail > 4) {
      await store.delete(key);
      return reply(429, "rate_limited", {}, { "Retry-After": String(ttl) });
    }

    // Network failures can occur after acceptance. Keep the key to prevent a repeat.
    let response;
    try { response = await deliver(values, env); } catch { /* delivery could not be confirmed */ }
    if (!response || response.status >= 500) {
      await store.set(key, "uncertain:" + digest);
      return reply(502, "delivery_uncertain");
    }
    if (!response.ok) {
      await store.delete(key);
      return reply(502, "delivery_rejected");
    }
    await store.set(key, "sent:" + digest);
    return reply(200, "accepted");
  } catch {
    return reply(503, "delivery_unavailable");
  }
}

export default { fetch: contact };
