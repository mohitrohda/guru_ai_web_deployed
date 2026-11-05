(() => {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('catalogue-revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: .15 });

  document.querySelectorAll('[data-catalogue-reveal], .delivery-grid li').forEach(el => observer.observe(el));
})();
