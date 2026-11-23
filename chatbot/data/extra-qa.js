/* ==========================================================================
   GURU chatbot data — extra-qa.js
   Additional intents that make GURU feel natural and well-informed:
   help, affirmative/negative, get-started, guarantee, revisions, languages,
   data safety, why-choose, meeting, comparison, small confirmations.
   Loaded after the core packs; registered on the same registry.
   ========================================================================== */

window.GURU.chatbotData.register([
  /* ---- How do I start / next steps ---- */
  {
    id: "get_started",
    priority: 1,
    keywords: ["start","begin","get started","how to start","next step","proceed","kaise start","shuru","begin karna","interested","hire","work with","onboard"],
    patterns: [/how (do|can) (i|we) (start|begin|proceed)/i, /want to (start|begin|work)/i, /get started/i],
    responses: {
      en: [
        "Getting started is easy: tell us a little about your idea — over WhatsApp at +91 80876 95569 or the contact form on this page — and we'll reply within 24 hours with clear next steps and a custom quote. No pressure, no obligation.",
        "Great — here's how it works: share your requirement, we discuss scope on a quick call or WhatsApp, then you get a written proposal with timeline and pricing. Want me to point you to the fastest way to reach the team?",
        "Just send us the basics of what you need and we'll take it from there. The quickest route is WhatsApp (+91 80876 95569); you can also email sales@guruaitechnologies.com or use the form below.",
      ],
      hi: [
        "Shuru karna aasaan hai: apna idea WhatsApp par bhejiye (+91 80876 95569) ya form bhariye — 24 ghante mein clear next steps aur custom quote milega. Koi pressure nahi.",
        "Bilkul — pehle requirement batayiye, phir ek chhoti call ya WhatsApp par scope discuss karte hain, uske baad timeline aur pricing ke saath proposal milta hai.",
      ],
      mr: [
        "Suru karne sope aahe: tumchi idea WhatsApp var pathva (+91 80876 95569) kinva form bhara — 24 tasat clear next steps ani custom quote milel. Kahi pressure nahi.",
        "Nakki — aadhi requirement sanga, mag ek chhoti call kinva WhatsApp var scope discuss karto, nantar timeline ani pricing sah proposal milto.",
      ],
    },
  },

  /* ---- Do you guarantee / revisions / satisfaction ---- */
  {
    id: "guarantee_revisions",
    keywords: ["guarantee","warranty","revision","revisions","changes","satisfied","satisfaction","not happy","redo","refund","money back","corrections","edit"],
    patterns: [/(how many )?revisions/i, /money back|refund/i, /if (i'm |i am )?not (happy|satisfied)/i],
    responses: {
      en: [
        "I don't have published guarantee, refund or revision terms, so I can't promise any. What I can say: you see designs and previews before the build goes live, and every project includes post-launch support. For the exact terms of your project, ask the team on WhatsApp (+91 80876 95569) or email contact@guruaitechnologies.com.",
      ],
      hi: [
        "Guarantee, refund ya revision ke published terms mere paas nahi hain, isliye main koi promise nahi kar sakta. Itna keh sakta hoon: build se pehle design aur previews dikhaye jaate hain, aur har project mein post-launch support shaamil hai. Exact terms ke liye team se WhatsApp par poochiye: +91 80876 95569.",
      ],
      mr: [
        "Guarantee, refund kinva revision che published terms majhyakade nahit, mhanun mi kahi promise karu shakat nahi. Evdhe sangu shakto: build adhi design ani previews dakhavle jatat, ani pratyek project madhe post-launch support asto. Exact terms sathi team la WhatsApp var vichara: +91 80876 95569.",
      ],
    },
  },

  /* ---- What languages does the chatbot / team support ---- */
  {
    id: "languages",
    keywords: ["language","languages","marathi","hindi","english","hinglish","bhasha","multilingual","which language"],
    patterns: [/(which|what) languages?/i, /(speak|support).*(marathi|hindi|english)/i],
    responses: {
      en: [
        "We build assistants that understand English, Hindi/Hinglish, and Marathi — so your customers can chat naturally in whatever they're comfortable with. The team communicates in all three too.",
        "English, Hindi, and Marathi — including the mixed, everyday way people actually type. That's exactly how I'm working with you right now.",
      ],
      hi: [
        "Hum aise assistants banate hain jo English, Hindi/Hinglish aur Marathi samajhte hain — taaki aapke customers apni comfortable bhasha mein baat kar sakein. Team bhi teeno mein baat karti hai.",
      ],
      mr: [
        "Amhi ase assistants banavto je English, Hindi/Hinglish ani Marathi samajtat — jenekarun tumche customers tyanchya avadichya bhashet bolu shaktat. Team pan tinhi bhashet bolte.",
      ],
    },
  },

  /* ---- Is my data / my customers' data safe ---- */
  {
    id: "data_safety",
    keywords: ["data safe","privacy","secure","security","safe","confidential","hack","protect","data protection","gdpr"],
    patterns: [/is my data (safe|secure)/i, /data (privacy|protection|security)/i],
    responses: {
      en: [
        "Security is built in, not bolted on: hardened headers, sanitized inputs, HTTPS everywhere, and safe integrations. We treat your data and your customers' data with real care — and we can walk you through the specifics for your project.",
        "Yes. Every build ships with security best practices — encrypted connections, protected forms, and no unnecessary data collection. Protecting your reputation is part of the job.",
      ],
      hi: [
        "Security shuru se hi build hoti hai: hardened headers, safe inputs, har jagah HTTPS, aur secure integrations. Aapka aur aapke customers ka data pura dhyaan se handle hota hai.",
      ],
      mr: [
        "Security suruvatipasunach build hote: hardened headers, safe inputs, saglikade HTTPS, ani secure integrations. Tumcha ani tumchya customers cha data purna kalji ne handle hoto.",
      ],
    },
  },

  /* ---- Why choose GURU / what makes you different ---- */
  {
    id: "why_choose",
    keywords: ["why choose","why you","different","why guru","best","special","stand out","competitor","other companies","reason"],
    patterns: [/why (should i |should we )?(choose|pick|go with|hire) (you|guru)/i, /what makes you (different|special|better)/i],
    responses: {
      en: [
        "Honestly? We build like a product team, not a project factory. Clean code, real performance, security by default, mobile-first — and you talk directly to the people building your product. No account managers in between, no disappearing after launch.",
        "A few things: production-grade engineering, genuine attention to speed and security, practical AI where it actually helps, and honest communication throughout. We'd rather do fewer projects properly than many carelessly.",
      ],
      hi: [
        "Sach kahein? Hum ek product team ki tarah build karte hain, factory ki tarah nahi. Clean code, real performance, security by default, mobile-first — aur aap seedha builders se baat karte hain. Launch ke baad gayab nahi hote.",
      ],
      mr: [
        "Kharch sangaycha tar? Amhi product team sarkha build karto, factory sarkha nahi. Clean code, real performance, security by default, mobile-first — ani tumhi thet builders shi bolta. Launch nantar gayab hot nahi.",
      ],
    },
  },

  /* ---- Can we meet / call / demo ---- */
  {
    id: "meeting",
    keywords: ["meet","meeting","call","demo","discuss","talk","schedule","appointment","video call","google meet","zoom","visit"],
    patterns: [/(can we|let's|book a|schedule a|do a|have a|want a|arrange a) (meet|call|demo|meeting|chat)/i, /(want|need) (a )?(demo|call|meeting)/i, /\bcall me\b/i, /\bschedule\b/i],
    responses: {
      en: [
        "Absolutely. We do quick calls or WhatsApp discussions, and screen-share demos when helpful. Message +91 80876 95569 with a time that suits you and we'll set it up — Monday to Saturday, 10 AM to 7 PM.",
        "Happy to. A short call is often the fastest way to scope things. WhatsApp us at +91 80876 95569 or email sales@guruaitechnologies.com and we'll find a slot that works.",
      ],
      hi: [
        "Bilkul. Hum quick calls ya WhatsApp par baat karte hain, aur zaroorat ho to screen-share demo bhi. +91 80876 95569 par apna suitable time bhejiye — Somvar se Shanivar, 10 se 7.",
      ],
      mr: [
        "Nakki. Amhi quick calls kinva WhatsApp var bolto, ani garaj asel tar screen-share demo pan. +91 80876 95569 var tumcha suitable vel pathva — Somvar te Shanivar, 10 te 7.",
      ],
    },
  },

  /* ---- Affirmative follow-ups (yes / ok / sure) ---- */
  {
    id: "affirm",
    keywords: ["yes","yeah","yep","sure","ok","okay","haan","ha","ho","yup","alright","sounds good","great","perfect","cool","done"],
    patterns: [/^(yes|yeah|yep|sure|ok|okay|haan|ho|yup|great|perfect|cool)\b/i],
    responses: {
      en: [
        "Perfect. The quickest next step is a quick message on WhatsApp (+91 80876 95569) with your requirement — we'll take it from there. Anything specific you'd like to know first?",
        "Great! Tell me what you'd like to explore — services, pricing, or how we work — or reach the team directly on WhatsApp at +91 80876 95569.",
      ],
      hi: [
        "Perfect. Agla step: WhatsApp par (+91 80876 95569) apni requirement bhejiye — aage hum sambhaal lenge. Pehle kuch specific jaanna hai?",
      ],
      mr: [
        "Perfect. Pudcha step: WhatsApp var (+91 80876 95569) tumchi requirement pathva — pudhe amhi baghto. Aadhi kahi specific janun ghyaycha aahe ka?",
      ],
    },
  },

  /* ---- Negative / not now ---- */
  {
    id: "negative",
    keywords: ["no","nope","nah","not now","later","nahi","maybe later","not interested","just looking","browsing"],
    patterns: [/^(no|nope|nah|not now|nahi)\b/i, /just (looking|browsing)/i, /maybe later/i],
    responses: {
      en: [
        "No problem at all — take your time. Whenever you're ready, we're here Monday to Saturday, and you can reach us anytime on WhatsApp at +91 80876 95569. Anything else I can help with?",
        "That's completely fine. Feel free to look around, and I'm here if any questions come up. Is there anything else you're curious about?",
      ],
      hi: [
        "Koi baat nahi — apna time lijiye. Jab bhi ready ho, hum Somvar se Shanivar yahin hain, aur WhatsApp par (+91 80876 95569) kabhi bhi. Aur kuch help karun?",
      ],
      mr: [
        "Kahi harkat nahi — tumcha vel ghya. Jevha ready vhal, amhi Somvar te Shanivar ithech aahot, ani WhatsApp var (+91 80876 95569) kevhahi. Ankhi kahi madat karu?",
      ],
    },
  },

  /* ---- Help / what can you do ---- */
  {
    id: "help",
    keywords: ["help","assist","what can you do","guide","confused","lost","options","menu","support me"],
    patterns: [/can you help/i, /what can you (do|help)/i, /i (need|want) help/i, /^help\b/i, /\bhelp me\b/i, /\bplease help\b/i],
    responses: {
      en: [
        "Happy to help! I can tell you about our services, how we work, pricing, timelines, or contact details — and connect you with the team on WhatsApp. What would you like to know?",
        "Of course. Ask me about anything GURU AI TECHNOLOGIES does — websites, software, chatbots, automation, billing, apps, marketing, cloud, or security — or how to get started.",
      ],
      hi: [
        "Zaroor! Main services, hum kaise kaam karte hain, pricing, timelines, ya contact details bata sakta hoon — aur team se WhatsApp par jod sakta hoon. Kya jaanna chahenge?",
      ],
      mr: [
        "Nakki! Mi services, amhi kase kaam karto, pricing, timelines, kinva contact details sangu shakto — ani team shi WhatsApp var jodun deu shakto. Kay janun ghyaycha aahe?",
      ],
    },
  },
]);
