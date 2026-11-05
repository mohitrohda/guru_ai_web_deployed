/* Progressive homepage interactions. No external libraries or inline handlers. */
(() => {
  'use strict';
  const root = document.querySelector('.intent-home');
  if (!root) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  const select = document.getElementById('cf-service');
  const chips = [...document.querySelectorAll('[data-service-choice]')];
  const syncChips = () => chips.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.serviceChoice === select?.value)));
  const chooseService = value => {
    if (!select || ![...select.options].some(option => option.value === value)) return;
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    syncChips();
  };
  chips.forEach(button => button.addEventListener('click', () => chooseService(button.dataset.serviceChoice)));
  select?.addEventListener('change', syncChips);
  select?.form?.addEventListener('reset', () => requestAnimationFrame(syncChips));
  document.querySelector('[data-more-services]')?.addEventListener('click', () => { select?.scrollIntoView({ block: 'center', behavior: reduced.matches ? 'auto' : 'smooth' }); select?.focus({ preventScroll: true }); });
  syncChips();

  const goals = {
    leads: { title: 'Make the first impression count.', copy: 'A clear website helps people understand your business. Chatbots and digital marketing can support the next conversation.', keys: ['websites', 'chatbots', 'marketing'], service: 'AI-Powered Website', links: [['AI-powered websites', 'services/ai-websites.html'], ['AI chatbots', 'services/chatbots-voice.html'], ['Digital marketing', 'services/digital-marketing.html']] },
    billing: { title: 'Make the counter easier to run.', copy: 'Start with billing designed around your business type. Explore invoicing, inventory and reporting, then discuss the workflow your team uses each day.', keys: ['billing', 'software'], service: 'Billing Software', links: [['Industry-specific billing', 'services/billing-software.html'], ['Custom software', 'services/software-development.html']] },
    automation: { title: 'Give repetitive work a better path.', copy: 'Explore follow-ups, reporting and data movement that can be automated. An AI consultation can help identify a practical place to begin.', keys: ['automation', 'consulting', 'chatbots'], service: 'AI Business Automation', links: [['Business automation', 'services/ai-automation.html'], ['AI consulting', 'services/ai-consulting.html'], ['AI chatbots', 'services/chatbots-voice.html']] },
    software: { title: 'Build around how your team works.', copy: 'Explore custom software, internal tools and mobile apps. Start with your users, the tools you already have and the problem you want to solve.', keys: ['software', 'mobile', 'cloud'], service: 'Custom Software', links: [['Custom software', 'services/software-development.html'], ['Mobile applications', 'services/mobile-apps.html'], ['Cloud and DevOps', 'services/cloud-devops.html']] }
  };
  let currentGoal = 'leads';
  const goalLinks = [...document.querySelectorAll('[data-goal]')];
  const result = document.getElementById('hp-goal-results');
  const displayGoal = key => {
    const goal = goals[key];
    if (!goal || !result) return;
    currentGoal = key;
    goalLinks.forEach(link => { const active = link.dataset.goal === key; if (active) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current'); });
    result.querySelector('h3').textContent = goal.title;
    result.querySelector('p:not(.hp-label)').textContent = goal.copy;
    const links = result.querySelector('.hp-goal-links');
    links.replaceChildren(...goal.links.map(([label, href]) => { const link = document.createElement('a'); link.href = href; link.textContent = label + ' ↗'; return link; }));
    document.querySelectorAll('[data-service]').forEach(card => card.classList.toggle('is-recommended', goal.keys.includes(card.dataset.service)));
  };
  goalLinks.forEach(link => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault(); displayGoal(link.dataset.goal);
  }));
  document.querySelector('[data-goal-discuss]')?.addEventListener('click', () => chooseService(goals[currentGoal].service));
  displayGoal(currentGoal);

  const comparison = document.getElementById('hp-comparison-range');
  const stage = document.querySelector('.hp-compare-stage');
  comparison?.addEventListener('input', () => { stage?.style.setProperty('--compare', comparison.value + '%'); comparison.setAttribute('aria-valuetext', comparison.value + ' percent connected workflow'); });

  const steps = [...document.querySelectorAll('.hp-process-list .process-step')];
  const process = document.getElementById('process');
  let framePending = false;
  const updateProcess = () => {
    framePending = false;
    let reached = 0;
    steps.forEach((step, index) => { const active = step.getBoundingClientRect().top < window.innerHeight * .85; step.classList.toggle('is-in-view', active); if (active) reached = index + 1; });
    process?.style.setProperty('--process-progress', (steps.length ? reached / steps.length * 100 : 0) + '%');
  };
  const queueProcess = () => { if (framePending) return; framePending = true; window.requestAnimationFrame(updateProcess); };
  window.addEventListener('scroll', queueProcess, { passive: true });
  window.addEventListener('resize', queueProcess);
  updateProcess();
})();

(() => {
  'use strict';

  const carousel = document.querySelector('[data-service-carousel]');
  if (!carousel) return;

  const rail = carousel.querySelector('.home-services-carousel__rail');
  const cards = [...rail.querySelectorAll('[data-service]')];
  const dots = carousel.querySelector('[data-service-dots]');
  const arrows = carousel.querySelectorAll('[data-service-direction]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (cards.length < 2) return;

  const canObserve = 'IntersectionObserver' in window;
  let active = -1;
  let target = null;
  let visible = !canObserve;
  let hovered = false;
  let touching = false;
  let autoplay;
  const schedule = () => {
    clearTimeout(autoplay);
    if (!visible || document.hidden || reduced.matches || hovered || touching ||
        carousel.querySelector(':focus-visible')) return;
    autoplay = setTimeout(() => show((target ?? active) + 1), 1500);
  };
  const wrap = index => (index + cards.length) % cards.length;
  const centeredLeft = card => card.offsetLeft + (card.offsetWidth - rail.clientWidth) / 2;

  const setActive = index => {
    if (target === index) target = null;
    if (active === index) return;

    if (active >= 0) {
      cards[active].classList.remove('is-current');
      buttons[active].removeAttribute('aria-current');
      buttons[active].tabIndex = -1;
    }
    active = index;
    cards[active].classList.add('is-current');
    buttons[active].setAttribute('aria-current', 'true');
    buttons[active].tabIndex = 0;
  };

  const show = (index, smooth = true) => {
    const next = wrap(index);
    const animate = smooth && !reduced.matches && Math.abs(next - active) <= 2;
    target = next;
    rail.scrollTo({ left: centeredLeft(cards[next]), behavior: animate ? 'smooth' : 'instant' });
    if (!animate) setActive(next);
    schedule();
  };

  const buttons = cards.map((card, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'home-services-carousel__dot';
    button.tabIndex = -1;
    button.setAttribute('aria-label', 'Show ' + card.querySelector('h3').textContent);
    button.setAttribute('aria-controls', rail.id);
    button.addEventListener('click', () => show(index));
    return button;
  });

  dots.append(...buttons);
  arrows.forEach(arrow => {
    arrow.addEventListener('click', () => show((target ?? active) + Number(arrow.dataset.serviceDirection)));
    arrow.hidden = false;
  });
  dots.hidden = false;
  carousel.classList.add('is-ready');
  // Start with websites in the center and a preview on either side.
  show(1, false);

  rail.addEventListener('scroll', () => {
    const step = cards[1].offsetLeft - cards[0].offsetLeft;
    const nearest = Math.round((rail.scrollLeft - centeredLeft(cards[0])) / step);
    setActive(Math.max(0, Math.min(cards.length - 1, nearest)));
    schedule();
  }, { passive: true });
  carousel.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    hovered = true;
    schedule();
  });
  carousel.addEventListener('pointerleave', () => {
    hovered = false;
    schedule();
  });
  carousel.addEventListener('focusin', schedule);
  carousel.addEventListener('focusout', () => queueMicrotask(schedule));
  rail.addEventListener('pointerdown', event => {
    target = null;
    touching = event.pointerType === 'touch';
    schedule();
  });
  const releaseTouch = () => {
    if (!touching) return;
    touching = false;
    schedule();
  };
  window.addEventListener('pointerup', releaseTouch);
  window.addEventListener('pointercancel', releaseTouch);
  rail.addEventListener('wheel', () => { target = null; schedule(); }, { passive: true });
  reduced.addEventListener('change', schedule);
  document.addEventListener('visibilitychange', schedule);
  if (canObserve) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    }, { threshold: .2 }).observe(rail);
  }
  rail.addEventListener('focusin', event => {
    const index = cards.indexOf(event.target.closest('[data-service]'));
    if (index >= 0 && index !== active) show(index, false);
  });

  carousel.addEventListener('keydown', event => {
    const dotFocused = dots.contains(event.target);
    if (event.target !== rail && !dotFocused) return;
    const selected = target ?? active;
    const destinations = { ArrowLeft: selected - 1, ArrowRight: selected + 1, Home: 0, End: cards.length - 1 };
    if (!Object.hasOwn(destinations, event.key)) return;
    event.preventDefault();
    const destination = destinations[event.key];
    show(destination);
    if (dotFocused) buttons[wrap(destination)].focus({ preventScroll: true });
  });

  if ('ResizeObserver' in window) {
    new ResizeObserver(() => show(target ?? active, false)).observe(rail);
  }
})();

(() => {
  'use strict';

  const workflow = document.getElementById('workflow');
  if (!workflow) return;

  const steps = [...workflow.querySelectorAll('[data-nx-step]')];
  const panels = workflow.querySelectorAll('[data-flow-visible]');
  const caption = workflow.querySelector('#nx-flow-caption');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const captions = [
    'A message starts the journey.',
    'AI understands the request.',
    'Useful details are extracted.',
    'A CRM lead keeps the context.',
    'A time is chosen.',
    'Confirmation reaches everyone.',
  ];

  const demo = workflow.querySelector('.nx-demo');
  const canObserve = 'IntersectionObserver' in window;
  let active = 0;
  let visible = !canObserve;
  let hovered = false;
  let timer;

  const showStep = index => {
    active = index;
    steps.forEach((step, position) => {
      const selected = position === index;
      step.classList.toggle('is-active', selected);
      step.setAttribute('aria-pressed', String(selected));
    });
    panels.forEach(panel => panel.classList.toggle('is-shown', Number(panel.dataset.flowVisible) === index));
    caption.textContent = `0${index + 1} / ${captions[index]}`;
  };

  const schedule = () => {
    clearTimeout(timer);
    if (!visible || document.hidden || reduced.matches || hovered ||
        demo.querySelector(':focus-visible')) return;
    timer = setTimeout(() => {
      showStep((active + 1) % steps.length);
      schedule();
    }, 2400);
  };

  steps.forEach((button, index) => button.addEventListener('click', () => {
    showStep(index);
    schedule();
  }));
  demo.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    hovered = true;
    schedule();
  });
  demo.addEventListener('pointerleave', () => {
    hovered = false;
    schedule();
  });
  demo.addEventListener('focusin', schedule);
  demo.addEventListener('focusout', () => queueMicrotask(schedule));
  reduced.addEventListener('change', schedule);
  document.addEventListener('visibilitychange', schedule);

  if (canObserve) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    }).observe(demo);
  }

  showStep(0);
  schedule();
})();

(()=>{if(!('IntersectionObserver'in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const targets=[...document.querySelectorAll('#about .intro__copy,#about .hp-fix-stack a,#services .section__head,#clients .section__head,#clients .clients-strip li')];targets.forEach((el,i)=>{el.style.setProperty('--nx-delay',(i%4)*65+'ms');if(el.getBoundingClientRect().top>window.innerHeight*.85)el.classList.add('nx-entry-pending')});const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;entry.target.classList.add('nx-entry-in');entry.target.classList.remove('nx-entry-pending');observer.unobserve(entry.target)}},{threshold:.12,rootMargin:'0px 0px -5% 0px'});targets.forEach(el=>observer.observe(el))})();
