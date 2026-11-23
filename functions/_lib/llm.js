// OpenAI-compatible chat-completions client (works with OpenAI, Groq, DeepSeek, OpenRouter, Together,
// Azure OpenAI-compatible gateways, Cloudflare AI Gateway, local Ollama/vLLM ...). Streaming via SSE.

export const aiConfigured = (env) => Boolean(env.AI_API_KEY);

const endpoint = (env) => {
  const base = String(env.AI_API_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
  const u = new URL(`${base}/chat/completions`);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname);
  if (u.protocol !== "https:" && !local) throw Object.assign(new Error("insecure_base_url"), { code: "config" });
  return u.toString();
};

const timeoutMs = (env) => {
  const n = Number(env.AI_TIMEOUT_MS);
  return Number.isFinite(n) && n >= 1000 && n <= 60000 ? n : 15000;
};

/** Async generator yielding text deltas. Throws Error{code} on provider failure/timeouts. */
export async function* streamCompletion(env, messages) {
  const ctrl = new AbortController();
  const limit = timeoutMs(env);
  let timer = setTimeout(() => ctrl.abort("timeout"), limit);
  const bump = () => { clearTimeout(timer); timer = setTimeout(() => ctrl.abort("timeout"), limit); };
  let res;
  try {
    res = await fetch(endpoint(env), {
      method: "POST",
      signal: ctrl.signal,
      headers: { Authorization: `Bearer ${env.AI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: env.AI_MODEL || "gpt-4o-mini",
        messages,
        stream: true,
        temperature: 0.3,
        max_tokens: 450,
      }),
    });
  } catch (e) {
    clearTimeout(timer);
    throw Object.assign(new Error("provider_unreachable"), { code: ctrl.signal.aborted ? "provider_timeout" : (e.code || "provider_unreachable") });
  }
  if (!res.ok || !res.body) {
    clearTimeout(timer);
    try { await res.body?.cancel(); } catch {}
    throw Object.assign(new Error(`provider_http_${res.status}`), { code: `provider_http_${res.status}` });
  }

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  try {
    for (;;) {
      bump();
      let chunk;
      try {
        chunk = await reader.read();
      } catch {
        throw Object.assign(new Error("provider_timeout"), { code: ctrl.signal.aborted ? "provider_timeout" : "provider_stream" });
      }
      if (chunk.done) break;
      buf += dec.decode(chunk.value, { stream: true });
      let nl;
      while ((nl = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (data === "[DONE]") return;
        try {
          const delta = JSON.parse(data)?.choices?.[0]?.delta?.content;
          if (typeof delta === "string" && delta) yield delta;
        } catch { /* ignore keep-alive / malformed lines */ }
      }
    }
  } finally {
    clearTimeout(timer);
    try { await reader.cancel(); } catch {}
  }
}
