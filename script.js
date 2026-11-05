/* ==========================================================================
   GURU AI TECHNOLOGIES — script.js
   Single site script. No dependencies, no build step.

   CONTENTS
   00. Non-blocking Google Fonts
   01. Utils
   03. Reveal system · scroll progress · to-top
   04. Contact form
   05. Boot (loader + init)

   The GURU chatbot lives in /chatbot/ and registers itself on
   window.GURU.chatbot — it is initialised at the end of this file.
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

  const STAGGER_MS = 80;
  const TOP_TRIGGER = 600;

  const initReveals = () => {
    const singles = $$("[data-reveal]");
    const groups = $$("[data-reveal-group]");
    if (!singles.length && !groups.length) return;

    // No observer support or reduced motion → show everything immediately
    if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
      [...singles, ...groups].forEach((el) =>
        el.classList.add("is-revealed", "reveal-done")
      );
      return;
    }

    groups.forEach((group) => {
      Array.from(group.children).forEach((child, i) => {
        child.style.setProperty("--reveal-delay", `${i * STAGGER_MS}ms`);
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add("is-revealed");
          observer.unobserve(el);

          const groupSize = el.hasAttribute("data-reveal-group") ? el.children.length : 0;
          const settle = 640 + groupSize * STAGGER_MS + 100;
          setTimeout(() => el.classList.add("reveal-done"), settle);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    [...singles, ...groups].forEach((el) => observer.observe(el));
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
   04. CONTACT FORM — EmailJS
   The "Send Message" form submits through EmailJS (client-side, no backend).
   Validation, loading state, success/error messaging, and the existing UI
   are all preserved. WhatsApp buttons elsewhere on the site are untouched.
   ========================================================================== */
window.GURU.form = (() => {
  "use strict";

  const { $, $$ } = window.GURU.utils;

  const EMAILJS_PUBLIC_KEY  = "7atusLHN2MeUmkcE1";
  const EMAILJS_SERVICE_ID  = "service_c1hra9n";
  const EMAILJS_TEMPLATE_ID = "template_mracq88";

  const validators = {
    name:    (v) => v.trim().length >= 2,
    phone:   (v) => /^[+\d][\d\s-]{7,15}$/.test(v.trim()),
    email:   (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    message: (v) => v.trim().length >= 10,
  };

  let form, status, submitBtn, submitLabel;

  const setFieldError = (input, invalid) => {
    const field = input.closest(".form__field");
    if (field) field.classList.toggle("has-error", invalid);
    input.setAttribute("aria-invalid", String(invalid));
  };

  const validate = () => {
    let firstInvalid = null;
    Object.keys(validators).forEach((name) => {
      const input = form.elements[name];
      if (!input) return;
      const invalid = !validators[name](input.value);
      setFieldError(input, invalid);
      if (invalid && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  };

  const say = (msg, kind) => {
    status.textContent = msg;
    status.classList.remove("is-success", "is-error");
    if (kind) status.classList.add(kind);
  };

  const collect = () => ({
    name: form.elements.name.value.trim(),
    phone: form.elements.phone.value.trim(),
    email: form.elements.email.value.trim(),
    service: form.elements.service ? form.elements.service.value : "",
    message: form.elements.message.value.trim(),
  });

  /** Toggle the submit button between idle and loading states. */
  const setLoading = (loading) => {
    submitBtn.disabled = loading;
    submitBtn.setAttribute("aria-busy", String(loading));
    submitBtn.textContent = loading ? "Sending…" : submitLabel;
  };

  const clearErrors = () =>
    $$(".form__field", form).forEach((f) => f.classList.remove("has-error"));

  /**
   * Template params sent to EmailJS. Common EmailJS template variables are
   * covered so the message renders whichever field names the template uses.
   */
  const buildParams = (data) => ({
    from_name: data.name,
    name: data.name,
    reply_to: data.email,
    email: data.email,
    from_email: data.email,
    phone: data.phone,
    service: data.service,
    message: data.message,
    to_name: "GURU AI TECHNOLOGIES",
  });

  const sendViaEmailJS = async (data) => {
    // Guard: if the SDK failed to load (e.g. offline), tell the user how to
    // reach us rather than throwing silently.
    if (!window.emailjs) {
      say("Our messaging service didn't load. Please WhatsApp us on +91 80876 95569 and we'll respond right away.", "is-error");
      return;
    }

    setLoading(true);
    say("Sending your message…");

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, buildParams(data));
      say("Thank you — your message has been sent. We'll get back to you within 24 hours.", "is-success");
      form.reset();
      clearErrors();
    } catch (err) {
      say("Something went wrong while sending. Please try again, or WhatsApp us on +91 80876 95569.", "is-error");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();

    // Honeypot: a filled hidden field means a bot. Fail silently.
    if (form.elements.website && form.elements.website.value) return;

    if (!validate()) {
      say("Please check the highlighted fields.", "is-error");
      return;
    }

    sendViaEmailJS(collect());
  };

  const init = () => {
    form = $("#contact-form");
    if (!form) return;
    status = $(".form__status", form);
    submitBtn = $('button[type="submit"]', form);
    submitLabel = submitBtn ? submitBtn.textContent : "Send Message";

    // Initialise EmailJS here (inside a 'self' script, so it satisfies the
    // strict Content-Security-Policy without needing an inline-script hash).
    if (window.emailjs) {
      try { emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY }); } catch (_) {}
    }

    form.addEventListener("submit", onSubmit);

    // Clear a field's error as soon as it becomes valid
    Object.keys(validators).forEach((name) => {
      const input = form.elements[name];
      if (!input) return;
      input.addEventListener("input", () => {
        if (validators[name](input.value)) setFieldError(input, false);
      });
    });
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

  /* --- Loader: dismiss on load, with a hard timeout so the site can
         never be trapped behind it if an asset stalls. --- */
  const LOADER_MAX_MS = 2500;
  const LOADER_MIN_MS = 450;

  const dismissLoader = (() => {
    let done = false;
    const start = performance.now();
    return () => {
      if (done) return;
      done = true;
      const loader = $(".loader");
      if (!loader) return;
      const wait = Math.max(0, LOADER_MIN_MS - (performance.now() - start));
      setTimeout(() => {
        loader.classList.add("is-done");
        loader.addEventListener("transitionend", () => loader.remove(), { once: true });
        setTimeout(() => loader.isConnected && loader.remove(), 800);
      }, wait);
    };
  })();

  window.addEventListener("load", dismissLoader);
  setTimeout(dismissLoader, LOADER_MAX_MS);

  const boot = () => {
    window.GURU.animations.init();
    window.GURU.form.init();
    window.GURU.servicesShowcase.init();
    window.GURU.expand.init();
    window.GURU.lightbox.init();
    if (window.GURU.testimonials) window.GURU.testimonials.init();
    if (window.GURU.chatbot) window.GURU.chatbot.init();

    const year = $("[data-year]");
    if (year) year.textContent = new Date().getFullYear();
  };

  /* Boot timing note: this file loads FIRST (the chatbot modules read
     GURU.utils as they execute), so boot() must wait for the later defer
     scripts. During deferred execution document.readyState is already
     "interactive" — DOMContentLoaded has NOT fired yet. Only "complete"
     means we missed it. Testing for "loading" here would run boot() too
     early and silently skip the chatbot. */
  if (document.readyState === "complete") {
    boot();
  } else {
    document.addEventListener("DOMContentLoaded", boot);
  }
})();
