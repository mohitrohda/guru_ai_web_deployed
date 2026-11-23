/* GURU AI assistant loader: the ONLY chatbot tag a page needs.
   Loads chatbot.css + one bundle after the page has finished loading, so it never competes with
   LCP/INP. Paths are resolved from this file's own URL, so it works at any folder depth. */
(() => {
  "use strict";
  if (window.__guruChatLoader) return;
  window.__guruChatLoader = true;
  const me = document.currentScript;
  if (!me || !me.src) return;
  const base = me.src.slice(0, me.src.lastIndexOf("/") + 1);
  const v = (me.src.split("?v=")[1] || "").replace(/[^\w.-]/g, "");
  const q = v ? "?v=" + v : "";
  const run = () => {
    const css = document.createElement("link");
    css.rel = "stylesheet"; css.href = base + "chatbot.css" + q;
    document.head.appendChild(css);
    const js = document.createElement("script");
    js.src = base + "chatbot.bundle.js" + q; js.async = true;
    document.head.appendChild(js);
  };
  const idle = () => ("requestIdleCallback" in window ? requestIdleCallback(run, { timeout: 2500 }) : setTimeout(run, 800));
  if (document.readyState === "complete") idle(); else window.addEventListener("load", idle, { once: true });
})();
