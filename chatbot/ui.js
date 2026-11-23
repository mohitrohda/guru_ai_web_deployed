/* GURU AI assistant: ui.js
   "GURU AI: Intelligent Business Assistant". Launcher, window, streaming messages, quick replies,
   project-intake flow rendering, human hand-off and Turnstile. Talks to the backend only through
   GURU.chatProvider; all user text is inserted as text, never as HTML. */
window.GURU = window.GURU || {};

window.GURU.chatbot = (() => {
  "use strict";

  const { escapeHTML, prefersReducedMotion, safeHref } = window.GURU.chatUtil;
  const ctx = () => window.GURU.chatContext;
  const LF = () => window.GURU.leadFlow;
  const PR = () => window.GURU.chatProvider;

  const PHONE_E164 = "918087695569";
  const PHONE_DISPLAY = "+91 80876 95569";
  const EMAIL = "contact@guruaitechnologies.com";
  const MAX_INPUT = 500;

  const CHIPS = {
    en: [["Our services", "What services do you offer?"], ["Start a project", "__start"], ["Pricing", "How does pricing work?"], ["How you work", "How do you work?"], ["Talk to a person", "__human"]],
    hi: [["Hamari services", "Aap kaun si services dete hain?"], ["Project shuru karein", "__start"], ["Pricing", "Pricing kaise hoti hai?"], ["Kaise kaam karte hain", "Aap kaise kaam karte hain?"], ["Insaan se baat", "__human"]],
    mr: [["Amchya services", "Tumhi konti services deta?"], ["Project suru kara", "__start"], ["Pricing", "Pricing kashi asate?"], ["Kasa kaam karta", "Tumhi kasa kaam karta?"], ["Vyaktishi bola", "__human"]],
  };

  const UI = {
    en: { greeting: "Hi, I'm GURU AI, the assistant for GURU AI Technologies. Ask me about our services, how we work, or how to start a project. I can answer in English, Hinglish or Roman Marathi.", ai: "Available 24/7 · team on WhatsApp", offline: "AI is briefly unavailable. Answering from our FAQ.", rate: (s) => `You're sending messages quickly. Please wait about ${s} seconds and try again.`, tooLong: `Please keep messages under ${MAX_INPUT} characters.`, related: "Related pages", cut: "(The connection was interrupted. Please ask again, or contact the team.)", unknownHand: "I'm not certain about that one. The team can confirm it directly:", note: "AI assistant: answers may be imperfect. Please don't share passwords or payment details." },
    hi: { greeting: "Namaste, main GURU AI hoon, GURU AI Technologies ka assistant. Services, kaam karne ka tareeka, ya project shuru karne ke baare mein poochiye. Main English, Hinglish ya Roman Marathi mein jawab de sakta hoon.", ai: "24/7 uplabdh · team WhatsApp par", offline: "AI abhi thodi der ke liye uplabdh nahi hai. FAQ se jawab de raha hoon.", rate: (s) => `Aap bahut tezi se message bhej rahe hain. Kripya lagbhag ${s} second ruk kar dobara koshish kijiye.`, tooLong: `Kripya message ${MAX_INPUT} characters se chhota rakhiye.`, related: "Related pages", cut: "(Connection beech mein toot gaya. Dobara poochiye ya team se sampark kijiye.)", unknownHand: "Mujhe iske baare mein pakka nahi pata. Team seedha confirm kar sakti hai:", note: "AI assistant: jawab galat bhi ho sakte hain. Kripya password ya payment details share na karein." },
    mr: { greeting: "Namaskar, mi GURU AI, GURU AI Technologies cha assistant. Services, kaam karaychi paddhat kinva project kasa suru karaycha te vichara. Mi English, Hinglish kinva Roman Marathi madhe uttar deu shakto.", ai: "24/7 uplabdh · team WhatsApp var", offline: "AI thodya velasathi uplabdh nahi. FAQ madhun uttar det ahe.", rate: (s) => `Tumhi khup veg-ane message pathvat ahat. Krupaya sudharan ${s} second thamba ani parat prayatna kara.`, tooLong: `Krupaya message ${MAX_INPUT} characters peksha chhota theva.`, related: "Related pages", cut: "(Connection madhech tutla. Parat vichara kinva team shi sampark kara.)", unknownHand: "Mala yabaddal khatri nahi. Team thet confirm karu shakte:", note: "AI assistant: uttare chukiche asu shaktat. Krupaya password kinva payment details share karu naka." },
  };
  const U = () => UI[ctx().get().lang] || UI.en;

  const SEND_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>';

  let launcher, win, log, input, chipsEl, sendBtn, liveEl, statusEl, noteEl, counterEl;
  let initialised = false, opened = false, busy = false, greeted = false, lastFocus = null, teaserTimers = [];
  let tsScript = null;

  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

  /* ------------------------- safe rich-text rendering ----------------------- */
  const renderRich = (raw) => {
    let s = escapeHTML(raw);
    s = s.replace(/\[([^\]\n]{1,80})\]\((\/[^)\s]*|https:\/\/wa\.me\/[^)\s]*|mailto:[^)\s]*|tel:[^)\s]*)\)/g, (m, label, url) => {
      const href = safeHref(url.replace(/&amp;/g, "&"));
      return href ? `<a href="${escapeHTML(href)}"${/^https?:/.test(href) ? ' target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>` : label;
    });
    s = s.replace(/\*\*([^*\n]{1,120})\*\*/g, "<strong>$1</strong>");
    s = s.replace(/(^|[\s(>])((?:contact|sales|support)@guruaitechnologies\.com)\b/g, (m, a, e) => `${a}<a href="mailto:${e}">${e}</a>`);
    s = s.replace(/(^|[\s(>])\+91[\s-]?80876[\s-]?95569\b/g, (m, a) => `${a}<a href="https://wa.me/${PHONE_E164}" target="_blank" rel="noopener noreferrer">${PHONE_DISPLAY}</a>`);
    const lines = s.split("\n");
    const out = [];
    let inList = false;
    for (const ln of lines) {
      const li = ln.match(/^\s*[-•]\s+(.*)$/);
      if (li) { if (!inList) { out.push("<ul>"); inList = true; } out.push(`<li>${li[1]}</li>`); }
      else { if (inList) { out.push("</ul>"); inList = false; } out.push(ln.trim() ? `<p>${ln}</p>` : ""); }
    }
    if (inList) out.push("</ul>");
    return out.join("");
  };

  /* --------------------------------- build ---------------------------------- */
  const build = () => {
    launcher = el("button", "gc-launcher");
    launcher.type = "button";
    launcher.setAttribute("aria-label", "Open GURU AI chat assistant");
    launcher.setAttribute("aria-haspopup", "dialog");
    launcher.setAttribute("aria-expanded", "false");
    launcher.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z"/><path d="M8 9h8M8 13h5"/></svg>';
    const teaser = el("span", "gc-teaser");
    teaser.setAttribute("aria-hidden", "true");
    teaser.innerHTML = '<span class="gc-teaser__title">Questions? Ask GURU AI</span><span class="gc-teaser__cta">Chat now</span>';
    launcher.appendChild(teaser);

    win = el("section", "gc-window");
    win.id = "gc-window";
    win.setAttribute("role", "dialog");
    win.setAttribute("aria-labelledby", "gc-title");
    win.setAttribute("aria-modal", "false");
    win.hidden = false;
    win.innerHTML =
      '<header class="gc-head">' +
        '<div class="gc-head__avatar" aria-hidden="true">G</div>' +
        '<div class="gc-head__meta"><h2 class="gc-head__name" id="gc-title">GURU AI</h2>' +
        '<p class="gc-head__sub">Intelligent Business Assistant</p><p class="gc-head__status"></p></div>' +
        '<button type="button" class="gc-iconbtn gc-human" aria-label="Talk to a person" title="Talk to a person"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></button>' +
        '<button type="button" class="gc-iconbtn gc-close" aria-label="Close chat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
      '</header>' +
      '<div class="gc-log" tabindex="0" aria-label="Conversation"></div>' +
      '<div class="gc-chips" role="group" aria-label="Suggested replies"></div>' +
      '<form class="gc-composer" autocomplete="off">' +
        '<label class="gc-sr" for="gc-input">Type your message</label>' +
        '<textarea id="gc-input" class="gc-input" rows="1" maxlength="' + MAX_INPUT + '" placeholder="Type your question…" enterkeyhint="send"></textarea>' +
        '<button type="submit" class="gc-send" aria-label="Send message">' + SEND_ICON + '</button>' +
      '</form>' +
      '<p class="gc-note"><span class="gc-note__text"></span> <a href="/legal/privacy">Privacy</a> <span class="gc-counter" aria-live="off"></span></p>' +
      '<div class="gc-sr" aria-live="polite" aria-atomic="true" id="gc-live"></div>';

    const q = (s) => win.querySelector(s);
    log = q(".gc-log"); chipsEl = q(".gc-chips"); input = q(".gc-input"); sendBtn = q(".gc-send");
    liveEl = q("#gc-live"); statusEl = q(".gc-head__status"); noteEl = q(".gc-note__text"); counterEl = q(".gc-counter");

    const host = document.getElementById("float-stack") || document.body;
    host.appendChild(launcher);
    document.body.appendChild(win);

    launcher.addEventListener("click", () => (opened ? close() : open()));
    q(".gc-close").addEventListener("click", close);
    q(".gc-human").addEventListener("click", () => handoff());
    q(".gc-composer").addEventListener("submit", (e) => { e.preventDefault(); submitInput(); });
    input.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); submitInput(); } });
    input.addEventListener("input", () => {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 112) + "px";
      counterEl.textContent = input.value.length >= MAX_INPUT - 80 ? `${input.value.length}/${MAX_INPUT}` : "";
    });
    win.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { e.stopPropagation(); close(); return; }
      if (e.key === "Tab" && isFullScreen()) {
        const f = [...win.querySelectorAll('button:not([disabled]), a[href], textarea, [tabindex="0"]')].filter((n) => n.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    if (window.visualViewport) {
      const fit = () => win.style.setProperty("--gc-vh", window.visualViewport.height + "px");
      window.visualViewport.addEventListener("resize", fit); fit();
    }
    scheduleTeaser(teaser);
  };

  const isFullScreen = () => window.matchMedia("(max-width: 559px)").matches;

  const scheduleTeaser = (teaser) => {
    let seen = false;
    try { seen = sessionStorage.getItem("guru_chat_teaser") === "1"; } catch { /* storage blocked */ }
    if (seen) return;
    teaserTimers.push(setTimeout(() => { if (!opened) teaser.classList.add("is-visible"); }, 4000));
    teaserTimers.push(setTimeout(() => teaser.classList.remove("is-visible"), 10000));
    try { sessionStorage.setItem("guru_chat_teaser", "1"); } catch { /* ignore */ }
  };

  /* -------------------------------- open/close ------------------------------ */
  const open = async () => {
    if (opened) return;
    opened = true; lastFocus = document.activeElement;
    teaserTimers.forEach(clearTimeout);
    launcher.querySelector(".gc-teaser").classList.remove("is-visible");
    win.classList.add("is-open");
    launcher.setAttribute("aria-expanded", "true");
    launcher.setAttribute("aria-label", "Close GURU AI chat assistant");
    if (isFullScreen()) { win.setAttribute("aria-modal", "true"); document.documentElement.classList.add("gc-lock"); }
    if (!greeted) {
      greeted = true;
      const cfg = await PR().loadConfig();
      statusEl.textContent = U().ai;
      noteEl.textContent = U().note;
      botSay(U().greeting, { chips: true });
    }
    setTimeout(() => input.focus(), 30);
  };
  const close = () => {
    if (!opened) return;
    opened = false;
    win.classList.remove("is-open");
    win.setAttribute("aria-modal", "false");
    document.documentElement.classList.remove("gc-lock");
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-label", "Open GURU AI chat assistant");
    (lastFocus && lastFocus.focus ? lastFocus : launcher).focus();
  };

  /* -------------------------------- messages -------------------------------- */
  const nearBottom = () => log.scrollHeight - log.scrollTop - log.clientHeight < 90;
  const scrollDown = (force) => { if (force || nearBottom()) log.scrollTop = log.scrollHeight; };

  const addUser = (text) => {
    const m = el("div", "gc-msg gc-msg--user"); m.textContent = text;
    log.appendChild(m); scrollDown(true);
  };
  const newBot = () => {
    const m = el("div", "gc-msg gc-msg--bot");
    const body = el("div", "gc-msg__body"); m.appendChild(body);
    log.appendChild(m); return { m, body, raw: "" };
  };
  const setBotText = (b, raw) => { b.raw = raw; b.body.innerHTML = renderRich(raw); scrollDown(); };
  const announce = (text) => { liveEl.textContent = ""; setTimeout(() => (liveEl.textContent = text.replace(/\s+/g, " ").slice(0, 400)), 40); };

  const linkChips = (b, links) => {
    const safe = (links || []).filter((l) => safeHref(l.url));
    if (!safe.length) return;
    const wrap = el("div", "gc-links");
    wrap.appendChild(el("span", "gc-links__label", U().related));
    safe.forEach((l) => { const a = el("a", "gc-link", l.title); a.href = safeHref(l.url); wrap.appendChild(a); });
    b.m.appendChild(wrap); scrollDown();
  };

  const showTyping = () => {
    const t = el("div", "gc-msg gc-msg--bot gc-typing"); t.setAttribute("role", "status"); t.setAttribute("aria-label", "GURU AI is typing");
    t.innerHTML = "<span></span><span></span><span></span>"; log.appendChild(t); scrollDown(true); return t;
  };

  const setChips = (items) => {
    chipsEl.textContent = "";
    (items || []).forEach((c) => {
      const b = el("button", "gc-chip" + (c.primary ? " gc-chip--primary" : ""), c.label);
      b.type = "button";
      b.addEventListener("click", () => handleSend(c.value, c.label));
      chipsEl.appendChild(b);
    });
    chipsEl.hidden = !items || !items.length;
  };
  const defaultChips = () => (CHIPS[ctx().get().lang] || CHIPS.en).map(([label, value]) => ({ label, value }));

  const botSay = (text, { chips, links, card } = {}) => {
    const b = newBot(); setBotText(b, text); announce(text);
    if (links) linkChips(b, links);
    if (card === "handoff") handoffCard();
    if (chips === true) setChips(defaultChips()); else if (Array.isArray(chips)) setChips(chips);
    ctx().remember("assistant", text);
    scrollDown(true);
    return b;
  };

  const waLink = (extra) => `https://wa.me/${PHONE_E164}?text=${encodeURIComponent("Hello GURU AI TECHNOLOGIES, I'd like to discuss a project." + (extra ? " " + extra : ""))}`;
  const handoffCard = () => {
    const c = el("div", "gc-card");
    c.appendChild(el("p", "gc-card__title", "Talk to the GURU AI team"));
    const rows = [
      ["WhatsApp", waLink(), "gc-btn gc-btn--primary", true],
      ["Email", "mailto:" + EMAIL, "gc-btn", false],
      ["Call " + PHONE_DISPLAY, "tel:+" + PHONE_E164, "gc-btn", false],
      ["Contact form", "/#contact", "gc-btn", false],
    ];
    const grid = el("div", "gc-card__actions");
    rows.forEach(([label, href, cls, ext]) => { const a = el("a", cls, label); a.href = href; if (ext) { a.target = "_blank"; a.rel = "noopener noreferrer"; } grid.appendChild(a); });
    c.appendChild(grid);
    c.appendChild(el("p", "gc-card__hours", "Mon–Sat, 10 AM – 7 PM IST. The team replies within 24 hours."));
    log.appendChild(c); scrollDown(true);
  };
  const humanIntro = () => (LF().T[ctx().get().lang] || LF().T.en).human;
  const handoff = (text) => { if (!opened) open(); botSay(text || humanIntro(), { chips: true, card: "handoff" }); };

  /* ---------------------------- Cloudflare Turnstile ------------------------- */
  const loadTurnstile = () => new Promise((resolve, reject) => {
    if (window.turnstile) return resolve();
    if (!tsScript) {
      tsScript = document.createElement("script");
      tsScript.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      tsScript.async = true;
    }
    tsScript.addEventListener("load", () => resolve());
    tsScript.addEventListener("error", () => reject(new Error("turnstile_load")));
    if (!tsScript.parentNode) document.head.appendChild(tsScript);
  });
  const getTurnstileToken = async (siteKey) => {
    await loadTurnstile();
    return new Promise((resolve, reject) => {
      const box = el("div", "gc-captcha"); log.appendChild(box); scrollDown(true);
      let done = false;
      const timer = setTimeout(() => { if (!done) { done = true; box.remove(); reject(new Error("timeout")); } }, 90000);
      window.turnstile.render(box, {
        sitekey: siteKey, theme: "light", size: box.clientWidth >= 300 ? "flexible" : "compact",
        callback: (t) => { if (!done) { done = true; clearTimeout(timer); box.remove(); resolve(t); } },
        "error-callback": () => { if (!done) { done = true; clearTimeout(timer); box.remove(); reject(new Error("captcha")); } },
        "expired-callback": () => {},
      });
    });
  };

  /* ---------------------------- lead flow rendering ------------------------- */
  const renderLead = (out) => {
    (out.say || []).forEach((t, i, arr) => {
      const last = i === arr.length - 1;
      const b = botSay(t, { chips: last ? (out.chips || []) : undefined });
      if (/\n/.test(t)) b.m.classList.add("gc-msg--summary");
    });
    if (out.card === "handoff" || out.handoff) handoffCard();
    if (out.success) handoffCard();
    if (out.ended && !out.chips.length) setChips(defaultChips());
  };

  const doSubmit = async (lang) => {
    const lf = LF();
    if (lf.isSubmitting()) return;
    lf.setSubmitting(true);
    setBusy(true);
    const T = lf.T[lang] || lf.T.en;
    const cfg = PR().getConfig() || {};
    let token = null;
    try {
      if (cfg.turnstileSiteKey) { botSay(T.captchaIntro); token = await getTurnstileToken(cfg.turnstileSiteKey); }
    } catch {
      lf.setSubmitting(false); setBusy(false);
      renderLead(lf.onSubmitResult(lang, { ok: false, status: 403, json: { error: "captcha_failed" } }));
      return;
    }
    const typing = showTyping();
    const payload = lf.buildPayload(lang, location.pathname);
    const res = await PR().submitLead(payload, token);
    typing.remove();
    setBusy(false);
    renderLead(lf.onSubmitResult(lang, res));
  };

  const startLead = async (seed) => {
    const lang = ctx().get().lang;
    const cfg = await PR().loadConfig();
    if (!cfg.leads) { botSay((LF().T[lang] || LF().T.en).unavailable, { chips: true, card: "handoff" }); return; }
    renderLead(LF().start(seed, lang));
  };

  /* ---------------------------------- send ----------------------------------- */
  const setBusy = (v) => {
    busy = v; sendBtn.disabled = v;
    chipsEl.querySelectorAll("button").forEach((b) => (b.disabled = v));
    win.setAttribute("aria-busy", v ? "true" : "false");
  };

  const submitInput = () => {
    const v = input.value.trim();
    if (!v) { counterEl.textContent = ""; input.focus(); return; }
    if (busy) return;
    input.value = ""; input.style.height = "auto"; counterEl.textContent = "";
    handleSend(v, v);
  };

  const handleSend = async (value, shown) => {
    if (busy) return;
    const E = window.GURU.chatEngine;
    const isCmd = typeof value === "string" && value.startsWith("__");
    if (value.length > MAX_INPUT && !isCmd) { botSay(U().tooLong); return; }
    addUser(shown);
    if (!isCmd) { ctx().remember("user", value); const d = E.detectLang(value); if (d) ctx().setLang(d); }
    const lang = ctx().get().lang;
    setChips([]);

    try {
      if (value === "__human") { handoff(); return; }
      if (value === "__start") { await startLead("__start"); return; }

      if (LF().isActive()) {
        if (!isCmd && LF().wantsHuman(value)) { handoff(); return; }
        const out = LF().handle(value, lang);
        if (out.action === "submit") { renderLead(out); await doSubmit(lang); } else renderLead(out);
        return;
      }
      if (LF().wantsHuman(value)) { handoff(); return; }
      if (LF().detect(value)) { await startLead(value); return; }

      await answer(value, lang);
    } finally {
      if (!busy) setBusy(false);
      if (!chipsEl.children.length) setChips(defaultChips());
      if (!isFullScreen() && opened) input.focus();
    }
  };

  const answer = async (message, lang) => {
    setBusy(true);
    let typing = showTyping();
    let bot = null;
    const clearTyping = () => { if (typing) { typing.remove(); typing = null; } };
    const res = await PR().respond(message, {
      lang, history: ctx().get().history.slice(0, -1),
      onToken: (_d, full) => { clearTyping(); if (!bot) bot = newBot(); setBotText(bot, full.replace(/\[\[[A-Z_]*$/, "")); },
      onReplace: (full) => { clearTyping(); if (!bot) bot = newBot(); setBotText(bot, full); },
    });
    clearTyping();
    setBusy(false);

    if (res.rateLimited) { botSay(U().rate(Math.min(res.retryAfter || 60, 300)), { chips: true }); return; }
    if (res.invalid) { botSay(res.text || U().tooLong, { chips: true }); return; }

    if (res.source === "ai" && bot) {
      if (res.partial) setBotText(bot, bot.raw + "\n\n" + U().cut);
      announce(bot.raw); ctx().remember("assistant", bot.raw);
      linkChips(bot, res.links);
      if (res.action === "human") { handoffCard(); }
      setChips(defaultChips());
      if (res.action === "start_lead") { await startLead("__start"); }
      return;
    }
    // Rule-engine answer (AI off, paused or failed).
    if (bot) { bot.m.remove(); }
    const b = botSay(res.text, { links: res.links, chips: true });
    if (res.degraded && !document.querySelector(".gc-status-note")) { const n = el("p", "gc-status-note", U().offline); b.m.after(n); }
    if (res.isFallback) handoffCard();
    scrollDown(true);
  };

  /* ---------------------------------- init ----------------------------------- */
  const init = () => {
    if (initialised || document.querySelector(".gc-launcher")) return;
    if (!window.GURU.chatEngine || !window.GURU.leadFlow) return;
    initialised = true;
    build();
  };

  return { init, open, close, _renderRich: renderRich };
})();

(() => {
  const go = () => window.GURU.chatbot && window.GURU.chatbot.init();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
})();
