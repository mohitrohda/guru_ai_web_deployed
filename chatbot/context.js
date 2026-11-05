/* ============================================================
   GURU chatbot — context.js
   In-memory session context: user name, language, last intent,
   and per-intent response rotation (prevents repetition).
   Nothing is persisted — privacy by default.
   ============================================================ */

window.GURU = window.GURU || {};

window.GURU.chatContext = (() => {
  "use strict";

  const state = {
    userName: null,
    lang: "en",          // en | hi (Hinglish) | mr (Roman Marathi)
    lastIntent: null,
    turns: 0,
    rotation: {},        // intentId → shuffled index cursor
  };

  /** Pick a response from a pool without repeating until exhausted. */
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
    if (r.cursor >= r.order.length) {
      r.order.sort(() => Math.random() - 0.5); // reshuffle for next cycle
      r.cursor = 0;
    }
    return pool[idx];
  };

  return {
    get: () => state,
    setName: (n) => { state.userName = n; },
    setLang: (l) => { state.lang = l; },
    setIntent: (i) => { state.lastIntent = i; state.turns += 1; },
    pick,
  };
})();
