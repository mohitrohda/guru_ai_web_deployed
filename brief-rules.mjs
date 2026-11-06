export const goals = Object.freeze({
  leads: "Get more enquiries",
  billing: "Simplify billing and stock",
  automation: "Reduce repetitive work",
  software: "Build custom business software",
  unsure: "Help me find the right starting point",
});

const services = new Set([
  "", "AI-Powered Website", "Billing Software", "Custom Software", "CRM / ERP",
  "AI Business Automation", "AI Chatbot / Voice Assistant", "Mobile App",
  "E-commerce Platform", "BI / Analytics Dashboard", "Cloud & DevOps",
  "Cyber Security", "Digital Marketing & Branding", "AI Consulting", "Something else",
]);

const clean = (value, multiline = false) => {
  if (typeof value !== "string") return "";
  // Keep ordinary writing and line breaks in the brief, but strip control characters.
  return value.normalize("NFC").replace(
    multiline ? /[\u0000-\u0009\u000b\u000c\u000e-\u001f\u007f]/g : /[\u0000-\u001f\u007f]/g,
    " ",
  ).trim();
};

export function validateBrief(input) {
  const values = {
    goal: clean(input.goal),
    service: clean(input.service),
    message: clean(input.message, true),
    name: clean(input.name),
    email: clean(input.email),
    phone: clean(input.phone),
  };
  const errors = {};
  if (!Object.hasOwn(goals, values.goal)) errors.goal = "Choose a goal or select the option for help deciding.";
  if (!services.has(values.service)) errors.service = "Choose a service from the list, or leave it open.";
  if (values.message.length < 10 || values.message.length > 1800) errors.message = "Describe the project in 10 to 1,800 characters.";
  if (values.name.length < 2 || values.name.length > 100) errors.name = "Enter a name between 2 and 100 characters.";
  if (values.email.length > 254 || !/^[a-z0-9.!#$%&'*+/=?^_{}|~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (values.phone && (!/^\+?[\d ()-]{7,24}$/.test(values.phone) ||
      !/^\d{7,15}$/.test(values.phone.replace(/\D/g, "")))) errors.phone = "Enter a valid phone number, including the country code if needed.";
  return { values, errors };
}
