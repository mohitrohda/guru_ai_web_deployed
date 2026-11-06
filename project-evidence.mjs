// Add only company-approved amounts. These values are public if present.
const startingPrices = Object.freeze({});
// An approved metric needs an integer value, a label and a public source description.
const verifiedMetrics = Object.freeze([]);

const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 0,
});
const numbers = new Intl.NumberFormat("en-IN");

for (const element of document.querySelectorAll("[data-starting-price]")) {
  const price = startingPrices[element.dataset.startingPrice];
  if (!price?.approved || !Number.isSafeInteger(price.amount) || price.amount <= 0) continue;
  element.textContent = "Starting at " + rupees.format(price.amount);
  element.hidden = false;
}

const section = document.querySelector("[data-verified-metrics]");
const list = section.querySelector("dl");
const entries = verifiedMetrics.filter(metric =>
  metric.approved && Number.isSafeInteger(metric.value) && metric.value >= 0 &&
  typeof metric.label === "string" && metric.label.trim() &&
  typeof metric.source === "string" && metric.source.trim(),
);
if (entries.length) {
  const counters = entries.map(({ label, value, source }) => {
    const group = document.createElement("div");
    const term = document.createElement("dt");
    const count = document.createElement("dd");
    const number = document.createElement("span");
    const screenReader = document.createElement("span");
    const evidence = document.createElement("dd");
    term.textContent = label;
    number.textContent = screenReader.textContent = numbers.format(value);
    number.setAttribute("aria-hidden", "true");
    screenReader.className = "visually-hidden";
    evidence.className = "verified-metrics__source";
    evidence.textContent = source;
    count.append(number, screenReader);
    group.append(term, count, evidence);
    list.append(group);
    return { number, value };
  });
  section.hidden = false;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  if ("IntersectionObserver" in window && !reduced.matches) {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const started = performance.now();
      const update = now => {
        const progress = reduced.matches ? 1 : Math.min(1, (now - started) / 650);
        for (const { number, value } of counters) {
          number.textContent = numbers.format(Math.round(value * (1 - (1 - progress) ** 3)));
        }
        if (progress < 1) requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
    });
    observer.observe(section);
  }
}
