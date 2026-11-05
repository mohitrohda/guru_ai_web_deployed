/* ==========================================================================
   GURU chatbot — engine.js
   Rule-based NLU built to survive real human typing:
     · abbreviation / shorthand expansion  (hlo→hello, plz→please, u→you)
     · repeated-letter collapse            (helloo→hello, thanksss→thanks)
     · Levenshtein fuzzy keyword matching   (servcie→service)
     · language detection (English / Hinglish / Roman Marathi)
     · name capture
   Consumes intent packs registered on window.GURU.chatbotData.
   ========================================================================== */

window.GURU = window.GURU || {};

window.GURU.chatEngine = (() => {
  "use strict";

  const ctx = () => window.GURU.chatContext;

  /* ----------------------------------------------------------------------
     1. ABBREVIATION / SHORTHAND MAP
     Maps common chat shorthand and misspellings to a canonical token so
     the rest of the pipeline sees clean words. Applied per-token.
     ---------------------------------------------------------------------- */
  const SHORTHAND = {
    // greetings
    hlo: "hello", helo: "hello", hii: "hi", hiii: "hi", hyy: "hi", hy: "hi",
    hey: "hi", heya: "hi", yo: "hi", hola: "hello",
    gm: "good morning", ga: "good afternoon", ge: "good evening",
    gn: "good night", mrng: "morning", mrn: "morning", eve: "evening",
    // courtesy
    plz: "please", pls: "please", plss: "please", pleas: "please",
    thx: "thanks", thnx: "thanks", thnks: "thanks", tnx: "thanks",
    ty: "thanks", tysm: "thanks", thankyou: "thanks", thanku: "thanks",
    thankz: "thanks", shukriya: "thanks",
    // pronouns / fillers
    u: "you", ur: "your", yr: "your", r: "are", n: "and", nd: "and",
    m: "am", im: "i am", i: "i", pl: "please",
    abt: "about", bout: "about", info: "information",
    // question words
    wht: "what", wt: "what", wat: "what",
    hw: "how", hwmuch: "how much", hru: "how are you",
    y: "why", wen: "when", wr: "where", wch: "which",
    // domain shorthand
    site: "website", websit: "website", websites: "website", web: "website",
    wbsite: "website", webite: "website",
    app: "app", apps: "app", appln: "application", mob: "mobile",
    soft: "software", sw: "software", dev: "development", devlop: "develop",
    seo: "seo", ai: "ai", ml: "ml", bot: "chatbot", chatbot: "chatbot",
    price: "price", pricing: "pricing", cost: "cost", rate: "rate",
    quote: "quote", quotation: "quote", budget: "budget",
    servcie: "service", servise: "service", srvice: "service",
    serivce: "service", servces: "service", srvc: "service",
    bilng: "billing", biling: "billing", invoce: "invoice", gst: "gst",
    supprt: "support", suport: "support", maintainance: "maintenance",
    maintenence: "maintenance", automaton: "automation", automate: "automation",
    // contact
    no: "number", num: "number", cont: "contact", contct: "contact",
    watsapp: "whatsapp", wtsapp: "whatsapp", whatsap: "whatsapp",
    whatapp: "whatsapp", wsp: "whatsapp", email: "email", mail: "email",
    // misc
    opning: "opening", oppening: "opening", jobb: "job", carrer: "career",
    experiance: "experience", comapny: "company", cmpny: "company",
    bussiness: "business", buisness: "business", bizness: "business",
  };

  /* Multi-word shorthand handled on the whole string before tokenizing. */
  const PHRASE_SHORTHAND = [
    [/\bgud mrng\b/g, "good morning"],
    [/\bgud mrn\b/g, "good morning"],
    [/\bgud nyt\b/g, "good night"],
    [/\bhw much\b/g, "how much"],
    [/\bhw r u\b/g, "how are you"],
    [/\bhw ru\b/g, "how are you"],
    [/\bwht abt\b/g, "what about"],
    [/\bwana\b/g, "want to"],
    [/\bwanna\b/g, "want to"],
    [/\bgimme\b/g, "give me"],
    [/\blemme\b/g, "let me"],
    [/\bkitna cost\b/g, "how much cost"],
    [/\bcontact no\b/g, "contact number"],
  ];

  /* ----------------------------------------------------------------------
     2. NORMALIZATION
     ---------------------------------------------------------------------- */
  // Collapse 3+ repeats to 1 (heyyy→hey, sooo→so). Two repeats kept so
  // real double letters (hello, all) survive; shorthand map cleans the rest.
  const collapseRepeats = (w) => w.replace(/(.)\1{2,}/g, "$1");

  const baseNormalize = (s) => {
    let t = " " + s.toLowerCase() + " ";
    for (const [re, rep] of PHRASE_SHORTHAND) t = t.replace(re, rep);
    return t
      .replace(/[^\w\s+@.\-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const expandToken = (w) => {
    if (SHORTHAND[w]) return SHORTHAND[w];
    const c = collapseRepeats(w);
    if (SHORTHAND[c]) return SHORTHAND[c];
    return c;
  };

  /** Full normalized text (expanded), used for phrase matching. */
  const normalize = (s) =>
    baseNormalize(s)
      .split(" ")
      .filter(Boolean)
      .map(expandToken)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

  const tokens = (s) =>
    baseNormalize(s).split(" ").filter(Boolean).map(expandToken)
      // expansions like "i am" can introduce spaces → re-split
      .join(" ").split(" ").filter(Boolean);

  /* ----------------------------------------------------------------------
     3. LANGUAGE DETECTION (Roman Hindi / Marathi markers)
     ---------------------------------------------------------------------- */
  const HI_MARKERS = ["hai","hain","kya","aap","apka","kaise","kaisa","kitna","kitne","chahiye","karna","karo","mujhe","mera","meri","batao","bataiye","paise","nahi","nahin","haan","acha","accha","theek","thik","hoga","milega","banwana","banana","banao","kripya","dhanyawad","namaste","bhai","ji","hum","kaun","kab","kahan"];
  const MR_MARKERS = ["kasa","kase","kashi","kay","tumhi","tumcha","tumchi","mala","majha","majhi","pahije","havay","hava","kiti","ahe","aahe","ahet","dhanyavad","dhanyawad","namaskar","krupaya","kara","karta","sangita","sanga","banvaycha","banvayche","kharch","zale","zala","chan","chhan","mast","kuthe","kevha","konta"];

  const detectLang = (text) => {
    const t = new Set(tokens(text));
    let hi = 0, mr = 0;
    HI_MARKERS.forEach((m) => t.has(m) && hi++);
    MR_MARKERS.forEach((m) => t.has(m) && mr++);
    if (mr > hi && mr > 0) return "mr";
    if (hi > 0) return "hi";
    return null;
  };

  /* ----------------------------------------------------------------------
     4. FUZZY MATCHING (Levenshtein, length-scaled tolerance)
     ---------------------------------------------------------------------- */
  const lev = (a, b) => {
    const m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    let prev = new Array(n + 1);
    let curr = new Array(n + 1);
    for (let j = 0; j <= n; j++) prev[j] = j;
    for (let i = 1; i <= m; i++) {
      curr[0] = i;
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      }
      [prev, curr] = [curr, prev];
    }
    return prev[n];
  };

  /** Token matches keyword: exact, prefix (≥4), or edit distance within
      a length-scaled budget (longer words tolerate more typos). */
  const closeEnough = (word, kw) => {
    if (word === kw) return true;
    if (word.includes(kw) && kw.length >= 4) return true;
    if (kw.length >= 4 && word.startsWith(kw.slice(0, 4))) {
      if (Math.abs(word.length - kw.length) <= 2) return true;
    }
    const budget = kw.length >= 10 ? 3 : kw.length >= 6 ? 2 : kw.length >= 4 ? 1 : 0;
    if (budget === 0) return false;
    if (Math.abs(word.length - kw.length) > budget) return false;
    return lev(word, kw) <= budget;
  };

  /* ----------------------------------------------------------------------
     5. INTENT SCORING
     ---------------------------------------------------------------------- */
  const scoreIntent = (msgTokens, msgText, intent) => {
    let score = 0;
    const matched = new Set();

    for (const kw of intent.keywords || []) {
      if (kw.includes(" ")) {
        if (msgText.includes(kw)) score += 3;
      } else {
        for (const w of msgTokens) {
          if (closeEnough(w, kw)) {
            if (!matched.has(kw)) {
              score += kw.length >= 6 ? 2 : 1;
              matched.add(kw);
            }
            break;
          }
        }
      }
    }

    for (const p of intent.patterns || []) {
      if (p.test(msgText)) score += 4;
    }

    // Priority nudges specific intents over generic ones — but ONLY when
    // the intent already earned a real match, so it can never win on
    // priority alone against an unrelated message.
    if (score > 0 && intent.priority) score += intent.priority;

    return score;
  };

  /* ----------------------------------------------------------------------
     6. NAME CAPTURE
     ---------------------------------------------------------------------- */
  const STOP_NAMES = new Set(["a","an","the","not","so","very","fine","good","ok","okay","here","there","just","really","from","looking","interested","gonna","trying"]);
  const captureName = (text) => {
    const m = text.match(
      /(?:my name is|myself|i am|i'm|mera naam|mere naam|majha nav|majhe nav|nav ahe|this is)\s+([a-z]{2,20})/i
    );
    if (m && !STOP_NAMES.has(m[1].toLowerCase())) {
      const name = m[1][0].toUpperCase() + m[1].slice(1).toLowerCase();
      ctx().setName(name);
      return name;
    }
    return null;
  };

  /* ----------------------------------------------------------------------
     7. RESOLVE
     ---------------------------------------------------------------------- */
  const resolve = (rawMessage) => {
    const data = window.GURU.chatbotData || {};
    const intents = data.intents || [];
    const text = normalize(rawMessage);
    const toks = tokens(rawMessage);

    const detected = detectLang(rawMessage);
    if (detected) ctx().setLang(detected);
    const lang = ctx().get().lang;

    captureName(rawMessage);

    let best = null, bestScore = 0;
    for (const intent of intents) {
      const s = scoreIntent(toks, text, intent);
      if (s > bestScore) { bestScore = s; best = intent; }
    }

    const THRESHOLD = 2;
    if (!best || bestScore < THRESHOLD) {
      best = intents.find((i) => i.id === "fallback");
    }

    ctx().setIntent(best ? best.id : null);
    return { intent: best, lang, score: bestScore };
  };

  /* ----------------------------------------------------------------------
     8. RENDER
     ---------------------------------------------------------------------- */
  const render = (intent, lang) => {
    if (!intent) return "…";
    const pools = intent.responses || {};
    const pool = pools[lang] && pools[lang].length ? pools[lang] : pools.en || [];
    let reply = ctx().pick(intent.id, pool) || "";
    const name = ctx().get().userName;
    reply = reply.replace(/\{name\}/g, name ? ` ${name}` : "");
    return reply.replace(/\s+([,.!?])/g, "$1").trim();
  };

  return { resolve, render, detectLang, normalize, closeEnough };
})();
