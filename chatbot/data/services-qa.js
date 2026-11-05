/* GURU chatbot data — services-qa.js
   Service overview + per-service intents (trilingual). */
window.GURU.chatbotData.register([
  {
    id: "services_overview",
    keywords: ["services","service","what do you do","what you offer","offerings","kya karte","kay karta","services kya","konti service","what can you build","solutions"],
    patterns: [/what (do|can) you (do|offer|build)/i, /(konti|kaunsi|kya) service/i],
    responses: {
      en: [
        "We offer 10 core services: AI-Powered Websites, Custom Software, AI Business Automation, AI Chatbots & Voice Assistants, Mobile Apps, Business Billing Software, Digital Marketing & Branding, AI Consulting, Cloud & DevOps, and Cyber Security. Which one interests you?",
        "Everything a modern business needs: websites with AI built in, custom software, chatbots, automation, mobile apps, billing systems, marketing, consulting, cloud, and security. Want details on any of these?",
        "Our services cover the full digital stack — from a premium website to complete business automation. Tell me your business type and I'll suggest where to start.",
      ],
      hi: [
        "Hum 10 services dete hain: AI websites, custom software, business automation, chatbots, mobile apps, billing software, digital marketing, AI consulting, cloud aur cyber security. Kisme interest hai?",
        "Website se lekar poora business automation tak — sab kuch. Aap apna business bataiye, main sahi service suggest karunga.",
        "AI websites, software, chatbots, apps, billing — sab milta hai yahan. Kya banwana chahte hain?",
      ],
      mr: [
        "Amhi 10 services deto: AI websites, custom software, business automation, chatbots, mobile apps, billing software, digital marketing, AI consulting, cloud ani cyber security. Konti avadli?",
        "Website pasun purn business automation paryant — sagle kahi. Tumcha business sanga, mi yogya service suggest karto.",
      ],
    },
  },
  {
    id: "svc_website",
    keywords: ["website","web site","webpage","site","landing page","website banana","website banvaychi","web design","business website","salon website","website chahiye"],
    patterns: [/website (chahiye|pahije|banana|banvay)/i],
    responses: {
      en: [
        "Our AI-Powered Websites are premium, mobile-first, and built to convert — with smart booking, an AI assistant, SEO, and 95+ Lighthouse performance as standard. Want to see the full details? Check /services/ai-websites.html or ask me anything specific.",
        "We build websites that look like they belong to a much bigger brand — fast, secure, and with AI features like chat assistants and smart booking. Typical delivery is 1–3 weeks. Shall I share how to get started?",
        "A website from us means: premium design, perfect mobile experience, WhatsApp booking, SEO schema, and optional AI chat — all production-grade. What kind of business is it for?",
      ],
      hi: [
        "Hamari AI websites premium hoti hain — mobile-first, fast, SEO-ready, aur WhatsApp booking ke saath. Aam taur par 1–3 hafte mein ready. Kis business ke liye chahiye?",
        "Website matlab sirf design nahi — speed, security aur customers laane wala system. Hum sab dhyan rakhte hain. Aapka business kya hai?",
      ],
      mr: [
        "Amchya AI websites premium astat — mobile-first, fast, SEO-ready ani WhatsApp booking sobat. Sadharan 1–3 aathvdyat ready. Kontya business sathi pahije?",
        "Website mhanje fakt design nahi — speed, security ani customers anare system. Tumcha business konta ahe?",
      ],
    },
  },
  {
    id: "svc_software",
    keywords: ["software","custom software","web app","application","dashboard","erp","crm","internal tool","software banana","software development"],
    responses: {
      en: [
        "Custom Software means we build exactly what your business needs — dashboards, CRMs, booking systems, internal tools — instead of forcing you into someone else's product. Tell me what problem you're trying to solve and I'll point you in the right direction.",
        "We design and build web applications around your exact workflow: clean architecture, secure by default, and easy to extend later. What process do you want to digitize?",
      ],
      hi: [
        "Custom software matlab bilkul aapke business ke hisaab se — dashboard, CRM, booking system, jo chahiye. Kya problem solve karni hai?",
        "Hum ready-made product nahi bechte — aapke workflow ke hisaab se software banate hain. Kaunsa kaam digital karna hai?",
      ],
      mr: [
        "Custom software mhanje tumchya business pramane — dashboard, CRM, booking system, je pahije te. Konti problem solve karaychi ahe?",
      ],
    },
  },
  {
    id: "svc_chatbot",
    priority: 1,
    keywords: ["chatbot","chat bot","voice assistant","bot","ai assistant","whatsapp bot","chatbot banana","bot chahiye"],
    responses: {
      en: [
        "Our AI Chatbots answer customers 24/7 in English, Hinglish, and Marathi — capturing leads, answering FAQs, and handing over to WhatsApp when a human is needed. You're talking to one right now! Want one for your business?",
        "We build assistants exactly like me — for websites and WhatsApp. They greet customers, answer questions, and book appointments while you sleep. Interested?",
      ],
      hi: [
        "Hamare chatbots 24/7 customers ko jawab dete hain — English, Hinglish aur Marathi mein. Aap abhi ek se hi baat kar rahe hain! Apne business ke liye chahiye?",
        "Mere jaisa assistant aapke business ke liye bhi ban sakta hai — website aur WhatsApp dono par. Batayein?",
      ],
      mr: [
        "Amche chatbots 24/7 customers na uttar detat — English, Hinglish ani Marathi madhe. Tumhi ata ekashich bolat ahat! Tumchya business sathi pahije ka?",
      ],
    },
  },
  {
    id: "svc_automation",
    keywords: ["automation","automate","automatic","workflow","auto reply","follow up","reports automatic","automation chahiye","ai automation"],
    responses: {
      en: [
        "AI Business Automation removes repetitive work — automatic follow-ups, report generation, data entry, reminders. Most clients save hours every week. What tasks eat up your team's time?",
        "If your team does the same thing every day, we can probably automate it. Follow-ups, invoices, reports, customer messages — tell me your most boring task and let's kill it.",
      ],
      hi: [
        "Automation matlab roz ka repetitive kaam khatam — follow-ups, reports, reminders sab automatic. Aapki team ka sabse time-waste kaam kaunsa hai?",
      ],
      mr: [
        "Automation mhanje rojche repetitive kam sampla — follow-ups, reports, reminders sagle automatic. Tumchya team cha sarvat kantalvana kam konta?",
      ],
    },
  },
  {
    id: "svc_mobile",
    keywords: ["app","mobile app","android","ios","application mobile","app banana","app banvaycha","app development","play store"],
    patterns: [/\bapp\b/i],
    responses: {
      en: [
        "We build fast, reliable Android and cross-platform mobile apps — from booking apps to business tools. Tell me what your app should do and I'll explain how we'd approach it.",
        "Mobile App Development at GURU AI means native-feeling performance, clean UI, and a build process you can actually follow. What's the app idea?",
      ],
      hi: [
        "Hum Android aur cross-platform apps banate hain — fast aur reliable. Aapka app kya karega? Idea bataiye.",
      ],
      mr: [
        "Amhi Android ani cross-platform apps banavto — fast ani reliable. Tumcha app kay karel? Idea sanga.",
      ],
    },
  },
  {
    id: "svc_billing",
    priority: 2,
    keywords: ["billing","invoice","invoicing","gst","bill software","billing software","accounts","inventory","bill banana","billing system"],
    responses: {
      en: [
        "Our Business Billing Software is GST-ready: invoicing, inventory, daily summaries, and clean reports — designed for shop owners, not accountants. Staff usually learn it in a day. Want a walkthrough?",
        "Billing shouldn't need a training course. Ours does invoices, GST reports, and stock in a few taps. Tell me about your shop or business and I'll explain the fit.",
      ],
      hi: [
        "Hamara billing software GST-ready hai — invoice, inventory, reports sab simple. Staff ek din mein seekh jaata hai. Demo chahiye?",
      ],
      mr: [
        "Amche billing software GST-ready ahe — invoice, inventory, reports sagle simple. Staff ek divsat shikto. Demo pahije ka?",
      ],
    },
  },
  {
    id: "svc_marketing",
    priority: 1,
    keywords: ["marketing","seo","branding","logo","social media","instagram","google ranking","digital marketing","promotion","ads","seo services"],
    patterns: [/\bseo\b/i, /digital marketing/i, /(google|search) ranking/i],
    responses: {
      en: [
        "Digital Marketing & Branding covers SEO, local search, social presence, and brand identity — so customers can actually find you. We focus on measurable results, not vanity metrics. What's your current online presence like?",
        "Great products deserve to be found. We handle SEO, Google Business optimization, branding, and content strategy. Where do you feel invisible right now — Google, Instagram, or everywhere?",
      ],
      hi: [
        "Marketing matlab customers aap tak pahunche — SEO, Google ranking, branding sab. Abhi aapki online presence kaisi hai?",
      ],
      mr: [
        "Marketing mhanje customers tumchya paryant pohochle pahijet — SEO, Google ranking, branding sagle. Sadhya tumchi online presence kashi ahe?",
      ],
    },
  },
  {
    id: "svc_consulting",
    keywords: ["consulting","consultation","advice","strategy","ai strategy","guidance","roadmap","ai consulting","salah"],
    responses: {
      en: [
        "AI Consulting gives you an honest roadmap: where AI genuinely helps your business, where it doesn't, and what to build first. No jargon, no overselling. Want to book a consultation call?",
        "Before spending on AI, know what's worth building. We audit your workflows and give you a practical, prioritized plan. Interested in a discovery call?",
      ],
      hi: [
        "AI Consulting mein hum sach batate hain — AI kahan kaam aayega, kahan nahi. Bina jargon ke practical plan. Call book karein?",
      ],
      mr: [
        "AI Consulting madhe amhi khara sangto — AI kuthe upyogi ahe, kuthe nahi. Practical plan deto. Call book karaycha ka?",
      ],
    },
  },
  {
    id: "svc_cloud",
    keywords: ["cloud","hosting","devops","server","deployment","cloudflare","ci cd","infrastructure","domain","deploy"],
    responses: {
      en: [
        "Cloud & DevOps means your product stays fast, online, and easy to update — Cloudflare, CI/CD pipelines, monitoring, backups. If your site is slow or deployments are scary, that's exactly what we fix.",
        "We set up modern infrastructure: Cloudflare Pages/Workers, automated deployments, and monitoring. Is this for a new project or improving an existing one?",
      ],
      hi: [
        "Cloud & DevOps matlab aapki site hamesha fast aur online — hosting, deployment, backup sab handle. Naya project hai ya purana sudhaarna hai?",
      ],
      mr: [
        "Cloud & DevOps mhanje tumchi site nehmi fast ani online — hosting, deployment, backup sagle handle. Nava project ahe ka juna sudharaycha ahe?",
      ],
    },
  },
  {
    id: "svc_security",
    keywords: ["security","cyber","hack","hacked","secure","protection","audit security","ssl","safe","cyber security"],
    responses: {
      en: [
        "Cyber Security Solutions: website hardening, security audits, safe integrations, and secure-by-design builds. One breach costs more than years of prevention. Do you have a specific concern, or want a general audit?",
        "We protect what you've built — hardened headers, sanitized inputs, secure forms, and audits of existing sites. What would you like reviewed?",
      ],
      hi: [
        "Cyber security matlab aapka data aur reputation safe — audits, hardening, secure builds. Koi specific problem hai ya general check-up chahiye?",
      ],
      mr: [
        "Cyber security mhanje tumcha data ani reputation safe — audits, hardening, secure builds. Kahi specific problem ahe ka general check-up pahije?",
      ],
    },
  },
]);
