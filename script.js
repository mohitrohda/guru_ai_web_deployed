/* ==========================================================================
   GURU AI TECHNOLOGIES — script.js
   Single site script. No dependencies, no build step.

   CONTENTS
   00. Non-blocking Google Fonts
   01. Utils
   03. Reveal system · scroll progress · to-top
   05. Boot

   The GURU chatbot loads on demand from /chatbot/loader.js.
   ========================================================================== */

/* ==========================================================================
   00. NON-BLOCKING GOOGLE FONTS
   The <head> loads the Google Fonts stylesheet as <link rel="preload"
   as="style" id="gfonts-preload">, which never blocks render. This swaps it
   to rel="stylesheet" once this (deferred, same-origin) script runs, which
   actually applies the fonts. Done here instead of an inline onload="" on
   the <link> because the CSP's script-src has no 'unsafe-inline' — an
   inline event-handler attribute would be silently blocked there, loading
   zero fonts in production while appearing to work in any test that
   doesn't enforce the real CSP. A <noscript> stylesheet link covers
   no-JS visitors. */
(() => {
  "use strict";
  var link = document.getElementById("gfonts-preload");
  if (link && link.rel !== "stylesheet") link.rel = "stylesheet";
})();

window.GURU = window.GURU || {};

/* ==========================================================================
   01. UTILS
   ========================================================================== */
window.GURU.utils = (() => {
  "use strict";

  const $ = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

  /** Throttle with trailing call — scroll/resize handlers. */
  const throttle = (fn, wait = 100) => {
    let last = 0, timer = null;
    return function (...args) {
      const now = Date.now();
      const remaining = wait - (now - last);
      if (remaining <= 0) {
        clearTimeout(timer);
        timer = null;
        last = now;
        fn.apply(this, args);
      } else if (!timer) {
        timer = setTimeout(() => {
          last = Date.now();
          timer = null;
          fn.apply(this, args);
        }, remaining);
      }
    };
  };

  /** Debounce — resize-end / input-end. */
  const debounce = (fn, wait = 150) => {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  };

  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  /** Escape for safe HTML insertion — required for all user input. */
  const escapeHTML = (str) =>
    String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  return { $, $$, throttle, debounce, prefersReducedMotion, clamp, escapeHTML };
})();

/* ==========================================================================
   03. REVEAL SYSTEM · SCROLL PROGRESS · TO-TOP
   ========================================================================== */
window.GURU.animations = (() => {
  "use strict";

  const { $, $$, throttle, prefersReducedMotion, clamp } = window.GURU.utils;

  const STAGGER_MS = 35;
  const TOP_TRIGGER = 600;

  const initReveals = () => {
    const singles = $$("[data-reveal]");
    const groups = $$("[data-reveal-group]");
    if (!singles.length && !groups.length) return;

    // Leave the first screen and the no-JavaScript layout fully visible.
    if (!("IntersectionObserver" in window) || prefersReducedMotion()) return;
    const belowFold = [...singles, ...groups].filter(el =>
      el.getBoundingClientRect().top > window.innerHeight
    );

    groups.forEach((group) => {
      Array.from(group.children).forEach((child, i) => {
        child.style.setProperty("--reveal-delay", `${Math.min(i, 3) * STAGGER_MS}ms`);
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add("is-revealed");
          observer.unobserve(el);

          setTimeout(() => el.classList.remove("will-reveal"), 535);
        });
      },
      { rootMargin: "0px 0px 24px 0px" }
    );

    belowFold.forEach(el => {
      el.classList.add("will-reveal");
      observer.observe(el);
    });
  };

  const initProgress = () => {
    const bar = $(".scroll-progress");
    if (!bar) return;

    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
      bar.style.transform = `scaleX(${ratio})`;
    };

    update();
    window.addEventListener("scroll", throttle(update, 40), { passive: true });
    window.addEventListener("resize", throttle(update, 150), { passive: true });
  };

  const initToTop = () => {
    const btn = $(".to-top");
    if (!btn) return;

    const update = () => btn.classList.toggle("is-visible", window.scrollY > TOP_TRIGGER);

    btn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    });

    update();
    window.addEventListener("scroll", throttle(update, 120), { passive: true });
  };

  const init = () => {
    initReveals();
    initProgress();
    initToTop();
  };

  return { init };
})();

/* ==========================================================================
   04B. SERVICES SHOWCASE — accessible tabs
   ========================================================================== */
window.GURU.servicesShowcase = (() => {
  "use strict";

  const { $, $$ } = window.GURU.utils;

  const init = () => {
    const tablist = $("[data-svc-tablist]");
    const panelWrap = $("[data-svc-panels]");
    if (!tablist || !panelWrap) return;

    const tabs = $$("[data-svc-tab]", tablist);
    const panels = $$("[data-svc-panel]", panelWrap);

    const activate = (name, { focusTab = false } = {}) => {
      tabs.forEach((tab) => {
        const active = tab.dataset.svcTab === name;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        if (active && focusTab) tab.focus();
      });
      panels.forEach((panel) => {
        const active = panel.dataset.svcPanel === name;
        panel.classList.toggle("is-active", active);
        if (active) panel.removeAttribute("hidden");
        else panel.setAttribute("hidden", "");
      });
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => activate(tab.dataset.svcTab));
      tab.addEventListener("keydown", (e) => {
        const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (!dir) return;
        e.preventDefault();
        const next = tabs[(i + dir + tabs.length) % tabs.length];
        activate(next.dataset.svcTab, { focusTab: true });
      });
    });
  };

  return { init };
})();

/* ==========================================================================
   05. EXPAND / COLLAPSE
   Generic "View All" pattern used on Why GURU AI, Services, and Process.
   Markup contract (per region):
     <div class="expand-region" data-expand-region id="X">
       <div class="expand-region__inner">...extra items...</div>
     </div>
     <button class="expand-toggle" data-expand-toggle aria-controls="X"
             aria-expanded="false" data-label-more="View All X" data-label-less="Show Less">
       <span data-expand-label>View All X</span>
       <svg>...chevron...</svg>
     </button>
   Height animates via CSS grid-template-rows (0fr -> 1fr); this module only
   toggles the .is-open class, swaps the button label, and updates
   aria-expanded for accessibility.
   ========================================================================== */
window.GURU.expand = (() => {
  "use strict";

  const { $, $$, prefersReducedMotion } = window.GURU.utils;

  const wire = (toggle) => {
    const targetId = toggle.getAttribute("aria-controls");
    const region = document.getElementById(targetId);
    if (!region) return;

    const labelEl = $("[data-expand-label]", toggle) || toggle;
    const moreLabel = toggle.dataset.labelMore || labelEl.textContent.trim();
    const lessLabel = toggle.dataset.labelLess || "Show Less";

    toggle.addEventListener("click", () => {
      const opening = !region.classList.contains("is-open");
      region.classList.toggle("is-open", opening);
      toggle.setAttribute("aria-expanded", String(opening));
      labelEl.textContent = opening ? lessLabel : moreLabel;

      if (opening) {
        // Newly revealed cards may carry data-reveal / data-reveal-group;
        // show them immediately rather than waiting for a scroll trigger
        // that has already passed.
        $$("[data-reveal]", region).forEach((el) => el.classList.add("is-revealed", "reveal-done"));
        $$("[data-reveal-group]", region).forEach((el) => el.classList.add("is-revealed", "reveal-done"));
      } else {
        // Collapsing: scroll the toggle into comfortable view if the user
        // was scrolled deep into the now-hidden content.
        const rect = toggle.getBoundingClientRect();
        if (rect.top < 0 || rect.top > window.innerHeight) {
          toggle.scrollIntoView({
            behavior: prefersReducedMotion() ? "auto" : "smooth",
            block: "center",
          });
        }
      }
    });
  };

  const init = () => {
    $$("[data-expand-toggle]").forEach(wire);
  };

  return { init };
})();

/* ==========================================================================
   06. LIGHTBOX
   Opens a showcase visual at full resolution. The trigger element carries
   data-lightbox-src (the original, uncropped asset) and data-lightbox-caption.
   One dialog is created lazily and reused. Focus is trapped to the close
   button while open and returned to the trigger on close.
   ========================================================================== */
window.GURU.lightbox = (() => {
  "use strict";

  const { $, $$ } = window.GURU.utils;

  let box, imgEl, capEl, closeBtn, lastFocus;

  const build = () => {
    box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Full size graphic");
    box.innerHTML = [
      '<button class="lightbox__close" type="button" aria-label="Close full size view">',
      '  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
      "</button>",
      '<figure class="lightbox__figure">',
      '  <img class="lightbox__img" alt="">',
      '  <figcaption class="lightbox__caption"></figcaption>',
      '  <p class="lightbox__hint">Pinch to zoom in for detail</p>',
      "</figure>",
    ].join("");
    document.body.appendChild(box);

    imgEl = $(".lightbox__img", box);
    capEl = $(".lightbox__caption", box);
    closeBtn = $(".lightbox__close", box);

    closeBtn.addEventListener("click", close);
    // Click the backdrop (not the image) to dismiss
    box.addEventListener("click", (e) => {
      if (e.target === box || e.target.classList.contains("lightbox__figure")) close();
    });
    document.addEventListener("keydown", (e) => {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      // Simple focus trap: only the close button is focusable inside
      if (e.key === "Tab") { e.preventDefault(); closeBtn.focus(); }
    });
  };

  const open = (src, caption, alt) => {
    if (!box) build();
    lastFocus = document.activeElement;
    imgEl.src = src;
    imgEl.alt = alt || caption || "";
    capEl.textContent = caption || "";
    capEl.style.display = caption ? "" : "none";
    box.classList.add("is-open");
    document.body.classList.add("no-scroll");
    setTimeout(() => closeBtn.focus(), 60);
  };

  const close = () => {
    if (!box) return;
    box.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    if (lastFocus) lastFocus.focus();
  };

  const init = () => {
    const triggers = $$("[data-lightbox-src]");
    if (!triggers.length) return;

    triggers.forEach((el) => {
      const fire = () => open(
        el.dataset.lightboxSrc,
        el.dataset.lightboxCaption || "",
        el.dataset.lightboxAlt || ""
      );
      el.addEventListener("click", fire);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fire(); }
      });
    });
  };

  return { init, open, close };
})();

/* ==========================================================================
   07. BOOT
   ========================================================================== */
(() => {
  "use strict";

  const { $ } = window.GURU.utils;

  const boot = () => {
    window.GURU.animations.init();
    window.GURU.servicesShowcase.init();
    window.GURU.expand.init();
    window.GURU.lightbox.init();
    if (window.GURU.testimonials) window.GURU.testimonials.init();

    const year = $("[data-year]");
    if (year) year.textContent = new Date().getFullYear();
  };

  /* Boot waits for later deferred modules such as testimonials.
     During deferred execution document.readyState is already
     "interactive" — DOMContentLoaded has NOT fired yet. Only "complete"
     means we missed it. Testing for "loading" here would run boot() too
     early and silently skip those modules. */
  if (document.readyState === "complete") {
    boot();
  } else {
    document.addEventListener("DOMContentLoaded", boot);
  }
})();
