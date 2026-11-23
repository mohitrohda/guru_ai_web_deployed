/* GURU AI assistant: util.js. Tiny helpers so the assistant works on every page,
   including lightweight service pages that do not load script.js. */
window.GURU = window.GURU || {};
window.GURU.chatUtil = (() => {
  "use strict";

  const $ = (sel, scope = document) => scope.querySelector(sel);

  const escapeHTML = (s) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  const prefersReducedMotion = () => !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  const uuid = () => {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    const b = new Uint8Array(16);
    (window.crypto || {}).getRandomValues ? crypto.getRandomValues(b) : b.forEach((_, i) => (b[i] = (Math.random() * 256) | 0));
    return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  };

  /** Only same-site relative URLs, WhatsApp, mailto and tel links are ever rendered as links. */
  const safeHref = (url) => {
    const u = String(url || "").trim();
    if (/^\/(?!\/)[\w\-./#?=&%]*$/.test(u)) return u;
    if (/^https:\/\/wa\.me\/\d{8,15}(\?[\w%=&.\-]*)?$/.test(u)) return u;
    if (/^mailto:[\w.+\-]+@[\w\-]+(\.[\w\-]+)+$/.test(u)) return u;
    if (/^tel:\+?\d{8,15}$/.test(u)) return u;
    return null;
  };

  return { $, escapeHTML, prefersReducedMotion, uuid, safeHref };
})();
