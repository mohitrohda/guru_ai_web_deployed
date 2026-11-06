/* GURU chatbot data — pricing-contact.js
   Pricing policy (custom quotes only), contact, hours, location. */
window.GURU.chatbotData.register([
  {
    id: "pricing",
    keywords: ["price","pricing","cost","charge","rate","budget","kitna","kitne","paisa","paise","kharcha","kharch","kiti","fees","quotation","quote","how much","expensive","cheap","package"],
    patterns: [/how much/i, /(kitna|kiti|kya) (hoga|lagega|kharch|paisa|cost|price)/i],
    responses: {
      en: [
        "Tell us what you need the website, software, or automation to do. We’ll discuss what to build, the timeline, and the cost before you commit. WhatsApp +91 80876 95569 or email contact@guruaitechnologies.com.",
        "Pricing is always custom — it depends on features, scale, and timeline. The fastest way to get a real number: message us on WhatsApp with a short description of what you want. No obligation.",
        "We quote per project, not from a rate card — so you only pay for what you actually need. Tell us your idea on WhatsApp, through the contact form, or at contact@guruaitechnologies.com and we'll send a detailed custom quote.",
        "Share your goal and any tools we should connect to. We usually reply within 24 hours, Monday to Saturday, and will ask for any details we need before quoting.",
      ],
      hi: [
        "Har project alag hota hai, isliye fixed price nahi hai — custom quote milta hai. WhatsApp par requirement bhejiye (+91 80876 95569), hum usually Monday se Saturday, 24 ghante mein reply karte hain.",
        "Pricing project ke hisaab se hoti hai. Sabse fast tareeka: WhatsApp par apna idea bhejiye, hum custom quote bhej denge. Koi charge nahi poochne ka!",
        "Fixed rate card nahi hai — jitna kaam, utna hi daam. Requirement batayiye, sahi quote milega.",
      ],
      mr: [
        "Pratyek project vegla asto, mhanun fixed price nahi — custom quote milte. WhatsApp var requirement pathva (+91 80876 95569), aamhi sahasa Somvar te Shanivar 24 tasat uttar deto.",
        "Pricing project pramane aste. Sarvat fast marg: WhatsApp var tumchi idea pathva, amhi custom quote pathvu. Vicharayla kahi charge nahi!",
      ],
    },
  },
  {
    id: "contact",
    keywords: ["contact","phone","number","call","email","mail","reach","whatsapp","contact details","contact karna","sampark","talk to human","real person","team se baat"],
    patterns: [/(contact|phone|whatsapp) (number|details|karo|kara)/i, /talk to (a )?(human|person|team)/i],
    responses: {
      en: [
        "Here's how to reach the team:\nWhatsApp / Call: +91 80876 95569\nEmail: contact@guruaitechnologies.com\nHours: Mon–Sat · 10:00 AM–7:00 PM IST.\nWhatsApp usually gets the fastest reply.",
        "You can WhatsApp or call +91 80876 95569, or email contact@guruaitechnologies.com. We reply within 24 hours, Monday to Saturday.",
        "The fastest route is WhatsApp: +91 80876 95569. Prefer email? contact@guruaitechnologies.com works too. A real human will reply, promise.",
      ],
      hi: [
        "Team se contact:\nWhatsApp / Call: +91 80876 95569\nEmail: contact@guruaitechnologies.com\nSamay: Somvar–Shanivar, 10 baje se 7 baje tak.\nWhatsApp par sabse jaldi reply milta hai.",
        "WhatsApp ya call kijiye +91 80876 95569 par, ya email: contact@guruaitechnologies.com. 24 ghante mein reply pakka.",
      ],
      mr: [
        "Team shi sampark:\nWhatsApp / Call: +91 80876 95569\nEmail: contact@guruaitechnologies.com\nVel: Somvar–Shanivar, sakali 10 te sandhyakali 7.\nWhatsApp var sarvat lavkar reply milto.",
        "WhatsApp kinva call kara +91 80876 95569 var, kinva email: contact@guruaitechnologies.com. 24 tasat reply nakki.",
      ],
    },
  },
  {
    id: "hours",
    keywords: ["hours","timing","timings","open","closed","working hours","kab khulte","kadhi","time kya","business hours","kitne baje","sunday"],
    patterns: [/(kab|kadhi|when).*(open|khul|chalu)/i],
    responses: {
      en: [
        "Our hours are Mon–Sat · 10:00 AM–7:00 PM IST. Sundays are for recharging — but you can message on WhatsApp anytime and we'll reply the next working day.",
        "Business hours: Mon–Sat · 10:00 AM–7:00 PM IST. Messages sent outside hours are answered first thing the next working day.",
      ],
      hi: [
        "Hum Somvar se Shanivar, subah 10 se shaam 7 baje tak kaam karte hain. Sunday chhutti — par WhatsApp message kabhi bhi bhej sakte hain.",
      ],
      mr: [
        "Amhi Somvar te Shanivar, sakali 10 te sandhyakali 7 paryant kam karto. Ravivari sutti — pan WhatsApp message kadhi pan pathvu shakta.",
      ],
    },
  },
  {
    id: "location",
    keywords: ["location","address","where","office","pune","kahan","kuthe","based","city","area","visit"],
    patterns: [/(where|kahan|kuthe).*(located|office|based|ahat|ho)/i],
    responses: {
      en: [
        "We're based in Pune, Maharashtra, India — and we work with clients everywhere. Meetings happen on call or WhatsApp, and you can preview your project live from anywhere.",
        "Home base is Pune, Maharashtra. Distance is never an issue: our whole process — updates, previews, approvals — works perfectly over WhatsApp and calls.",
      ],
      hi: [
        "Hum Pune, Maharashtra mein hain — lekin clients kahin se bhi ho sakte hain. Meetings call ya WhatsApp par hoti hain.",
      ],
      mr: [
        "Amhi Pune, Maharashtra madhe ahot — pan clients kuthlyahi thikanache asu shaktat. Meetings call kinva WhatsApp var hotat.",
      ],
    },
  },
]);
