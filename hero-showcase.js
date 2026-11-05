(() => {
  "use strict";

  const showcase = document.querySelector("[data-hero-showcase]");
  if (!showcase) return;

  const panels = [...showcase.querySelectorAll("[data-hero-panel]")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const canObserve = "IntersectionObserver" in window;
  let active = 0;
  let visible = !canObserve;
  let timer;

  const select = (index) => {
    active = index;
    panels.forEach((panel, position) => {
      const selected = position === index;
      panel.classList.toggle("is-active", selected);
      panel.inert = !selected;
    });
  };

  const schedule = () => {
    window.clearTimeout(timer);
    const motionAllowed = visible && !document.hidden && !reducedMotion.matches;
    panels.forEach((panel, index) => {
      panel.classList.toggle("is-in-view", motionAllowed && index === active);
    });
    if (motionAllowed) {
      timer = window.setTimeout(() => {
        select((active + 1) % panels.length);
        schedule();
      }, 5000);
    }
  };

  select(0);
  panels.forEach((panel) => { panel.hidden = false; });

  if (canObserve) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    }, { threshold: 0.15 }).observe(showcase);
  }

  document.addEventListener("visibilitychange", schedule);
  reducedMotion.addEventListener("change", schedule);
  schedule();
})();
