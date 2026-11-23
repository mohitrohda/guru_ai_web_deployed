/* GURU AI assistant: context.js
   In-memory session context only. Nothing is written to localStorage, cookies or the server,
   so a page refresh ends the conversation and no transcript is retained. */
window.GURU = window.GURU || {};

window.GURU.chatContext = (() => {
  "use strict";

  const MAX_HISTORY = 8;

  const state = {
    userName: null,
    lang: "en",          // en | hi (Hinglish) | mr (Roman Marathi)
    lastIntent: null,
    turns: 0,
    rotation: {},        // intentId -> shuffled cursor (avoids repeating canned answers)
    history: [],         // [{role:"user"|"assistant", content}] sent to /api/chat (last 8 only)
  };

  const pick = (intentId, pool) => {
    if (!pool || !pool.length) return null;
    const key = `${intentId}:${pool.length}`;
    if (!state.rotation[key] || state.rotation[key].order.length !== pool.length) {
      const order = pool.map((_, i) => i).sort(() => Math.random() - 0.5);
      state.rotation[key] = { order, cursor: 0 };
    }
    const r = state.rotation[key];
    const idx = r.order[r.cursor % r.order.length];
    r.cursor += 1;
    if (r.cursor >= r.order.length) { r.order.sort(() => Math.random() - 0.5); r.cursor = 0; }
    return pool[idx];
  };

  const remember = (role, content) => {
    state.history.push({ role, content: String(content).slice(0, 600) });
    if (state.history.length > MAX_HISTORY) state.history.splice(0, state.history.length - MAX_HISTORY);
  };

  return {
    get: () => state,
    setName: (n) => { state.userName = n; },
    setLang: (l) => { state.lang = l; },
    setIntent: (i) => { state.lastIntent = i; state.turns += 1; },
    remember,
    pick,
  };
})();
