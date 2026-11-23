// Input validation and sanitisation. Everything arriving from a browser is untrusted.

// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁠﻿]/g;

/** Strip control / bidi-override characters, collapse whitespace, cap length. */
export const clean = (value, max, { multiline = false } = {}) => {
  if (value === undefined || value === null) return "";
  let s = String(value).replace(CONTROL, "");
  s = multiline ? s.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n") : s.replace(/\s+/g, " ");
  return s.trim().slice(0, max);
};

export const EMAIL_RE = /^[A-Za-z0-9._%+\-]{1,64}@[A-Za-z0-9\-]+(\.[A-Za-z0-9\-]+)*\.[A-Za-z]{2,24}$/;

export const normalisePhone = (raw) => {
  const s = clean(raw, 30);
  if (!s) return "";
  const digits = s.replace(/[^\d]/g, "");
  if (digits.length < 7 || digits.length > 15) return null;
  if (!/^[+\d\s().\-]+$/.test(s)) return null;
  return (s.startsWith("+") ? "+" : "") + digits;
};

export const SERVICES = [
  "AI-Powered Website",
  "Custom Software",
  "AI Business Automation",
  "AI Chatbot / Voice Assistant",
  "Mobile App",
  "Billing Software",
  "Digital Marketing & Branding",
  "AI Consulting",
  "Cloud & DevOps",
  "Cyber Security",
  "Something else / not sure yet",
];

export const STATUSES = ["new", "contacted", "qualified", "won", "lost", "spam"];

const LIMITS = {
  name: 80, company: 120, email: 254, service: 60,
  description: 1500, requirements: 1500, budget: 80, timeline: 80, consentText: 400,
};

/**
 * Validate a lead payload. Returns { value } or { errors }.
 * Never trusts client-side checks; this is the source of truth.
 */
export const validateLead = (body) => {
  const errors = {};
  const v = {
    name: clean(body.name, LIMITS.name),
    company: clean(body.company, LIMITS.company),
    email: clean(body.email, LIMITS.email).toLowerCase(),
    phone: normalisePhone(body.phone),
    service: clean(body.service, LIMITS.service),
    project_description: clean(body.project_description, LIMITS.description, { multiline: true }),
    requirements: clean(body.requirements, LIMITS.requirements, { multiline: true }),
    budget_range: clean(body.budget_range, LIMITS.budget),
    expected_timeline: clean(body.expected_timeline, LIMITS.timeline),
    consent_text: clean(body.consent_text, LIMITS.consentText),
    language: ["en", "hi", "mr"].includes(body.language) ? body.language : "en",
    page_path: clean(body.page_path, 200).replace(/[^\w\-./]/g, "") || null,
    idempotency_key: /^[A-Za-z0-9\-]{16,64}$/.test(String(body.idempotency_key || ""))
      ? String(body.idempotency_key) : null,
  };

  if (v.name.length < 2) errors.name = "Please enter your name.";
  if (!/\p{L}/u.test(v.name)) errors.name = "Please enter your name.";
  if (!EMAIL_RE.test(v.email)) errors.email = "Please enter a valid email address.";
  if (v.phone === null) errors.phone = "Please enter a valid phone number or leave it blank.";
  if (!v.service) errors.service = "Please choose a service.";
  else if (!SERVICES.includes(v.service)) v.service = "Something else / not sure yet";
  if (v.project_description.length < 10) errors.project_description = "Please describe your project in a sentence or two.";
  if (body.consent !== true) errors.consent = "Consent is required so we can contact you about this enquiry.";

  if (Object.keys(errors).length) return { errors };
  v.phone = v.phone || null;
  return { value: v };
};
