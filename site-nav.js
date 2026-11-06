(() => {
  "use strict";

  const header = document.querySelector(".site-nav");
  if (!header) return;

  const toggle = header.querySelector(".site-nav__toggle");
  const navigation = header.querySelector(".site-nav__primary");
  const disclosures = [...header.querySelectorAll(".site-nav__services, .site-nav__industries")];
  const dock = document.querySelector("[data-contact-dock]");
  const contact = document.getElementById("contact");
  const desktop = matchMedia("(min-width: 900px) and (min-height: 460px)");

  const menuIsOpen = () => toggle.getAttribute("aria-expanded") === "true";

  function setMenu(open) {
    navigation.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("site-nav-menu-open", open);
    if (!open) disclosures.forEach(item => { item.open = false; });
  }

  disclosures.forEach(item => item.addEventListener("toggle", () => {
    if (item.open) disclosures.forEach(other => { if (other !== item) other.open = false; });
  }));
  toggle.addEventListener("click", () => setMenu(!menuIsOpen()));
  desktop.addEventListener("change", () => setMenu(false));

  header.addEventListener("click", event => {
    if (!event.target.closest("a[href]")) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    setMenu(false);
  });
  document.addEventListener("click", event => {
    if (!header.contains(event.target)) setMenu(false);
    else disclosures.forEach(item => { if (!item.contains(event.target)) item.open = false; });
    if (dock?.open && (!dock.contains(event.target) || event.target.closest("a[href]"))) dock.open = false;
  });

  header.addEventListener("focusout", event => {
    const next = event.relatedTarget;
    if (!next) return;
    if (!header.contains(next)) setMenu(false);
    else disclosures.forEach(item => { if (!item.contains(next)) item.open = false; });
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    const open = disclosures.find(item => item.open);
    if (open) {
      open.open = false;
      open.querySelector("summary").focus();
    } else if (menuIsOpen()) {
      setMenu(false);
      toggle.focus();
    } else if (dock?.open) {
      dock.open = false;
      dock.querySelector("summary").focus({ preventScroll: true });
    }
  });

  if (dock && contact && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      document.body.classList.toggle("contact-in-view", entry.isIntersecting);
    }, { rootMargin: "0px 0px -56px" }).observe(contact);
  }

  header.classList.add("is-ready");
  toggle.hidden = false;
})();
