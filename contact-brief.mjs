import { validateBrief } from "./brief-rules.mjs";

const form = document.getElementById("contact-form");
const steps = [...form.querySelectorAll("[data-brief-step]")];
const progress = [...form.querySelectorAll("[data-brief-progress]")];
const next = form.querySelector("[data-brief-next]");
const back = form.querySelector("[data-brief-back]");
const submit = form.querySelector('[type="submit"]');
const status = form.querySelector(".form__status");
const whatsapp = form.querySelector("[data-form-whatsapp]");
const submitLabel = submit.textContent;
const fields = steps.map(step => [...step.querySelectorAll("[name]")]);
const motion = matchMedia("(prefers-reduced-motion: reduce)");
let current = 0;
let pending = false;
let draft = "";
let key;

function announce(message, state, fallback = false) {
  status.textContent = message;
  status.classList.toggle("is-error", state === "error");
  status.classList.toggle("is-success", state === "success");
  whatsapp.hidden = !fallback;
}

function showStep(index, focus = true) {
  const switched = index !== current;
  current = index;
  steps.forEach((step, i) => {
    step.hidden = i !== current;
    if (i === current) progress[i].setAttribute("aria-current", "step");
    else progress[i].removeAttribute("aria-current");
  });
  if (switched && !motion.matches) {
    steps[current].animate?.([{ opacity: .84, translate: "0 4px" }, { opacity: 1, translate: "0" }], {
      duration: 240, easing: "ease-out",
    });
  }
  if (focus) steps[current].querySelector("legend").focus();
}

function fieldError(field, message = "") {
  field.setAttribute("aria-invalid", String(Boolean(message)));
  field.closest(".form__field").classList.toggle("has-error", Boolean(message));
  document.getElementById(field.getAttribute("aria-describedby")).textContent = message;
}

function showErrors(errors, index) {
  const group = fields[index];
  group.forEach(field => fieldError(field, errors[field.name]));
  const invalid = group.find(field => errors[field.name]);
  if (!invalid) return false;
  showStep(index, false);
  announce("Please check the highlighted fields.", "error");
  invalid.focus();
  return true;
}

const collect = () => Object.fromEntries(new FormData(form));

function continueBrief() {
  if (pending) return;
  const { errors } = validateBrief(collect());
  if (showErrors(errors, 0)) return;
  announce("");
  showStep(1);
}

next.addEventListener("click", continueBrief);
back.addEventListener("click", () => {
  if (pending) return;
  announce("");
  showStep(0);
});
form.addEventListener("brief:goal", () => {
  if (pending) return;
  fieldError(form.elements.goal);
  fieldError(form.elements.service);
  announce("");
  showStep(0, false);
});
fields.flat().forEach(field => field.addEventListener("input", () => {
  if (field.getAttribute("aria-invalid") !== "true") return;
  const { errors } = validateBrief(collect());
  fieldError(field, errors[field.name]);
}));

const makeKey = () => Array.from(
  crypto.getRandomValues(new Uint8Array(16)),
  byte => byte.toString(16).padStart(2, "0"),
).join("");

const failureMessages = {
  delivery_unconfigured: "The online form is currently unavailable. Contact us on WhatsApp or email.",
  delivery_uncertain: "We couldn’t confirm delivery. Please contact us on WhatsApp about this brief.",
  delivery_pending: "This brief is already being sent. Wait a moment before checking again.",
  rate_limited: "Please wait before trying again, or contact us on WhatsApp.",
};

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (pending) return;
  if (current === 0) {
    continueBrief();
    return;
  }
  const raw = collect();
  const { values, errors } = validateBrief(raw);
  if (showErrors(errors, 0) || showErrors(errors, 1)) return;
  if (raw.website) return;

  const fingerprint = JSON.stringify(values);
  if (fingerprint !== draft) {
    draft = fingerprint;
    key = makeKey();
  }
  pending = true;
  submit.disabled = back.disabled = true;
  submit.textContent = "Sending…";
  form.setAttribute("aria-busy", "true");
  announce("Sending your project brief…");

  try {
    const response = await fetch("./api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, website: raw.website, key }),
      signal: AbortSignal.timeout(16000),
    });
    const result = await response.json().catch(() => null);
    if (response.ok && result?.ok === true && result.code === "accepted") {
      form.reset();
      draft = "";
      showStep(0, false);
      announce("Your project brief was sent. We usually reply within 24 hours, Monday to Saturday.", "success");
      status.tabIndex = -1;
      status.focus();
    } else {
      const code = response.status === 404 || response.status === 405 ? "delivery_unconfigured" : result?.code;
      announce(failureMessages[code] ?? "We couldn’t send your brief. Please try again or contact us on WhatsApp.", "error", true);
    }
  } catch {
    announce("We couldn’t confirm delivery. Retry here or contact us on WhatsApp.", "error", true);
  } finally {
    pending = false;
    submit.disabled = back.disabled = false;
    submit.textContent = submitLabel;
    form.removeAttribute("aria-busy");
  }
});

next.disabled = submit.disabled = false;
