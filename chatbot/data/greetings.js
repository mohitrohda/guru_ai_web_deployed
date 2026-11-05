/* GURU chatbot data — greetings.js
   Greeting + farewell + thanks intents, trilingual pools.
   {name} is replaced with the user's name when known. */
window.GURU.chatbotData.register([
  {
    id: "greeting",
    keywords: ["hi","hello","hey","hii","hiii","yo","namaste","namaskar","hola","good morning","good afternoon","good evening","kasa ahes","kaise ho","kay chalu"],
    patterns: [/^(hi+|hey+|hello+|yo|namaste|namaskar)\b/i],
    responses: {
      en: [
        "Hello{name}! I'm GURU, the assistant from GURU AI TECHNOLOGIES. How can I help you today?",
        "Hi{name}! Great to see you here. Ask me about our services, pricing, or anything else.",
        "Hey{name}! Welcome to GURU AI TECHNOLOGIES. What are you building?",
        "Hello{name}! I can tell you about our websites, software, chatbots, and more. What would you like to know?",
        "Hi there{name}! I'm GURU — think of me as the front desk of GURU AI TECHNOLOGIES. How can I help?",
        "Welcome{name}! Looking for a website, an app, or some AI magic for your business?",
        "Hey{name}! Good to have you here. What can I help you with today?",
        "Hello{name}! Whether it's a quick question or a big project idea, I'm listening.",
        "Hi{name}! Ask me anything about GURU AI TECHNOLOGIES — services, process, timings, contact.",
        "Namaste{name}! How can GURU AI TECHNOLOGIES help your business today?",
        "Hey{name}! Ready when you are. Services, pricing, portfolio — just ask.",
        "Hello{name}! You've reached GURU, the assistant. What brings you here today?",
      ],
      hi: [
        "Namaste{name}! Main GURU hoon, GURU AI TECHNOLOGIES ka assistant. Aapki kya madad kar sakta hoon?",
        "Hello{name}! Batayiye, website chahiye, app chahiye, ya kuch aur?",
        "Hi{name}! Aap services, pricing ya contact ke baare mein kuch bhi pooch sakte hain.",
        "Namaste{name}! Aapka swagat hai. Aaj kaise madad karoon?",
        "Hello{name}! Business ke liye kuch smart banana hai? Main yahin hoon.",
        "Hi{name}! GURU AI TECHNOLOGIES mein aapka swagat hai. Kya jaanna chahenge?",
        "Namaste{name}! Koi bhi sawaal ho — seedha poochiye.",
        "Hello{name}! Website, software, chatbot — jo bhi chahiye, bataiye.",
      ],
      mr: [
        "Namaskar{name}! Mi GURU, GURU AI TECHNOLOGIES cha assistant. Kashi madat karu?",
        "Namaskar{name}! Tumhala website, app kinva software banvaycha ahe ka?",
        "Hello{name}! Services, pricing kinva contact baddal kahi pan vichara.",
        "Namaskar{name}! Tumche swagat ahe. Aaj kay madat karu shakto?",
        "Namaskar{name}! Tumchya business sathi kahi smart banvayche ahe ka?",
        "Hello{name}! GURU AI TECHNOLOGIES madhe tumche swagat. Kay janun ghyayche ahe?",
      ],
    },
  },
  {
    id: "farewell",
    keywords: ["bye","goodbye","see you","tata","alvida","bye bye","chalto","nighto","phir milenge","good night"],
    patterns: [/^(bye+|tata|goodbye)\b/i],
    responses: {
      en: [
        "Goodbye{name}! Whenever you're ready to build, we're one message away on WhatsApp.",
        "See you{name}! Have a great day — and good luck with your business.",
        "Bye{name}! Feel free to come back anytime. GURU never sleeps.",
        "Take care{name}! If anything comes to mind later, just reopen this chat or ping us on WhatsApp.",
      ],
      hi: [
        "Alvida{name}! Jab bhi zaroorat ho, WhatsApp par message kar dijiyega.",
        "Bye{name}! Aapka din shubh ho. Phir milenge!",
        "Theek hai{name}, dhyaan rakhiye! Koi bhi sawaal ho toh dobara aa jaiye.",
      ],
      mr: [
        "Bye{name}! Kadhi pan garaj asel tar WhatsApp var message kara.",
        "Namaskar{name}! Tumcha divas chhan javo. Punha bhetu!",
        "Thik ahe{name}, kalji ghya! Kahi prashna asel tar parat ya.",
      ],
    },
  },
  {
    id: "thanks",
    keywords: ["thanks","thank you","thankyou","thx","dhanyawad","dhanyavad","shukriya","aabhar","thanks a lot","great help"],
    responses: {
      en: [
        "You're most welcome{name}! Anything else I can help with?",
        "Happy to help{name}! That's literally what I'm here for.",
        "Anytime{name}! If you'd like to take things further, WhatsApp us at +91 80876 95569.",
        "Glad I could help{name}! Ask away if anything else comes up.",
      ],
      hi: [
        "Koi baat nahi{name}! Aur kuch poochna ho toh bataiye.",
        "Khushi hui madad karke{name}! Kuch aur chahiye?",
        "Swagat hai{name}! Aage baat karni ho toh WhatsApp kijiye: +91 80876 95569.",
      ],
      mr: [
        "Kahi harkat nahi{name}! Ajun kahi vicharayche ahe ka?",
        "Madat karun anand jhala{name}! Ajun kahi pahije ka?",
        "Swagat ahe{name}! Pudhe bolayche asel tar WhatsApp kara: +91 80876 95569.",
      ],
    },
  },
]);
