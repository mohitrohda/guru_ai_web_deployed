/* ==========================================================================
   GURU chatbot — ui.js
   Builds the launcher, the teaser popup, and the chat window; manages the
   message log, typing indicator, quick replies, focus, and Escape handling.
   Talks to the backend ONLY through GURU.chatProvider.
   ========================================================================== */

window.GURU = window.GURU || {};

window.GURU.chatbot = (() => {
  "use strict";

  const { $, escapeHTML, prefersReducedMotion } = window.GURU.utils;
  const ctx = () => window.GURU.chatContext;

  const PHONE_E164 = "918087695569";
  const PHONE_DISPLAY = "+91 80876 95569";

  const QUICK_REPLIES = ["Our Services", "Pricing", "Contact Details", "How do you work?"];

  /* Teaser timing — appears after 3s, lingers, then retires for good. */
  const TEASER_DELAY_MS = 3000;
  const TEASER_VISIBLE_MS = 6000;

  let win, log, input, launcher, teaser, lastFocus;
  let teaserTimers = [];

  /* ---------- DOM construction (trusted static markup only) ---------- */
  const build = () => {
    launcher = document.createElement("button");
    launcher.className = "gc-launcher";
    launcher.type = "button";
    launcher.setAttribute("aria-label", "Chat with GURU");
    launcher.setAttribute("aria-haspopup", "dialog");
    launcher.setAttribute("aria-expanded", "false");
    launcher.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z"/><path d="M8 9h8M8 13h5"/></svg>';

    // The teaser lives inside the launcher so it always points at the button.
    teaser = document.createElement("span");
    teaser.className = "gc-teaser";
    teaser.setAttribute("aria-hidden", "true");
    teaser.innerHTML =
      '<span class="gc-teaser__title">Need Help?</span>' +
      '<span class="gc-teaser__cta">Ask GURU</span>';
    launcher.appendChild(teaser);

    const stack = $("#float-stack");
    if (stack) stack.prepend(launcher);
    else document.body.appendChild(launcher);

    win = document.createElement("section");
    win.className = "gc-window";
    win.setAttribute("role", "dialog");
    win.setAttribute("aria-modal", "false");
    win.setAttribute("aria-label", "Chat with GURU");
    win.innerHTML = [
      '<header class="gc-head">',
      '  <span class="gc-head__avatar" aria-hidden="true">G</span>',
      '  <div class="gc-head__meta">',
      '    <div class="gc-head__name">GURU</div>',
      '    <div class="gc-head__status">Online · replies instantly</div>',
      "  </div>",
      '  <button class="gc-close" type="button" aria-label="Close chat">',
      '    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
      "  </button>",
      "</header>",
      '<div class="gc-log" aria-live="polite"></div>',
      '<div class="gc-chips" role="group" aria-label="Suggested questions"></div>',
      '<form class="gc-composer">',
      '  <input class="gc-input" type="text" maxlength="500" autocomplete="off" placeholder="Ask me anything…" aria-label="Type your message">',
      '  <button class="gc-send" type="submit" aria-label="Send message">',
      '    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4 20-7Z"/></svg>',
      "  </button>",
      "</form>",
    ].join("");
    document.body.appendChild(win);

    log = $(".gc-log", win);
    input = $(".gc-input", win);

    const chips = $(".gc-chips", win);
    QUICK_REPLIES.forEach((q) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "gc-chip";
      chip.textContent = q;
      chip.addEventListener("click", () => send(q));
      chips.appendChild(chip);
    });
  };

  /* ---------- teaser popup ----------
     Shows once, 3s after load, then fades on its own. Retires permanently
     on any interaction so it can never nag. */
  const hideTeaser = () => {
    if (teaser) teaser.classList.remove("is-visible");
  };

  const retireTeaser = () => {
    teaserTimers.forEach(clearTimeout);
    teaserTimers = [];
    hideTeaser();
  };

  const scheduleTeaser = () => {
    teaserTimers.push(
      setTimeout(() => {
        if (win.classList.contains("is-open")) return;
        teaser.classList.add("is-visible");
        teaserTimers.push(setTimeout(hideTeaser, TEASER_VISIBLE_MS));
      }, TEASER_DELAY_MS)
    );
  };

  /* ---------- messages ---------- */
  const addMsg = (text, who) => {
    const el = document.createElement("div");
    el.className = `gc-msg gc-msg--${who}`;
    // User text is escaped. Bot text comes from our trusted dataset, where
    // only tel:/wa.me/mailto links are allowed through.
    el.innerHTML = who === "user" ? escapeHTML(text) : linkify(text);
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  };

  /** Allow-list linkifier for bot replies (phone / WhatsApp / email only). */
  const linkify = (text) => {
    let safe = escapeHTML(text);
    safe = safe.replace(/\+91\s?73854\s?03569/g,
      `<a href="tel:+${PHONE_E164}">${PHONE_DISPLAY}</a>`);
    safe = safe.replace(/[\w.]+@guruaitechnologies\.com/g,
      (m) => `<a href="mailto:${m}">${m}</a>`);
    safe = safe.replace(/\bWhatsApp\b/g,
      `<a href="https://wa.me/${PHONE_E164}" target="_blank" rel="noopener">WhatsApp</a>`);
    return safe;
  };

  const showTyping = () => {
    const t = document.createElement("div");
    t.className = "gc-typing";
    t.setAttribute("aria-hidden", "true");
    t.innerHTML = "<span></span><span></span><span></span>";
    log.appendChild(t);
    log.scrollTop = log.scrollHeight;
    return t;
  };

  /* ---------- conversation flow ---------- */
  const send = async (raw) => {
    const message = raw.trim();
    if (!message) return;
    addMsg(message, "user");
    input.value = "";

    const typing = showTyping();
    const started = performance.now();

    let reply;
    try {
      reply = await window.GURU.chatProvider.getResponse(message, ctx().get());
    } catch {
      reply = `Something went wrong. Please reach us on WhatsApp: ${PHONE_DISPLAY}.`;
    }

    // Typing delay proportional to reply length — human, never slow.
    const target = prefersReducedMotion() ? 0 : Math.min(1400, 350 + reply.length * 6);
    const wait = Math.max(0, target - (performance.now() - started));
    setTimeout(() => {
      typing.remove();
      addMsg(reply, "bot");
    }, wait);
  };

  /* ---------- open / close ---------- */
  const open = () => {
    retireTeaser();
    lastFocus = document.activeElement;
    win.classList.add("is-open");
    launcher.setAttribute("aria-expanded", "true");
    if (!log.children.length) greet();
    setTimeout(() => input.focus(), 250);
  };

  const close = () => {
    win.classList.remove("is-open");
    launcher.setAttribute("aria-expanded", "false");
    if (lastFocus) lastFocus.focus();
  };

  const greet = () => {
    const data = window.GURU.chatbotData || {};
    const intent = (data.intents || []).find((i) => i.id === "greeting");
    const reply = intent
      ? window.GURU.chatEngine.render(intent, ctx().get().lang)
      : "Hi! I'm GURU. How can I help you today?";
    const typing = showTyping();
    setTimeout(() => { typing.remove(); addMsg(reply, "bot"); },
      prefersReducedMotion() ? 0 : 600);
  };

  /* ---------- init ---------- */
  const init = () => {
    if (!window.GURU.chatProvider) return;
    build();

    launcher.addEventListener("click", () =>
      win.classList.contains("is-open") ? close() : open()
    );
    launcher.addEventListener("mouseenter", retireTeaser);
    $(".gc-close", win).addEventListener("click", close);
    $(".gc-composer", win).addEventListener("submit", (e) => {
      e.preventDefault();
      send(input.value);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && win.classList.contains("is-open")) close();
    });

    // A scroll means the visitor is already engaged — don't interrupt them.
    window.addEventListener("scroll", retireTeaser, { once: true, passive: true });

    scheduleTeaser();
  };

  return { init };
})();
