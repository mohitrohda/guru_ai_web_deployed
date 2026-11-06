/* ==========================================================================
   GURU chatbot — ui.js
   Builds the chat window and manages the
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
  const desktop = matchMedia("(min-width: 768px)");

  const QUICK_REPLIES = ["Our Services", "How do I get a quote?", "How do you work?"];

  let win, log, input, launcher, dock;

  /* ---------- DOM construction (trusted static markup only) ---------- */
  const build = button => {
    launcher = button;
    launcher.setAttribute("aria-controls", "guru-chat");

    win = document.createElement("dialog");
    win.className = "gc-window";
    win.id = "guru-chat";
    win.setAttribute("aria-labelledby", "guru-chat-title");
    win.innerHTML = [
      '<header class="gc-head">',
      '  <span class="gc-head__avatar" aria-hidden="true">G</span>',
      '  <div class="gc-head__meta">',
      '    <div class="gc-head__name" id="guru-chat-title">Chat with GURU</div>',
      '    <div class="gc-head__status">Website assistant</div>',
      "  </div>",
      '  <button class="gc-close" type="button" aria-label="Close chat" autofocus>',
      '    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
      "  </button>",
      "</header>",
      '<div class="gc-log" role="log" aria-label="Conversation"></div>',
      '<div class="gc-chips" role="group" aria-label="Suggested questions"></div>',
      '<form class="gc-composer">',
      '  <input class="gc-input" type="text" maxlength="500" autocomplete="off" placeholder="Ask me anything…" aria-label="Type your message">',
      '  <button class="gc-send" type="submit" aria-label="Send message">',
      '    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4 20-7Z"/></svg>',
      "  </button>",
      "</form>",
      `<a class="gc-human" href="https://wa.me/${PHONE_E164}" target="_blank" rel="noopener">Talk to our team on WhatsApp <span aria-hidden="true">↗</span></a>`,
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
    safe = safe.replace(/\+91\s?80876\s?95569/g,
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
    const target = prefersReducedMotion() ? 0 : Math.min(650, 200 + reply.length * 2);
    const wait = Math.max(0, target - (performance.now() - started));
    setTimeout(() => {
      typing.remove();
      addMsg(reply, "bot");
    }, wait);
  };

  /* ---------- open / close ---------- */
  const open = () => {
    dock.open = false;
    if (!log.children.length) {
      addMsg("Hi! I’m GURU. Ask about our services, what a project can include, or how to request a quote.", "bot");
    }
    if (desktop.matches) win.show();
    else win.showModal();
  };

  const init = button => {
    dock = button.closest("details");
    build(button);

    launcher.addEventListener("click", open);
    $(".gc-close", win).addEventListener("click", () => win.close());
    win.addEventListener("click", event => {
      if (event.target !== win) return;
      const bounds = win.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom) win.close();
    });
    win.addEventListener("close", () => $("summary", dock).focus({ preventScroll: true }));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && win.open && !win.matches(":modal")) win.close();
    });
    desktop.addEventListener("change", () => { if (win.open) win.close(); });
    $(".gc-composer", win).addEventListener("submit", (event) => {
      event.preventDefault();
      send(input.value);
    });
  };

  return { init, open };
})();
