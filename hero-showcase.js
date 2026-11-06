(() => {
  "use strict";

  const showcase = document.querySelector("[data-hero-showcase]");
  if (!showcase) return;

  const panels = [...showcase.querySelectorAll("[data-hero-panel]")];
  const crm = panels[0];
  const chart = crm.querySelector(".guru-crm__bars");
  const newLeadCount = chart.querySelector("b");
  const score = crm.querySelector("[data-crm-score]");
  const notice = crm.querySelector(".guru-crm__notice");
  const parts = [...crm.querySelectorAll("[data-crm-reveal]")];
  const toolbar = showcase.querySelector("[data-hero-controls]");
  const caption = toolbar.querySelector("[data-hero-step]");
  const live = toolbar.querySelector("[data-hero-announcement]");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const stages = [
    "New lead arrives",
    "AI analyses the enquiry",
    "Lead score is ready",
    "Assigned to sales",
    "Sales pipeline updated",
    "WhatsApp follow-up sent",
  ];
  const notices = ["New lead captured", "Analysing enquiry", "Lead scored", "Assigned to sales", "Pipeline updated", "Follow-up sent"];
  const panelCaptions = ["", "Website · Booking enquiry", "Billing · Sale and stock update"];
  const canObserve = "IntersectionObserver" in window;
  const scene = showcase.querySelector(".hero-showcase__stage");
  let panel = 0;
  let step = reduced.matches ? stages.length - 1 : 0;
  let visible = !canObserve;
  let hovered = false;
  let timer;

  function setNumber(element, value, animate) {
    element.getAnimations?.().forEach(animation => animation.cancel());
    if (element.textContent === String(value)) return;
    element.textContent = value;
    if (animate && !reduced.matches) {
      element.animate?.([{ transform: "translateY(3px)" }, { transform: "none" }], {
        duration: 220, easing: "ease-out",
      });
    }
  }

  function render(manual = false) {
    crm.dataset.crmStep = step;
    notice.textContent = notices[step];
    setNumber(score, step < 2 ? "—" : 86, panel === 0 && step === 2);
    setNumber(newLeadCount, step < 4 ? 23 : 24, panel === 0 && step === 4);
    chart.setAttribute("aria-label", "Sample sales pipeline. " + (step < 4 ? 23 : 24) + " new leads, 18 open, 9 in demo, 5 won.");
    parts.forEach(part => part.setAttribute("aria-hidden", String(step < Number(part.dataset.crmReveal))));

    panels.forEach((item, position) => {
      const selected = position === panel;
      item.classList.toggle("is-active", selected);
      item.inert = !selected;
      item.setAttribute("aria-hidden", String(!selected));
    });
    caption.textContent = panel === 0 ? (step + 1) + " / " + stages.length + " · " + stages[step] : panelCaptions[panel];
    if (manual) live.textContent = caption.textContent;
  }

  function advance(direction, manual = false) {
    const nextStep = step + direction;
    if (panel === 0 && nextStep >= 0 && nextStep < stages.length) {
      step = nextStep;
    } else {
      panel = (panel + direction + panels.length) % panels.length;
      step = direction > 0 ? 0 : stages.length - 1;
    }
    render(manual);
    schedule(manual);
  }

  function schedule(manual = false) {
    clearTimeout(timer);
    const playing = visible && !document.hidden && !reduced.matches && !hovered &&
      !toolbar.querySelector(":focus-visible");
    panels.forEach((item, index) => item.classList.toggle("is-in-view", playing && index === panel));
    if (!playing) return;
    // Six CRM beats share the same five seconds as each other example.
    let delay = 5000;
    if (panel === 0) delay = manual ? 2200 : step === stages.length - 1 ? 1200 : 760;
    timer = setTimeout(() => advance(1), delay);
  }

  toolbar.querySelectorAll("[data-hero-direction]").forEach(button => {
    button.addEventListener("click", () => advance(Number(button.dataset.heroDirection), true));
  });
  toolbar.addEventListener("focusin", () => schedule());
  toolbar.addEventListener("focusout", () => queueMicrotask(schedule));
  scene.addEventListener("pointerenter", event => {
    if (event.pointerType !== "mouse") return;
    hovered = true;
    schedule();
  });
  scene.addEventListener("pointerleave", () => {
    hovered = false;
    schedule();
  });
  if (canObserve) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    }, { threshold: .15 }).observe(showcase);
  }
  reduced.addEventListener("change", () => schedule());
  document.addEventListener("visibilitychange", () => schedule());
  toolbar.hidden = false;
  render();
  schedule();
})();
