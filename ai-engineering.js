/* Progressive navigation, contact handover and gentle motion. */
(() => {
  'use strict';
  const menus = [...document.querySelectorAll('[data-ae-menu]')];
  const close = (menu, restoreFocus = false) => {
    if (!menu.open) return;
    menu.open = false;
    if (restoreFocus) menu.querySelector('summary')?.focus();
  };
  document.addEventListener('click', event => {
    menus.forEach(menu => { if (!menu.contains(event.target)) close(menu); });
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    menus.forEach(menu => close(menu, menu.contains(document.activeElement)));
  });
  menus.forEach(menu => {
    menu.addEventListener('toggle', () => {
      if (menu.open) menus.filter(other => other !== menu).forEach(other => close(other));
    });
    menu.addEventListener('focusout', event => {
      if (event.relatedTarget && !menu.contains(event.relatedTarget)) close(menu);
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      close(menu);
      const toggle = document.querySelector('.nav__toggle');
      if (menu.closest('#mobile-menu') && toggle?.getAttribute('aria-expanded') === 'true') toggle.click();
    }));
  });
  const service = new URLSearchParams(location.search).get('service');
  const select = document.getElementById('cf-service');
  if (select && service && [...select.options].some(option => option.value === service)) {
    select.value = service;
    select.dispatchEvent(new Event('change', { bubbles:true }));
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('ae-enter');
      observer.unobserve(entry.target);
    }), { threshold:.1 });
    document.querySelectorAll('.ae-main [data-ae-reveal]').forEach(node => observer.observe(node));
  }
})();
