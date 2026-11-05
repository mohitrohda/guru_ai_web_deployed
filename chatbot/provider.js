/* ============================================================
   GURU chatbot — provider.js
   PROVIDER ADAPTER. The UI only ever calls:
       GURU.chatProvider.getResponse(message, context) → Promise<string>
   Today this delegates to the offline rule engine. To move to a
   real LLM later, add a provider below and change ACTIVE_PROVIDER —
   the UI, context, and datasets stay untouched.
   ============================================================ */

window.GURU = window.GURU || {};

window.GURU.chatProvider = (() => {
  "use strict";

  /* ---------- Provider 1: offline rule engine (active) ---------- */
  const RuleBasedProvider = {
    async getResponse(message /*, context */) {
      const { intent, lang } = window.GURU.chatEngine.resolve(message);
      return window.GURU.chatEngine.render(intent, lang);
    },
  };

  /* ---------- Provider 2: API template (inactive) ----------------
     Point ENDPOINT at a Cloudflare Pages Function (e.g. /api/chat)
     that securely holds your OpenAI / Claude / Gemini / DeepSeek /
     Groq / Cloudflare AI key server-side. NEVER put API keys here.
  ------------------------------------------------------------------ */
  const ApiProvider = {
    ENDPOINT: "/api/chat",
    async getResponse(message, context) {
      const res = await fetch(this.ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          lang: context.lang,
          history: context.turns,
        }),
      });
      if (!res.ok) throw new Error(`Chat API ${res.status}`);
      const data = await res.json();
      return data.reply;
    },
  };

  const ACTIVE_PROVIDER = RuleBasedProvider; // ← swap to ApiProvider later

  const getResponse = async (message, context) => {
    try {
      return await ACTIVE_PROVIDER.getResponse(message, context);
    } catch (err) {
      // Any provider failure degrades gracefully to the rule engine.
      if (ACTIVE_PROVIDER !== RuleBasedProvider) {
        return RuleBasedProvider.getResponse(message, context);
      }
      return "Something went wrong on my side. You can reach the team directly on WhatsApp: +91 80876 95569.";
    }
  };

  return { getResponse };
})();
