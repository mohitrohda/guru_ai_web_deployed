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

  const flowSteps = [...document.querySelectorAll('[data-flow-step]')];
  const flowToggle = document.querySelector('[data-flow-toggle]');
  let flowIndex = 0, flowTimer = null, flowPaused = false;
  const stopFlow = () => { if (flowTimer) window.clearInterval(flowTimer); flowTimer = null; };
  const startFlow = () => {
    stopFlow();
    if (reduced.matches || flowPaused || document.hidden || !flowSteps.length) return;
    flowTimer = window.setInterval(() => { flowIndex = (flowIndex + 1) % flowSteps.length; flowSteps.forEach((step, index) => step.classList.toggle('is-current', index === flowIndex)); }, 2400);
  };
  flowToggle?.addEventListener('click', () => { flowPaused = !flowPaused; flowToggle.textContent = flowPaused ? 'Play animation' : 'Pause animation'; flowToggle.setAttribute('aria-pressed', String(flowPaused)); startFlow(); });
  const updateFlowMotion = () => { if (flowToggle) flowToggle.hidden = reduced.matches; startFlow(); };
  document.addEventListener('visibilitychange', startFlow);
  reduced.addEventListener('change', updateFlowMotion);
  updateFlowMotion();

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

  const viewport = document.querySelector('.hp-feedback-viewport');
  const cards = [...document.querySelectorAll('.hp-feedback-card')];
  const play = document.querySelector('[data-feedback-play]');
  const status = document.querySelector('[data-feedback-status]');
  let feedbackTimer = null, feedbackPlaying = false, feedbackHovered = false, feedbackFocused = false;
  const visibleCount = () => Math.max(1, Math.round((viewport?.clientWidth || 1) / (cards[0]?.getBoundingClientRect().width || 1)));
  const activeIndex = () => Math.max(0, Math.round((viewport?.scrollLeft || 0) / ((cards[0]?.getBoundingClientRect().width || 1) + 16)));
  const updateStatus = () => { if (!status || !cards.length) return; const first = activeIndex(); status.textContent = `${first + 1}–${Math.min(cards.length, first + visibleCount())} of ${cards.length} client comments`; };
  const moveFeedback = direction => {
    if (!viewport || !cards.length) return;
    const visible = visibleCount();
    let next = activeIndex() + direction * visible;
    const last = Math.max(0, cards.length - visible);
    if (direction > 0) next = activeIndex() >= last ? 0 : Math.min(last, next);
    else next = activeIndex() === 0 ? last : Math.max(0, next);
    viewport.scrollTo({ left: cards[next].offsetLeft - cards[0].offsetLeft, behavior: reduced.matches ? 'auto' : 'smooth' });
  };
  const stopFeedback = () => { if (feedbackTimer) window.clearInterval(feedbackTimer); feedbackTimer = null; };
  const startFeedback = () => {
    stopFeedback();
    if (!feedbackPlaying || feedbackHovered || feedbackFocused || document.hidden || reduced.matches) return;
    feedbackTimer = window.setInterval(() => moveFeedback(1), 8000);
  };
  document.querySelector('[data-feedback-prev]')?.addEventListener('click', () => moveFeedback(-1));
  document.querySelector('[data-feedback-next]')?.addEventListener('click', () => moveFeedback(1));
  play?.addEventListener('click', () => { feedbackPlaying = !feedbackPlaying; play.textContent = feedbackPlaying ? 'Pause' : 'Play'; play.setAttribute('aria-pressed', String(feedbackPlaying)); startFeedback(); });
  viewport?.addEventListener('scroll', updateStatus, { passive: true });
  viewport?.addEventListener('mouseenter', () => { feedbackHovered = true; stopFeedback(); });
  viewport?.addEventListener('mouseleave', () => { feedbackHovered = false; startFeedback(); });
  viewport?.addEventListener('focusin', () => { feedbackFocused = true; stopFeedback(); });
  viewport?.addEventListener('focusout', event => { if (!viewport.contains(event.relatedTarget)) { feedbackFocused = false; startFeedback(); } });
  viewport?.addEventListener('keydown', event => { if (event.target !== viewport || !['ArrowLeft','ArrowRight'].includes(event.key)) return; event.preventDefault(); moveFeedback(event.key === 'ArrowRight' ? 1 : -1); });
  document.addEventListener('visibilitychange', startFeedback);
  reduced.addEventListener('change', () => { if (play) play.hidden = reduced.matches; startFeedback(); });
  if (play) play.hidden = reduced.matches;
  window.addEventListener('resize', updateStatus);
  updateStatus();
})();
