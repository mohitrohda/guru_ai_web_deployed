/* GURU chatbot data — business-qa.js
   Process, timeline, support, company info, careers, industries. */
window.GURU.chatbotData.register([
  {
    id: "process",
    keywords: ["process","how do you work","steps","workflow","procedure","kaise kaam","kase kam","how it works","start project","get started","begin"],
    patterns: [/how (do|does) (you|it) work/i, /(kaise|kase) (kaam|kam)/i],
    responses: {
      en: [
        "Our process has five clear steps:\n1. Discover — we understand your business and goals\n2. Design — you approve the direction before we build\n3. Build — clean development with live previews\n4. Test — every device, every edge case\n5. Launch & Support — deployment plus honest post-launch care.\nWant to start step 1? Just message us on WhatsApp.",
        "Simple and transparent: Discover → Design → Build → Test → Launch & Support. You see previews throughout and approve each stage — no surprises at the end.",
      ],
      hi: [
        "Hamara process 5 steps ka hai: Discover, Design, Build, Test, aur Launch & Support. Har stage par aapko preview milta hai — koi surprise nahi. Shuru karna ho toh WhatsApp kijiye!",
      ],
      mr: [
        "Amcha process 5 steps cha ahe: Discover, Design, Build, Test, ani Launch & Support. Pratyek stage la tumhala preview milto — kahi surprise nahi. Suru karayche asel tar WhatsApp kara!",
      ],
    },
  },
  {
    id: "timeline",
    keywords: ["how long","timeline","time lagega","duration","kitne din","kiti divas","delivery time","deadline","fast","urgent","jaldi"],
    patterns: [/how long/i, /(kitne din|kiti divas|kitna time)/i],
    responses: {
      en: [
        "A premium business website usually takes 1–3 weeks. Software, apps, and automation are scoped individually — you get a realistic timeline before we start, and honest updates throughout. Have a deadline in mind?",
        "Typical timelines: websites 1–3 weeks; larger software and app projects are quoted with their own schedule up front. If something is urgent, tell us — we'll be honest about what's possible.",
      ],
      hi: [
        "Website aam taur par 1–3 hafte mein ready hoti hai. Software aur apps ka timeline project ke hisaab se pehle hi bata dete hain. Koi deadline hai?",
      ],
      mr: [
        "Website sadharan 1–3 aathvdyat ready hote. Software ani apps cha timeline project pramane aadhich sangto. Kahi deadline ahe ka?",
      ],
    },
  },
  {
    id: "support",
    keywords: ["support","maintenance","after launch","update","bug","fix","warranty","help later","maintain","amc"],
    responses: {
      en: [
        "Every project includes post-launch support, and we offer ongoing maintenance plans for updates, backups, and improvements. Reach us any time at support@guruaitechnologies.com — you're never left alone with your product.",
        "Yes — support doesn't end at launch. Bug fixes, updates, and improvements are all covered, with optional maintenance plans for long-term care. Support requests go to support@guruaitechnologies.com.",
      ],
      hi: [
        "Launch ke baad bhi support milta hai — bug fix, updates, sab. Maintenance plans bhi hain. Aap kabhi akele nahi rahenge apne product ke saath.",
      ],
      mr: [
        "Launch nantar pan support milto — bug fix, updates, sagle. Maintenance plans pan ahet. Tumhi kadhich ekta rahnar nahi tumchya product sobat.",
      ],
    },
  },
  {
    id: "about_company",
    keywords: ["about","company","who are you guys","guru ai","kon ahat","kaun ho","tell me about","founder","team","company kya hai","vision","mission"],
    patterns: [/about (the )?(company|guru)/i, /(kaun|kon) (ho|ahat)/i],
    responses: {
      en: [
        "GURU AI TECHNOLOGIES is a Pune-based digital engineering studio. We build AI-powered websites, custom software, chatbots, automation, and more — with production-grade quality on every project. Our mission: make serious AI and software craft accessible to growing businesses.",
        "We're an AI engineering studio from Pune, Maharashtra. Small enough that you talk directly to the builders, disciplined enough that everything ships production-ready. Vision: businesses of every size running on intelligent software.",
      ],
      hi: [
        "GURU AI TECHNOLOGIES Pune ki ek digital engineering studio hai. Hum AI websites, software, chatbots aur automation banate hain — production quality ke saath. Mission: har business tak smart technology pahunchana.",
      ],
      mr: [
        "GURU AI TECHNOLOGIES Pune chi ek digital engineering studio ahe. Amhi AI websites, software, chatbots ani automation banavto — production quality sobat. Mission: pratyek business paryant smart technology pohochavne.",
      ],
    },
  },
  {
    id: "industries",
    keywords: ["industries","industry","salon","restaurant","clinic","shop","retail","which businesses","kaunse business","business types","gym","hotel"],
    responses: {
      en: [
        "We work across industries — salons, retail shops, clinics, restaurants, gyms, service businesses, and startups. The principles stay the same: understand the business first, then build the right tool. What's your industry?",
        "From beauty salons to billing-heavy retail, we've built for many kinds of businesses. If customers or paperwork are involved, we can probably make it smoother. What do you run?",
      ],
      hi: [
        "Hum har industry ke saath kaam karte hain — salon, shop, clinic, restaurant, gym, startups. Aapka business kaunsa hai?",
      ],
      mr: [
        "Amhi pratyek industry sobat kam karto — salon, shop, clinic, restaurant, gym, startups. Tumcha business konta ahe?",
      ],
    },
  },
  {
    id: "careers",
    keywords: ["job","career","hiring","internship","vacancy","join team","work with you","naukri","opening"],
    responses: {
      en: [
        "We're a small studio, but we're always happy to hear from talented people. Send a short intro and your work to careers@guruaitechnologies.com — every genuine application gets read.",
        "No formal openings are posted right now, but great people make their own openings. Email careers@guruaitechnologies.com with what you build best.",
      ],
      hi: [
        "Abhi koi formal opening nahi hai, par talented logon se milna hamesha acha lagta hai. Apna kaam careers@guruaitechnologies.com par bhejiye.",
      ],
      mr: [
        "Sadhya formal opening nahi, pan talented lokanshi bhetayla nehmi avdel. Tumche kam careers@guruaitechnologies.com var pathva.",
      ],
    },
  },
  {
    id: "portfolio",
    keywords: ["portfolio","projects","work","examples","previous work","clients","kaam dikhaao","kam dakhva","case study","done before"],
    responses: {
      en: [
        "Published case studies: Accusize Gauges & Tools (website, ERP and calibration tracking for a Pune manufacturer), a Salon + AI chatbot project (MR.COOL), and our own GST-ready Billing & Management Software. You can read them under Case Studies, or tell me your industry and I'll point to the closest one.",
        "Take a look at the Case Studies page for real project stories, or tell me your industry and I'll point you to the closest example.",
      ],
      hi: [
        "Hamare published case studies: Accusize Gauges & Tools (website, ERP aur calibration tracking), Salon + AI chatbot (MR.COOL), aur apna GST-ready Billing & Management Software. Case Studies page par dekh sakte hain.",
      ],
      mr: [
        "Amchya published case studies: Accusize Gauges & Tools (website, ERP ani calibration tracking), Salon + AI chatbot (MR.COOL), ani amcha GST-ready Billing & Management Software. Case Studies page var bagu shakta.",
      ],
    },
  },
  {
    id: "technology",
    keywords: ["technology","tech stack","which technology","react","python","node","kya use karte","stack","framework","language use"],
    responses: {
      en: [
        "We don't publish a fixed technology list because the stack is chosen per project, based on what you need to build. What I can say for sure: our websites are mobile-first with security headers and structured data, we build Android and cross-platform apps, and we use Cloudflare for hosting and delivery. Tell me about your project, or ask the team about a specific technology on WhatsApp: +91 80876 95569.",
        "The right technology depends on the project, so we agree it with you before work starts. If you have a specific tool or framework in mind, ask the team on WhatsApp (+91 80876 95569) and they'll confirm what fits.",
      ],
      hi: [
        "Hum fixed technology list publish nahi karte, kyunki stack har project ke hisaab se chuna jata hai. Pakka yeh keh sakte hain: hamari websites mobile-first hoti hain, hum Android aur cross-platform apps banate hain, aur hosting ke liye Cloudflare use karte hain. Kisi specific technology ke baare mein team se WhatsApp par poochiye: +91 80876 95569.",
      ],
      mr: [
        "Amhi fixed technology list publish karat nahi, karan stack pratyek project nusar nivadla jato. Nakki sangu shakto: amchya websites mobile-first astat, amhi Android ani cross-platform apps banavto, ani hosting sathi Cloudflare vaparto. Konatyahi specific technology baddal team la WhatsApp var vichara: +91 80876 95569.",
      ],
    },
  },
]);
