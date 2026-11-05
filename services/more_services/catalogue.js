(() => {
  'use strict';

  const search = document.getElementById('service-search');
  const filter = document.getElementById('service-category');
  const results = document.getElementById('service-results');
  const empty = document.getElementById('no-results');
  const categories = [...document.querySelectorAll('.catalogue-directory .category')].map(section => ({
    section,
    count: section.querySelector('.category-count'),
    cards: [...section.querySelectorAll('.cardlink')],
  }));
  const total = categories.reduce((sum, group) => sum + group.cards.length, 0);
  const normalize = value => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const label = count => count + (count === 1 ? ' service' : ' services');

  const update = () => {
    const terms = normalize(search.value).split(' ').filter(Boolean);
    let matches = 0;

    categories.forEach(({ section, count, cards }) => {
      const selected = !filter.value || section.id === filter.value;
      let visible = 0;
      cards.forEach(card => {
        const text = normalize(card.dataset.search + ' ' + section.id);
        const show = selected && terms.every(term => text.includes(term));
        card.hidden = !show;
        if (show) visible += 1;
      });
      section.hidden = !visible;
      count.textContent = label(visible);
      matches += visible;
    });

    results.textContent = 'Showing ' + label(matches) + ' of ' + total;
    empty.hidden = matches !== 0;
  };

  const clear = () => {
    search.value = '';
    filter.value = '';
    update();
  };

  search.addEventListener('input', update);
  filter.addEventListener('change', update);
  document.querySelector('[data-clear-filters]').addEventListener('click', () => {
    clear();
    search.focus();
  });

  // Category links still lead to their section when a previous filter hid it.
  document.querySelectorAll('a[href*="#"]').forEach(link => {
    const category = categories.find(group => '#' + group.section.id === link.hash);
    if (category) link.addEventListener('click', () => {
      if (category.section.hidden) clear();
    });
  });

  document.querySelector('.catalogue-filters').hidden = false;
  update();
})();
