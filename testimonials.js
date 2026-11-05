/* Homepage testimonials. Advance the native scroll position and repeat one
   set of cards so touch scrolling and keyboard focus keep working. */
window.GURU = window.GURU || {};

window.GURU.testimonials = (() => {
  "use strict";

  const PIXELS_PER_MS = .024;
  const RESUME_DELAY = 850;

  const init = () => {
    const root = document.querySelector("[data-testimonials]");
    if (!root) return;

    const viewport = root.querySelector(".hp-feedback-viewport");
    const track = root.querySelector(".hp-feedback-track");
    const originals = track.querySelector(".hp-feedback-set");
    const cards = [...originals.children];
    const controls = root.querySelector("[data-feedback-controls]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (cards.length < 2) return;

    const repeat = originals.cloneNode(true);
    repeat.inert = true;
    repeat.setAttribute("aria-hidden", "true");
    repeat.hidden = true;
    track.append(repeat);

    let loopWidth = 0;
    let visible = !("IntersectionObserver" in window);
    let hovered = false;
    let interacting = false;
    let resumeTimer;
    let frame = 0;
    let lastTime = 0;
    let fraction = 0;

    const tick = time => {
      const elapsed = lastTime ? Math.min(time - lastTime, 50) : 0;
      lastTime = time;
      const distance = fraction + elapsed * PIXELS_PER_MS;
      const pixels = Math.floor(distance);
      fraction = distance - pixels;
      if (pixels) viewport.scrollLeft = (viewport.scrollLeft + pixels) % loopWidth;
      frame = requestAnimationFrame(tick);
    };

    const updatePlayback = () => {
      const moving = !repeat.hidden && visible && !document.hidden &&
        !hovered && !interacting && !viewport.matches(":focus-within");

      if (moving && !frame) frame = requestAnimationFrame(tick);
      if (!moving && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
        lastTime = 0;
      }
    };

    const measure = () => {
      loopWidth = originals.offsetWidth;
      const looping = !reduced.matches && loopWidth > viewport.clientWidth;
      if (!looping && !repeat.hidden) viewport.scrollLeft %= loopWidth;
      repeat.hidden = !looping;
      viewport.classList.toggle("is-looping", looping);
      updatePlayback();
    };

    const waitBeforePlaying = () => {
      interacting = true;
      clearTimeout(resumeTimer);
      updatePlayback();
      resumeTimer = setTimeout(() => {
        interacting = false;
        updatePlayback();
      }, RESUME_DELAY);
    };

    const move = direction => {
      const step = cards[1].offsetLeft - cards[0].offsetLeft;
      const position = viewport.scrollLeft;
      const end = viewport.scrollWidth - viewport.clientWidth;
      let left = (Math.round(position / step) + direction) * step;

      if (direction < 0 && position <= 1) left = repeat.hidden ? end : loopWidth - step;
      if (direction > 0 && position >= end - 1) left = 0;

      waitBeforePlaying();
      viewport.scrollTo({
        left,
        behavior: reduced.matches || Math.abs(left - position) > step * 2 ? "instant" : "smooth",
      });
    };

    controls.querySelector("[data-feedback-prev]").addEventListener("click", () => move(-1));
    controls.querySelector("[data-feedback-next]").addEventListener("click", () => move(1));
    viewport.addEventListener("pointerenter", event => {
      if (event.pointerType !== "mouse") return;
      hovered = true;
      updatePlayback();
    });
    viewport.addEventListener("pointerleave", () => {
      hovered = false;
      updatePlayback();
    });
    viewport.addEventListener("focusin", updatePlayback);
    viewport.addEventListener("focusout", () => queueMicrotask(updatePlayback));
    viewport.addEventListener("pointerdown", waitBeforePlaying);
    viewport.addEventListener("wheel", waitBeforePlaying, { passive: true });
    viewport.addEventListener("scroll", () => {
      if (interacting) waitBeforePlaying();
    }, { passive: true });
    viewport.addEventListener("keydown", event => {
      if (event.target !== viewport || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      move(event.key === "ArrowRight" ? 1 : -1);
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        updatePlayback();
      }).observe(viewport);
    }

    document.addEventListener("visibilitychange", updatePlayback);
    reduced.addEventListener("change", measure);
    window.addEventListener("resize", measure, { passive: true });
    controls.hidden = false;
    measure();
  };

  return { init };
})();
