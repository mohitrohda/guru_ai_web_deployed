/* GURU AI assistant: provider.js
   Chooses between the server-side AI (/api/chat, streamed) and the offline rule engine.
   - The AI key never reaches the browser: this file only talks to same-origin /api/*.
   - Any AI failure (not configured, 5xx, timeout, network) degrades to the rule engine.
   - After two consecutive AI failures the AI is skipped for 60s so visitors never wait on a dead service. */
window.GURU = window.GURU || {};

window.GURU.chatProvider = (() => {
  "use strict";

  const CLIENT_IDLE_TIMEOUT_MS = 25000;
  const BREAKER_FAILS = 2;
  const BREAKER_MS = 60000;

  const INTENT_LINKS = {
    services_overview: [["All services", "/services/"]], capabilities: [["All services", "/services/"]],
    svc_website: [["AI-Powered Websites", "/services/ai-websites"]], svc_chatbot: [["AI Chatbots & Voice", "/services/chatbots-voice"]],
    svc_automation: [["AI Business Automation", "/services/ai-automation"]], svc_software: [["Custom Software", "/services/software-development"]],
    svc_mobile: [["Mobile Apps", "/services/mobile-apps"]], svc_billing: [["Billing Software", "/services/billing-software"]],
    svc_marketing: [["Digital Marketing", "/services/digital-marketing"]], svc_consulting: [["AI Consulting", "/services/ai-consulting"]],
    svc_cloud: [["Cloud & DevOps", "/services/cloud-devops"]], svc_security: [["Cyber Security", "/services/cyber-security"]],
    industries: [["Industries", "/industries/"]], portfolio: [["Case studies", "/case-studies/"]],
    about_company: [["About us", "/about"]], who_are_you: [["About us", "/about"]], why_choose: [["About us", "/about"]],
    data_safety: [["Privacy policy", "/legal/privacy"]],
    pricing: [["Request a quote", "/#contact"]], contact: [["Contact form", "/#contact"]], get_started: [["Contact form", "/#contact"]],
  };

  const state = { config: null, loading: null, fails: 0, pausedUntil: 0 };

  const loadConfig = () => {
    if (state.config) return Promise.resolve(state.config);
    if (state.loading) return state.loading;
    state.loading = (async () => {
      try {
        const ctl = new AbortController();
        const t = setTimeout(() => ctl.abort(), 4000);
        const res = await fetch("/api/config", { cache: "no-store", signal: ctl.signal });
        clearTimeout(t);
        const j = res.ok ? await res.json() : null;
        state.config = j && j.ok ? { ai: !!j.ai, leads: !!j.leads, turnstileSiteKey: j.turnstileSiteKey || null } : { ai: false, leads: false, turnstileSiteKey: null };
      } catch {
        state.config = { ai: false, leads: false, turnstileSiteKey: null }; // static preview / offline: rules only
      }
      return state.config;
    })();
    return state.loading;
  };

  /* ------------------------------ rule engine ------------------------------ */
  const ruleReply = (message) => {
    const E = window.GURU.chatEngine;
    const { intent, lang } = E.resolve(message);
    const text = E.render(intent, lang);
    const links = ((intent && INTENT_LINKS[intent.id]) || []).map(([title, url]) => ({ title, url }));
    return { text, links, action: null, source: "rules", intentId: intent ? intent.id : null, lang, isFallback: !!intent && intent.id === "fallback" };
  };

  /* --------------------------------- AI ------------------------------------ */
  const parseSse = async (res, onEvent) => {
    if (!res.body || !res.body.getReader) {
      for (const block of (await res.text()).split("\n\n")) if (block.startsWith("data: ")) onEvent(JSON.parse(block.slice(6)));
      return;
    }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf("\n\n")) >= 0) {
        const block = buf.slice(0, i); buf = buf.slice(i + 2);
        if (block.startsWith("data: ")) { try { onEvent(JSON.parse(block.slice(6))); } catch { /* ignore bad frame */ } }
      }
    }
  };

  const askAi = async (message, lang, history, { onToken, onReplace }) => {
    const ctl = new AbortController();
    let idle = setTimeout(() => ctl.abort(), CLIENT_IDLE_TIMEOUT_MS);
    const bump = () => { clearTimeout(idle); idle = setTimeout(() => ctl.abort(), CLIENT_IDLE_TIMEOUT_MS); };
    let res;
    try {
      res = await fetch("/api/chat", {
        method: "POST", signal: ctl.signal, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, lang, history, stream: true }),
      });
    } catch (e) { clearTimeout(idle); throw { code: ctl.signal.aborted ? "timeout" : "network" }; }
    if (res.status === 429) { clearTimeout(idle); throw { code: "rate_limited", retryAfter: Number(res.headers.get("Retry-After")) || 60 }; }
    if (res.status === 413 || res.status === 400) { clearTimeout(idle); let j = {}; try { j = await res.json(); } catch {} throw { code: j.error || "bad_request", message: j.message }; }
    if (!res.ok) { clearTimeout(idle); throw { code: "http_" + res.status }; }

    let text = "", links = [], action = null, err = null, finished = false, refused = false;
    try {
      await parseSse(res, (ev) => {
        bump();
        if (typeof ev.t === "string") { text += ev.t; onToken(ev.t, text); }
        else if (typeof ev.replace === "string") { text = ev.replace; onReplace(text); }
        else if (ev.done) { finished = true; links = ev.links || []; action = ev.action || null; refused = !!ev.refused; }
        else if (ev.error) err = ev;
      });
    } catch { err = err || { error: ctl.signal.aborted ? "timeout" : "stream" }; }
    clearTimeout(idle);
    if (!finished && !text) throw { code: (err && err.error) || "empty" };
    return { text, links, action, partial: !finished, refused };
  };

  /**
   * respond(message, {lang, history, onToken, onReplace}) resolves to
   *   { text, links, action, source: "ai" | "rules", degraded?, partial?, rateLimited?, retryAfter? }
   */
  const respond = async (message, { lang, history, onToken = () => {}, onReplace = () => {}, forceRules = false } = {}) => {
    const cfg = await loadConfig();
    const paused = Date.now() < state.pausedUntil;
    if (forceRules || !cfg.ai || paused) {
      const r = ruleReply(message);
      return { ...r, degraded: cfg.ai && paused };
    }
    try {
      const r = await askAi(message, lang, history, { onToken, onReplace });
      state.fails = 0;
      return { text: r.text, links: r.links, action: r.action, source: "ai", partial: r.partial, refused: r.refused };
    } catch (e) {
      if (e && e.code === "rate_limited") return { text: "", links: [], action: null, source: "none", rateLimited: true, retryAfter: e.retryAfter };
      if (e && (e.code === "message_too_long" || e.code === "empty_message")) return { text: e.message || "", links: [], action: null, source: "none", invalid: true };
      state.fails += 1;
      if (state.fails >= BREAKER_FAILS) state.pausedUntil = Date.now() + BREAKER_MS;
      const r = ruleReply(message);
      return { ...r, degraded: true };
    }
  };

  /* ------------------------------- lead submit ------------------------------ */
  const submitLead = async (payload, turnstileToken) => {
    try {
      const res = await fetch("/api/leads", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, turnstile_token: turnstileToken || undefined }),
      });
      let json = null;
      try { json = await res.json(); } catch { /* non-JSON error page */ }
      return { ok: res.ok && !!(json && json.ok), status: res.status, json };
    } catch {
      return { ok: false, status: 0, json: null };
    }
  };

  // Backward-compatible API used by older callers.
  const getResponse = async (message) => ruleReply(message).text;

  return { respond, loadConfig, submitLead, getResponse, ruleReply, getConfig: () => state.config };
})();
