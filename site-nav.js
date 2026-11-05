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

  header.querySelectorAll("[role=tablist]").forEach(tabList => {
    const tabs = [...tabList.querySelectorAll("[role=tab]")];
    const panels = tabs.map(tab => document.getElementById(tab.getAttribute("aria-controls")));

    function select(index) {
      tabs.forEach((tab, position) => {
        const selected = position === index;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panels[position].hidden = !selected;
      });
    }

    tabs.forEach((tab, index) => tab.addEventListener("click", () => select(index)));
    tabList.addEventListener("keydown", event => {
      const index = tabs.indexOf(event.target);
      if (index < 0) return;

      const positions = {
        ArrowLeft: (index + tabs.length - 1) % tabs.length,
        ArrowRight: (index + 1) % tabs.length,
        Home: 0,
        End: tabs.length - 1,
      };
      if (!Object.hasOwn(positions, event.key)) return;
      event.preventDefault();
      select(positions[event.key]);
      tabs[positions[event.key]].focus();
    });
    tabList.hidden = false;
  });

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
