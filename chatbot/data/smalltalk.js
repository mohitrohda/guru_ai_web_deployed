/* GURU chatbot data — smalltalk.js
   Personality layer: who is GURU, how are you, jokes, capability. */
window.GURU.chatbotData.register([
  {
    id: "who_are_you",
    keywords: ["who are you","your name","what are you","are you a bot","are you human","tu kon","tum kaun","robot","are you real","aap kaun"],
    patterns: [/who are you/i, /(tu|tum|aap) (kon|kaun)/i],
    responses: {
      en: [
        "I'm GURU — the assistant from GURU AI TECHNOLOGIES. I know our services, process, and contact details inside out. And yes, I'm a bot — a well-built one, if I may say so.",
        "GURU, at your service! I'm the assistant built by GURU AI TECHNOLOGIES. Fun fact: assistants like me are one of the services we build for clients too.",
        "I'm GURU, a digital assistant — not human, but genuinely helpful. Ask me anything about the company and I'll answer instantly, any hour of the day.",
      ],
      hi: [
        "Main GURU hoon — GURU AI TECHNOLOGIES ka assistant. Haan, main bot hoon — lekin kaam ka bot! Company ke baare mein kuch bhi poochiye.",
        "GURU naam hai mera! assistant hoon. Mazedaar baat: mere jaise assistants hum clients ke liye bhi banate hain.",
      ],
      mr: [
        "Mi GURU — GURU AI TECHNOLOGIES cha assistant. Ho, mi bot ahe — pan kamacha bot! Company baddal kahi pan vichara.",
        "GURU nav ahe majhe! assistant ahe. Majedar goshta: majhya sarkhe assistants amhi clients sathi pan banavto.",
      ],
    },
  },
  {
    id: "how_are_you",
    keywords: ["how are you","how r u","kaise ho","kasa ahes","kase ahat","kya haal","whats up","how is it going","all good"],
    patterns: [/how (are|r) (you|u)/i, /(kaise|kasa|kase) (ho|ahes|ahat)/i],
    responses: {
      en: [
        "Running at full capacity, thanks for asking! How can I help you today?",
        "All systems green! More importantly — how's your business doing? Anything I can help with?",
        "Doing great — I never need coffee, which helps. What can I do for you?",
      ],
      hi: [
        "Ekdum badhiya! Aap bataiye — aaj kya madad karoon?",
        "Full charge mein hoon! Aapke business ka kya haal hai? Kuch madad chahiye?",
      ],
      mr: [
        "Ekdam mast! Tumhi sanga — aaj kay madat karu?",
        "Full charge madhe ahe! Tumchya business che kay chalu ahe? Kahi madat pahije?",
      ],
    },
  },
  {
    id: "capabilities",
    keywords: ["what can you do","help me","what do you know","options","menu","commands","kya kar sakte","kay karu shakto","madad"],
    patterns: [/what can you (do|tell)/i],
    responses: {
      en: [
        "I can tell you about our 10 services, explain our process and timelines, share pricing policy, give contact details and hours, and point you to relevant work we've done. I also understand Hinglish and Marathi — try me!",
        "Ask me about: services, pricing, our process, timelines, support, technologies, portfolio, or how to contact the team. In English, Hinglish, ya Marathi — jasa avdel tasa!",
      ],
      hi: [
        "Main services, pricing, process, timeline, support aur contact — sab bata sakta hoon. English, Hinglish ya Marathi — jaise comfortable ho waise poochiye!",
      ],
      mr: [
        "Mi services, pricing, process, timeline, support ani contact — sagle sangu shakto. English, Hinglish kinva Marathi — jase comfortable asel tase vichara!",
      ],
    },
  },
  {
    id: "joke",
    keywords: ["joke","funny","make me laugh","bore","boring","entertain","joke sunao","vinod"],
    responses: {
      en: [
        "Why did the website go to therapy? Too many unresolved issues. …I'll stick to my day job. Speaking of which — anything I can help you build?",
        "I asked a server for a joke. It said: '404 — humor not found.' Okay, back to business — what can I do for you?",
        "My developer said I shouldn't tell jokes in production. So officially, this never happened. Now, how can I help?",
      ],
      hi: [
        "Website therapy kyun gayi? Kyunki uske paas bahut saare unresolved issues the! …Chaliye, kaam ki baat karte hain — kya madad karoon?",
      ],
      mr: [
        "Website therapy la ka geli? Karan tichyakade khup unresolved issues hote! …Chala, kamachi goshta karu — kay madat karu?",
      ],
    },
  },
  {
    id: "praise",
    keywords: ["nice","great","awesome","amazing","good bot","smart","impressive","mast","chhan","badhiya","wah","sahi hai"],
    responses: {
      en: [
        "Thank you! Assistants like me are one of the things GURU AI TECHNOLOGIES builds — imagine one trained on your business. Interested?",
        "Appreciated! I do my best. Anything else you'd like to know?",
      ],
      hi: [
        "Shukriya! Mere jaisa assistant aapke business ke liye bhi ban sakta hai — sochiye zara!",
        "Dhanyawad! Aur kuch jaanna ho toh bataiye.",
      ],
      mr: [
        "Dhanyavad! Majhya sarkha assistant tumchya business sathi pan banu shakto — vichar kara!",
        "Dhanyavad! Ajun kahi janayche asel tar sanga.",
      ],
    },
  },
]);
