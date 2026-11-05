/* ============================================================
   GURU chatbot data — knowledge.js
   Registry + canonical company facts. Loaded FIRST.
   Every other data file pushes intent packs into
   GURU.chatbotData.intents via GURU.chatbotData.register().
   Scaling later = adding entries or new files. No engine changes.
   ============================================================ */

window.GURU = window.GURU || {};

window.GURU.chatbotData = (() => {
  "use strict";

  const company = {
    name: "GURU AI TECHNOLOGIES",
    phone: "+91 80876 95569",
    email: "contact@guruaitechnologies.com",
    location: "Pune, Maharashtra, India",
    hours: "Monday to Saturday, 10:00 AM – 7:00 PM",
    services: [
      "AI-Powered Websites", "Custom Software Development",
      "AI Business Automation", "AI Chatbots & Voice Assistants",
      "Mobile App Development", "Business Billing Software",
      "Digital Marketing & Branding", "AI Consulting",
      "Cloud & DevOps Solutions", "Cyber Security Solutions",
    ],
  };

  const intents = [];
  const register = (pack) => intents.push(...pack);

  return { company, intents, register };
})();
