(() => {
  "use strict";

  const header = document.querySelector(".site-nav");
  if (!header) return;

  const toggle = header.querySelector(".site-nav__toggle");
  const navigation = header.querySelector(".site-nav__primary");
  const services = header.querySelector(".site-nav__services");
  const servicesButton = services.querySelector("summary");
  const desktop = matchMedia("(min-width: 900px) and (min-height: 460px)");

  const menuIsOpen = () => toggle.getAttribute("aria-expanded") === "true";

  function setMenu(open) {
    navigation.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("site-nav-menu-open", open);
    if (!open) services.open = false;
  }

  toggle.addEventListener("click", () => setMenu(!menuIsOpen()));
  desktop.addEventListener("change", () => setMenu(false));

  header.addEventListener("click", event => {
    if (!event.target.closest("a[href]")) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    setMenu(false);
  });
  document.addEventListener("click", event => {
    if (!header.contains(event.target)) setMenu(false);
    else if (!services.contains(event.target)) services.open = false;
  });

  header.addEventListener("focusout", event => {
    const next = event.relatedTarget;
    if (!next) return;
    if (!header.contains(next)) setMenu(false);
    else if (!services.contains(next)) services.open = false;
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (services.open) {
      services.open = false;
      servicesButton.focus();
    } else if (menuIsOpen()) {
      setMenu(false);
      toggle.focus();
    }
  });

  header.classList.add("is-ready");
  toggle.hidden = false;
})();
