/* GURU AI assistant: leadflow.js
   Conversational project-intake state machine. Pure logic, no DOM and no network:
   the UI renders its output and performs the actual submission.

   Honesty rules baked in:
   - Nothing is "sent" until the visitor explicitly consents on the summary step.
   - Success is only reported when the UI passes in a backend-confirmed result (onSubmitResult).
   - Optional fields can be skipped; known details are never asked twice; any detail can be corrected. */
window.GURU = window.GURU || {};

window.GURU.leadFlow = (() => {
  "use strict";

  const ORDER = ["name", "company", "email", "phone", "service", "description", "requirements", "budget", "timeline"];
  const OPTIONAL = new Set(["company", "phone", "requirements", "budget", "timeline"]);

  const SERVICES = [
    "AI-Powered Website", "Custom Software", "AI Business Automation", "AI Chatbot / Voice Assistant",
    "Mobile App", "Billing Software", "Digital Marketing & Branding", "AI Consulting",
    "Cloud & DevOps", "Cyber Security", "Something else / not sure yet",
  ];
  const SERVICE_HINTS = [
    [/\b(website|web ?site|web ?app|landing page|portfolio site|online store|e-?commerce|site)\b/i, "AI-Powered Website"],
    [/\b(chat ?bot|voice (assistant|agent|bot)|whatsapp bot|ai agent|assistant)\b/i, "AI Chatbot / Voice Assistant"],
    [/\b(automat\w*|workflow|rpa|integration)\b/i, "AI Business Automation"],
    [/\b(mobile app|android|ios|\bapp\b|application)\b/i, "Mobile App"],
    [/\b(billing|invoice|invoicing|gst|pos\b|point of sale)\b/i, "Billing Software"],
    [/\b(crm|erp|hrms|lms|software|saas|dashboard|portal|inventory)\b/i, "Custom Software"],
    [/\b(seo|marketing|branding|social media|ads?\b|logo)\b/i, "Digital Marketing & Branding"],
    [/\b(consult\w*|strategy|roadmap)\b/i, "AI Consulting"],
    [/\b(cloud|devops|ci\/cd|hosting|migration|aws|azure)\b/i, "Cloud & DevOps"],
    [/\b(security|cyber|pentest|penetration|audit)\b/i, "Cyber Security"],
  ];

  /* ---------------------------- intent detection --------------------------- */
  const INTENT = [
    /\b(start|begin|kick ?off|discuss|plan(ning)?|launch)\b.{0,25}\b(a |an |my |our |the |new )?(project|website|web ?site|app|software|chat ?bot|automation|crm|erp)/i,
    /\b(i|we)\s+(want|need|would like|wish|require|am looking|are looking|'d like)\b.{0,40}\b(build|make|develop|create|get|have|website|web ?site|app|software|chat ?bot|crm|erp|hrms|automation|billing)/i,
    /\b(looking (for|to)|interested in)\b.{0,40}\b(build|develop|website|app|software|chat ?bot|crm|erp|automation|billing)/i,
    /\b(get|need|want|send|give)\b.{0,12}\b(a )?(quote|quotation|estimate|proposal)\b/i,
    /\b(hire|work with|engage)\b.{0,15}\b(you|your team|guru|us)\b/i,
    /\b(new project|project enquiry|project inquiry|start now|get started|let'?s (start|begin|talk|build))\b/i,
    /\b(mujhe|hamein|humein|mera|humko)\b.{0,50}\b(banwana|banwani|banvana|banana|banao|chahiye|karwana|banwa)/i,
    /\b(website|app|software|chat ?bot|crm|erp)\b.{0,30}\b(banwana|banvana|banwani|banana|chahiye)\b/i,
    /\b(mala|amhala|majha|majhya)\b.{0,50}\b(pahije|havay|hava|banvaycha|banvayche|banvaychi|karaycha)/i,
    /\b(website|app|software|chat ?bot|crm|erp)\b.{0,30}\b(pahije|havay|banvaycha|banvayche)\b/i,
  ];
  // Pure information questions must not trigger intake ("how much does a website cost?").
  const INFO_ONLY = /^\s*(what|how|why|when|where|which|who|do you|does|can you|kya|kitna|kitne|kaise|kay|kiti|kasa|kashi)\b/i;
  const STRONG = /\b(start|begin|hire|quote|quotation|estimate|proposal|new project|get started|want|need|looking|chahiye|banwana|banwani|banvana|banvani|banana|banao|karwana|banwa|pahije|havay|banvaycha|banvayche|banvaychi)\b/i;
  const detect = (text) => {
    const t = String(text || "");
    if (t.length < 8) return false;
    if (INFO_ONLY.test(t) && !/\b(i|we) (want|need)|mujhe|mala|i'?d like|start a project|get a quote/i.test(t)) return false;
    return INTENT.some((re) => re.test(t)) && (STRONG.test(t) || /\bproject\b/i.test(t));
  };

  const HUMAN = /\b(human|real person|live agent|agent|representative|someone|salesperson|sales team|call me|call back|callback|talk to (a |an )?(person|human|someone|team)|speak (to|with) (a |an )?(person|human|someone|team)|insaan|manus|kisi se baat|team se baat|koni tari|manushyashi)\b/i;
  const wantsHuman = (text) => HUMAN.test(String(text || ""));

  /* -------------------------------- i18n copy ------------------------------ */
  const T = {
    en: {
      intro: "Happy to help you get started. I'll ask a few quick questions (about two minutes). You can skip the optional ones, and you'll review everything before anything is sent.",
      name: "What's your name?",
      company: "Which company or business is this for? (Type \"skip\" if it's personal.)",
      email: (n) => `Thanks${n ? ", " + n : ""}. What's the best email address to reach you?`,
      phone: "A phone or WhatsApp number? It's optional, so you can skip it.",
      service: "Which service do you need? Pick one below or type it.",
      description: "Briefly, what would you like us to build or improve?",
      requirements: "Any specific features or requirements we should know about? (Optional)",
      budget: "Do you have an approximate budget in mind? Optional, and it doesn't commit you to anything.",
      timeline: "When would you like this done? (Optional)",
      badName: "I didn't catch a name there. Could you type your name?",
      badEmail: "That email doesn't look right. Could you check it? (For example name@company.com)",
      badPhone: "That number doesn't look valid. Please include the digits only, or type \"skip\".",
      shortDesc: "Could you add a little more detail (a sentence or two)? It helps the team prepare.",
      summaryHead: "Here's what I have. Please check it:",
      labels: { name: "Name", company: "Company", email: "Email", phone: "Phone", service: "Service", description: "Project", requirements: "Requirements", budget: "Budget", timeline: "Timeline" },
      none: "Not provided",
      consent: "If you confirm, GURU AI Technologies will store these details and contact you about this enquiry. Nothing else is saved from this chat. See the Privacy Policy for details. Shall I send it?",
      confirm: "Yes, I agree. Send it", edit: "Edit details", cancel: "Cancel", skip: "Skip", notNow: "Not now", retry: "Try again",
      editWhich: "Which detail would you like to change?",
      editCurrent: (label, v) => `Current ${label}: ${v || "not provided"}. What should it be?`,
      confirmHelp: "Please choose one of the options below: send it, edit a detail, or cancel.",
      cancelled: "No problem, nothing was sent. If you'd like to start again, just say so, or talk to the team directly.",
      saving: "Sending your request…",
      success: (ref, email) => `Thank you. Your request has been saved (reference ${ref}). The team will contact you at ${email} about this enquiry. You can also reach us directly on WhatsApp.`,
      duplicate: (ref) => `We already have this enquiry on file (reference ${ref}), so I haven't sent a second copy. The team will be in touch.`,
      failed: "I couldn't save your request just now, and nothing has been sent. Please try again, or contact the team directly below.",
      rate: "You've reached the limit for enquiries from this connection. Please try again later, or contact the team directly.",
      captchaIntro: "One quick spam check before I send it:",
      captchaFail: "The spam check didn't complete. Please try again.",
      unavailable: "I can't take project details directly right now. The fastest way to start is to message the team:",
      backStart: "Of course, going back.",
      human: "Of course. Here are the quickest ways to reach a person on the team:",
      gotIt: (what) => `Got it, I noted your ${what}.`,
    },
    hi: {
      intro: "Zaroor, main aapki madad karta hoon. Kuch chhote sawaal poochunga (lagbhag do minute). Optional sawaal skip kar sakte hain, aur kuch bhejne se pehle aap sab review karenge.",
      name: "Aapka naam kya hai?",
      company: "Yeh kis company ya business ke liye hai? (Personal ho toh \"skip\" likhiye.)",
      email: (n) => `Shukriya${n ? " " + n : ""}. Aapko kis email par contact karein?`,
      phone: "Phone ya WhatsApp number? Yeh optional hai, skip kar sakte hain.",
      service: "Aapko kaun si service chahiye? Neeche se chuniye ya likh dijiye.",
      description: "Thoda bataiye, aap kya banwana ya sudharna chahte hain?",
      requirements: "Koi khaas features ya requirements jo hamein pata honi chahiye? (Optional)",
      budget: "Kya aapke mann mein koi approximate budget hai? Optional hai, aur isse aap kisi cheez ke liye bandhte nahi.",
      timeline: "Aap yeh kab tak chahte hain? (Optional)",
      badName: "Mujhe naam samajh nahi aaya. Kya aap apna naam likh sakte hain?",
      badEmail: "Yeh email sahi nahi lag raha. Dobara check kijiye (jaise name@company.com).",
      badPhone: "Yeh number sahi nahi lag raha. Sirf digits likhiye, ya \"skip\" likhiye.",
      shortDesc: "Thoda aur detail dijiye (ek-do line). Isse team ko taiyari mein madad milti hai.",
      summaryHead: "Yeh details mere paas hain. Kripya check kijiye:",
      labels: { name: "Naam", company: "Company", email: "Email", phone: "Phone", service: "Service", description: "Project", requirements: "Requirements", budget: "Budget", timeline: "Timeline" },
      none: "Nahi diya",
      consent: "Confirm karne par GURU AI Technologies yeh details save karegi aur is enquiry ke baare mein aapse sampark karegi. Is chat se aur kuch save nahi hota. Details ke liye Privacy Policy dekhiye. Bhej doon?",
      confirm: "Haan, main sahmat hoon. Bhejiye", edit: "Details badlein", cancel: "Cancel", skip: "Skip", notNow: "Abhi nahi", retry: "Dobara koshish karein",
      editWhich: "Kaun si detail badalni hai?",
      editCurrent: (label, v) => `Abhi ${label}: ${v || "nahi diya"}. Ab kya rakhna hai?`,
      confirmHelp: "Kripya neeche se chuniye: bhejna, detail badalna, ya cancel.",
      cancelled: "Koi baat nahi, kuch nahi bheja gaya. Dobara shuru karna ho toh bataiye, ya seedha team se baat kijiye.",
      saving: "Aapki request bheji ja rahi hai…",
      success: (ref, email) => `Shukriya. Aapki request save ho gayi hai (reference ${ref}). Team is enquiry ke baare mein ${email} par sampark karegi. Aap seedha WhatsApp bhi kar sakte hain.`,
      duplicate: (ref) => `Yeh enquiry pehle se hamare paas hai (reference ${ref}), isliye dusri copy nahi bheji. Team aapse sampark karegi.`,
      failed: "Abhi aapki request save nahi ho paayi, aur kuch bheja nahi gaya. Kripya dobara koshish kijiye, ya neeche se seedha team se sampark kijiye.",
      rate: "Is connection se enquiry ki limit poori ho gayi hai. Kripya baad mein koshish kijiye, ya seedha team se sampark kijiye.",
      captchaIntro: "Bhejne se pehle ek chhota spam check:",
      captchaFail: "Spam check poora nahi hua. Kripya dobara koshish kijiye.",
      unavailable: "Abhi main project details seedha nahi le sakta. Shuru karne ka sabse tez tareeka team ko message karna hai:",
      backStart: "Zaroor, peeche chalte hain.",
      human: "Zaroor. Team ke kisi insaan se sampark ke sabse tez tareeke:",
      gotIt: (what) => `Theek hai, aapka ${what} note kar liya.`,
    },
    mr: {
      intro: "Nakki, mi tumchi madat karto. Kahi chhote prashna vicharin (sudharan don minute). Optional prashna skip karu shakta, ani kahihi pathvanyaadhi tumhi sagla review karal.",
      name: "Tumche nav kay?",
      company: "He konatya company kinva business sathi ahe? (Personal asel tar \"skip\" liha.)",
      email: (n) => `Dhanyavad${n ? " " + n : ""}. Tumhala konatya email var sampark karu?`,
      phone: "Phone kinva WhatsApp number? He optional ahe, skip karu shakta.",
      service: "Tumhala konti service pahije? Khalun nivda kinva liha.",
      description: "Thodkyat sanga, tumhala kay banvaycha kinva sudharaycha ahe?",
      requirements: "Konte khas features kinva requirements amhala mahit pahijet? (Optional)",
      budget: "Tumchya manat approximate budget ahe ka? Optional ahe, ani tyamule tumhi konatyahi gosti sathi bandhle jat nahi.",
      timeline: "He tumhala kevha paryant pahije? (Optional)",
      badName: "Mala nav samajle nahi. Tumche nav liha na.",
      badEmail: "Ha email barobar vatat nahi. Parat tapasa (udaharan name@company.com).",
      badPhone: "Ha number barobar vatat nahi. Fakt digits liha, kinva \"skip\" liha.",
      shortDesc: "Thoda ajun detail dya (ek-don oli). Tyamule team la tayari karayla madat hote.",
      summaryHead: "Majhyakade hi mahiti ahe. Krupaya tapasa:",
      labels: { name: "Nav", company: "Company", email: "Email", phone: "Phone", service: "Service", description: "Project", requirements: "Requirements", budget: "Budget", timeline: "Timeline" },
      none: "Dilele nahi",
      consent: "Confirm kelyavar GURU AI Technologies hi mahiti save karel ani ya enquiry baddal tumchyashi sampark karel. Ya chat madhun ajun kahi save hot nahi. Adhik mahiti sathi Privacy Policy pahा. Pathvu ka?",
      confirm: "Ho, mi sahamat ahe. Pathva", edit: "Mahiti badla", cancel: "Cancel", skip: "Skip", notNow: "Atta nako", retry: "Parat prayatna kara",
      editWhich: "Konti mahiti badlaychi ahe?",
      editCurrent: (label, v) => `Sadhya ${label}: ${v || "dilele nahi"}. Ata kay theval?`,
      confirmHelp: "Krupaya khalun nivda: pathva, mahiti badla, kinva cancel.",
      cancelled: "Kahi harkat nahi, kahi pathvale nahi. Parat suru karaychi asel tar sanga, kinva thet team shi bola.",
      saving: "Tumchi request pathvat ahe…",
      success: (ref, email) => `Dhanyavad. Tumchi request save zali ahe (reference ${ref}). Team ya enquiry baddal ${email} var sampark karel. Tumhi thet WhatsApp pan karu shakta.`,
      duplicate: (ref) => `Hi enquiry aadhipasun amchyakade ahe (reference ${ref}), mhanun dusri copy pathvli nahi. Team sampark karel.`,
      failed: "Atta tumchi request save hou shakli nahi, ani kahi pathvale nahi. Krupaya parat prayatna kara, kinva khalun thet team shi sampark kara.",
      rate: "Ya connection varun enquiry chi limit purna zali ahe. Krupaya nantar prayatna kara, kinva thet team shi sampark kara.",
      captchaIntro: "Pathvanyaadhi ek chhota spam check:",
      captchaFail: "Spam check purna zala nahi. Krupaya parat prayatna kara.",
      unavailable: "Atta mi project details thet gheu shakat nahi. Suru karaycha sarvat jalad marg mhanje team la message karne:",
      backStart: "Nakki, magcha prashna.",
      human: "Nakki. Team madhil vyaktishi sampark karnyache sarvat jalad marg:",
      gotIt: (what) => `Thik ahe, tumcha ${what} note kela.`,
    },
  };
  const L = (lang) => T[lang] || T.en;

  /* ------------------------------ parsing helpers --------------------------- */
  const SKIP_RE = /^\s*(skip|skip it|no|none|nope|n\/a|na|-|pass|later|not sure|no company|personal|individual|freelance|nahi|nahin|nako|nai|kuch nahi|kahi nahi|nahi pata|mahit nahi|abhi nahi|atta nako|rehne do|chhod do|sod)\s*\.?!?\s*$/i;
  const YES_RE = /^\s*(yes|y|yeah|yep|yup|ok|okay|sure|confirm|confirmed|i agree|agree|send( it)?|submit|go ahead|haan|han|ha|haa|ho|hoy|hoy ahe|theek hai|thik hai|thik ahe|kar do|bhej do|pathva|chalega|bilkul)\b[\s.!]*(i agree|send it|submit)?\s*$/i;
  const CANCEL_RE = /^\s*(cancel|stop|quit|exit|abort|never ?mind|nevermind|not now|no thanks|forget it|rehne do|chhod do|nako|atta nako|abhi nahi|cancel karo)\s*\.?!?\s*$/i;
  const BACK_RE = /^\s*(back|go back|previous|peeche|magcha|wapas)\s*$/i;
  const EDIT_RE = /\b(edit|change|correct|update|fix|wrong|modify|badal\w*|sudhar\w*|badla)\b/i;
  const FIELD_WORDS = {
    name: /\b(name|naam|nav)\b/i, company: /\b(company|business|firm|organi[sz]ation)\b/i, email: /\b(e-?mail|mail)\b/i,
    phone: /\b(phone|mobile|number|whatsapp|contact)\b/i, service: /\b(service)\b/i, description: /\b(project|description|idea|brief)\b/i,
    requirements: /\b(requirements?|features?)\b/i, budget: /\b(budget)\b/i, timeline: /\b(timeline|deadline|time|date|schedule)\b/i,
  };
  const EMAIL_FIND = /[A-Za-z0-9._%+\-]{1,64}@[A-Za-z0-9\-]+(?:\.[A-Za-z0-9\-]+)*\.[A-Za-z]{2,24}/;
  const EMAIL_OK = /^[A-Za-z0-9._%+\-]{1,64}@[A-Za-z0-9\-]+(\.[A-Za-z0-9\-]+)*\.[A-Za-z]{2,24}$/;
  const PHONE_FIND = /(?:\+?\d[\d\s().\-]{7,16}\d)/;
  const STOP_NAMES = new Set(["a", "an", "the", "not", "so", "very", "fine", "good", "ok", "okay", "here", "there", "just", "really", "from", "looking", "interested", "gonna", "trying", "planning", "want", "need", "building", "running", "owner", "the owner", "working", "thinking", "hoping", "wondering", "new", "starting", "also", "in", "at", "with", "for"]);

  const cleanName = (raw) => {
    let t = String(raw || "").trim().replace(/^(my name is|myself|i am|i'm|im|this is|mera naam|mera name|mere naam|majha nav|majhe nav|maze nav|nav ahe|it'?s|it is)\s+/i, "");
    t = t.replace(/[.,!;:]+$/g, "").replace(/\s+/g, " ").trim();
    if (!/\p{L}/u.test(t) || t.length < 2 || t.length > 80) return null;
    if (/@|\d{3,}|https?:/i.test(t)) return null;
    if (STOP_NAMES.has(t.toLowerCase())) return null;
    if (t.split(" ").length > 5) return null;
    return t.replace(/\b(\p{L})(\p{L}*)/gu, (m, a, b) => (m === m.toLowerCase() ? a.toUpperCase() + b : m));
  };
  const normPhone = (raw) => {
    const s = String(raw || "").trim();
    if (!/^[+\d\s().\-]+$/.test(s)) return null;
    const d = s.replace(/\D/g, "");
    if (d.length < 7 || d.length > 15) return null;
    return (s.startsWith("+") ? "+" : "") + d;
  };
  const serviceFrom = (text) => {
    const t = String(text || "").trim();
    const exact = SERVICES.find((s) => s.toLowerCase() === t.toLowerCase());
    if (exact) return exact;
    for (const [re, svc] of SERVICE_HINTS) if (re.test(t)) return svc;
    return null;
  };
  const extractName = (text) => {
    const m = String(text).match(/(?:my name is|myself|i am|i'm|this is|mera naam|mere naam|majha nav|majhe nav|maze nav|nav ahe)\s+([\p{L}][\p{L}'.\-]*(?:\s+[\p{L}][\p{L}'.\-]*){0,2})/iu);
    return m ? cleanName(m[1].replace(/\s+(and|from|at|of|aur|ani|here|in)(\s+.*)?$/i, "")) : null;
  };

  /* --------------------------------- state ---------------------------------- */
  let S = null;
  const fresh = () => ({ active: false, step: null, data: {}, answered: new Set(), editing: false, idemKey: null, submitting: false, serviceTries: 0, phase: "ask", sent: false, result: null });
  S = fresh();

  const isActive = () => S.active;
  const label = (lang, f) => L(lang).labels[f];

  const serviceChips = () => SERVICES.map((s) => ({ label: s, value: s }));
  const summaryChips = (lang) => [
    { label: L(lang).confirm, value: "__confirm", primary: true },
    { label: L(lang).edit, value: "__edit" },
    { label: L(lang).cancel, value: "__cancel" },
  ];
  const stepChips = (lang, step) => {
    const t = L(lang);
    const out = [];
    if (step === "service") return [...serviceChips(), { label: t.cancel, value: "__cancel" }];
    if (OPTIONAL.has(step)) out.push({ label: t.skip, value: "__skip" });
    out.push({ label: t.cancel, value: "__cancel" });
    return out;
  };

  const missing = () => ORDER.find((f) => (OPTIONAL.has(f) ? !S.answered.has(f) : !S.data[f]));

  const ask = (lang, step) => {
    S.step = step; S.phase = "ask";
    const t = L(lang);
    const q = step === "email" ? t.email(S.data.name ? S.data.name.split(" ")[0] : "") : t[step];
    return { say: [q], chips: stepChips(lang, step) };
  };

  const summaryText = (lang) => {
    const t = L(lang);
    const rows = ORDER.map((f) => `${t.labels[f]}: ${S.data[f] || t.none}`);
    return `${t.summaryHead}\n${rows.join("\n")}`;
  };
  const showSummary = (lang) => {
    S.step = "confirm"; S.phase = "confirm"; S.editing = false;
    return { say: [summaryText(lang), L(lang).consent], chips: summaryChips(lang), consentPrompt: true };
  };
  const advance = (lang) => {
    if (S.editing) return showSummary(lang);
    const next = missing();
    return next ? ask(lang, next) : showSummary(lang);
  };

  /* Absorb details the visitor volunteers in free text (never overwrites with weaker guesses). */
  const absorb = (text) => {
    const email = String(text).match(EMAIL_FIND);
    if (email && EMAIL_OK.test(email[0])) S.data.email = email[0].toLowerCase();
    const noEmail = String(text).replace(EMAIL_FIND, " ");
    const ph = noEmail.match(PHONE_FIND);
    if (ph && normPhone(ph[0]) && !S.data.phone) { S.data.phone = normPhone(ph[0]); S.answered.add("phone"); }
    const nm = extractName(text);
    if (nm && !S.data.name) S.data.name = nm;
    const svc = serviceFrom(text);
    if (svc && !S.data.service) S.data.service = svc;
  };

  const start = (text, lang) => {
    S = fresh();
    S.active = true;
    S.idemKey = window.GURU.chatUtil.uuid();
    const t = String(text || "").trim();
    const seeded = [];
    if (t && t !== "__start" && detect(t)) {
      absorb(t);
      const cleaned = t.replace(EMAIL_FIND, "").replace(PHONE_FIND, "").replace(/[,;]?\s*(and\s+)?(my\s+)?(e-?mail(\s+id)?|phone|number)(\s+is)?\s*[.,]?\s*$/i, "").trim();
      if (cleaned.length >= 15) { S.data.description = cleaned.slice(0, 600); seeded.push(label(lang, "description").toLowerCase()); }
    } else if (t && t !== "__start") absorb(t);
    const ctxName = window.GURU.chatContext && window.GURU.chatContext.get().userName;
    if (!S.data.name && ctxName) S.data.name = ctxName;
    const first = ask(lang, missing());
    first.say = [L(lang).intro, ...first.say];
    return first;
  };

  const cancel = (lang) => { const keep = S.idemKey; S = fresh(); void keep; return { say: [L(lang).cancelled], chips: [], ended: true, handoff: true }; };

  const setField = (lang, field, text) => {
    const t = L(lang);
    const v = String(text).trim();
    if (field === "name") {
      const n = cleanName(v); if (!n) return { err: t.badName };
      S.data.name = n;
    } else if (field === "email") {
      const m = v.match(EMAIL_FIND);
      if (!m || !EMAIL_OK.test(m[0])) return { err: t.badEmail };
      S.data.email = m[0].toLowerCase();
    } else if (field === "phone") {
      if (SKIP_RE.test(v)) { S.data.phone = ""; }
      else { const p = normPhone(v); if (!p) return { err: t.badPhone }; S.data.phone = p; }
    } else if (field === "service") {
      const s = serviceFrom(v);
      if (s) S.data.service = s;
      else if (S.serviceTries >= 1) { S.data.service = "Something else / not sure yet"; if (!S.data.description) S.data.description = v.slice(0, 600); }
      else { S.serviceTries += 1; return { err: t.service }; }
    } else if (field === "description") {
      if (v.length < 10) return { err: t.shortDesc };
      S.data.description = v.slice(0, 1500);
    } else if (field === "company") {
      S.data.company = SKIP_RE.test(v) ? "" : v.slice(0, 120);
    } else {
      S.data[field] = SKIP_RE.test(v) ? "" : v.slice(0, field === "requirements" ? 1500 : 80);
    }
    S.answered.add(field);
    return {};
  };

  const handle = (raw, lang) => {
    const text = String(raw || "").trim();
    const t = L(lang);
    if (S.submitting) return { say: [], chips: [] };
    if (text === "__cancel" || CANCEL_RE.test(text)) return cancel(lang);

    if (S.phase === "confirm") {
      if (text === "__confirm" || YES_RE.test(text)) return { say: [t.saving], chips: [], action: "submit" };
      if (text === "__edit" || (EDIT_RE.test(text) && !Object.values(FIELD_WORDS).some((re) => re.test(text)))) {
        S.phase = "edit"; S.step = "edit";
        return { say: [t.editWhich], chips: [...ORDER.map((f) => ({ label: t.labels[f], value: "__field:" + f })), { label: t.cancel, value: "__cancel" }] };
      }
      const hit = ORDER.find((f) => FIELD_WORDS[f].test(text));
      if (EDIT_RE.test(text) && hit) {
        S.editing = true;
        const inline = hit === "email" ? text.match(EMAIL_FIND) : null;
        if (inline) { S.data.email = inline[0].toLowerCase(); return showSummary(lang); }
        return { ...ask(lang, hit), say: [t.editCurrent(t.labels[hit], S.data[hit])] };
      }
      if (/^\s*(no|nahi|nahin|nako)\s*$/i.test(text)) { S.phase = "edit"; S.step = "edit"; return { say: [t.editWhich], chips: [...ORDER.map((f) => ({ label: t.labels[f], value: "__field:" + f })), { label: t.cancel, value: "__cancel" }] }; }
      return { say: [t.confirmHelp], chips: summaryChips(lang) };
    }

    if (S.phase === "edit") {
      let f = text.startsWith("__field:") ? text.slice(8) : ORDER.find((k) => FIELD_WORDS[k].test(text));
      if (f && ORDER.includes(f)) { S.editing = true; return { ...ask(lang, f), say: [t.editCurrent(t.labels[f], S.data[f])] }; }
      return { say: [t.editWhich], chips: [...ORDER.map((k) => ({ label: t.labels[k], value: "__field:" + k })), { label: t.cancel, value: "__cancel" }] };
    }

    // Asking a field
    const step = S.step;
    if (BACK_RE.test(text)) {
      const i = ORDER.indexOf(step);
      if (i > 0) { const prev = ORDER[i - 1]; S.answered.delete(prev); if (!OPTIONAL.has(prev)) delete S.data[prev]; return { ...ask(lang, prev), say: [t.backStart, ...ask(lang, prev).say] }; }
    }
    if (text === "__skip" || (OPTIONAL.has(step) && SKIP_RE.test(text))) {
      S.answered.add(step); S.data[step] = "";
      return advance(lang);
    }
    if (step !== "email") { const m = text.match(EMAIL_FIND); if (m && EMAIL_OK.test(m[0]) && !S.data.email) S.data.email = m[0].toLowerCase(); }
    const r = setField(lang, step, text === "__skip" ? "" : text);
    if (r.err) return { say: [r.err], chips: stepChips(lang, step) };
    return advance(lang);
  };

  const buildPayload = (lang, pagePath) => ({
    name: S.data.name, company: S.data.company || "", email: S.data.email, phone: S.data.phone || "",
    service: S.data.service, project_description: S.data.description, requirements: S.data.requirements || "",
    budget_range: S.data.budget || "", expected_timeline: S.data.timeline || "",
    consent: true, consent_text: L("en").consent.replace(/\s*Shall I send it\?$/, ""),
    language: lang, page_path: pagePath || "", idempotency_key: S.idemKey,
  });

  /** Called by the UI with the backend's real answer. Only status "ok"/"duplicate" ever reports success. */
  const onSubmitResult = (lang, res) => {
    const t = L(lang);
    S.submitting = false;
    if (res && res.ok && res.json && res.json.ok) {
      const ref = res.json.ref;
      const out = { say: [res.json.duplicate ? t.duplicate(ref) : t.success(ref, S.data.email)], chips: [], ended: true, success: true, handoffLinks: true };
      S = fresh();
      return out;
    }
    if (res && res.status === 422 && res.json && res.json.fields) {
      const f = ORDER.find((k) => res.json.fields[k === "description" ? "project_description" : k]);
      if (f) { S.editing = true; return { ...ask(lang, f), say: [res.json.fields[f === "description" ? "project_description" : f]] }; }
    }
    if (res && res.status === 429) return { say: [t.rate], chips: [], card: "handoff" };
    if (res && res.json && res.json.error === "captcha_failed") return { say: [t.captchaFail], chips: [{ label: t.retry, value: "__confirm", primary: true }, { label: t.cancel, value: "__cancel" }] };
    S.phase = "confirm"; S.step = "confirm";
    return { say: [t.failed], chips: [{ label: t.retry, value: "__confirm", primary: true }, { label: t.cancel, value: "__cancel" }], card: "handoff" };
  };

  return {
    detect, wantsHuman, isActive, start, handle, buildPayload, onSubmitResult, cancel,
    setSubmitting: (v) => { S.submitting = !!v; },
    isSubmitting: () => S.submitting,
    snapshot: () => ({ ...S, data: { ...S.data }, answered: [...S.answered] }),
    SERVICES, T, _internals: { cleanName, normPhone, serviceFrom, extractName, SKIP_RE },
  };
})();
