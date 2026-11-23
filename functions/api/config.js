// GET /api/config  ->  tells the browser which optional features are live. Exposes booleans and the
// PUBLIC Turnstile site key only; never secrets.
import { json } from "../_lib/http.js";
import { aiConfigured } from "../_lib/llm.js";
import { kbMeta } from "../_lib/retrieve.js";

export const onRequestGet = async ({ env }) =>
  json({
    ok: true,
    ai: aiConfigured(env),
    leads: Boolean(env.DB),
    turnstileSiteKey: env.TURNSTILE_SECRET_KEY && env.TURNSTILE_SITE_KEY ? env.TURNSTILE_SITE_KEY : null,
    kb: kbMeta,
  }, 200, { "Cache-Control": "no-store" });
