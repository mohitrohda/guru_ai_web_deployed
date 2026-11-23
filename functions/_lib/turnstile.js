// Cloudflare Turnstile server-side verification.
import { clientIp } from "./http.js";

export const turnstileEnabled = (env) => Boolean(env.TURNSTILE_SECRET_KEY);

export const verifyTurnstile = async (env, token, request) => {
  if (!turnstileEnabled(env)) return { ok: true, skipped: true };
  if (!token || typeof token !== "string" || token.length > 2048) return { ok: false };
  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET_KEY);
  form.append("response", token);
  form.append("remoteip", clientIp(request));
  const url = env.TURNSTILE_VERIFY_URL || "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  try {
    const res = await fetch(url, { method: "POST", body: form, signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    return { ok: data.success === true };
  } catch {
    return { ok: false, unreachable: true };
  }
};
