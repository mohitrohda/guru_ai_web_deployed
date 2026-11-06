(() => {
  "use strict";

  const options = document.querySelector("[data-contact-options]");
  if (!options || typeof HTMLDialogElement === "undefined") return;

  const base = new URL(".", document.currentScript.src);
  const modules = [
    "data/greetings.js", "data/faq.js", "data/services-qa.js",
    "data/business-qa.js", "data/pricing-contact.js", "data/smalltalk.js",
    "data/extra-qa.js", "data/fallback.js", "context.js", "engine.js",
    "provider.js", "ui.js",
  ];
  const requests = new Map();
  const load = path => {
    if (!requests.has(path)) {
      requests.set(path, new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = new URL(path, base).href;
        // Fetch together while preserving the dependency order.
        script.async = false;
        script.addEventListener("load", resolve, { once: true });
        script.addEventListener("error", () => {
          script.remove();
          requests.delete(path);
          reject(new Error("Chat resource unavailable"));
        }, { once: true });
        document.head.append(script);
      }));
    }
    return requests.get(path);
  };

  const launcher = document.createElement("button");
  launcher.className = "contact-dock__chat";
  launcher.type = "button";
  launcher.setAttribute("aria-haspopup", "dialog");
  launcher.textContent = "Chat with GURU";
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  status.hidden = true;
  options.append(launcher, status);

  let loading = false;
  const open = async () => {
    if (loading) return;
    loading = true;
    status.textContent = "Opening chat…";
    status.hidden = false;
    try {
      await load("data/knowledge.js");
      await Promise.all(modules.map(load));
      window.GURU.chatbot.init(launcher);
      launcher.removeEventListener("click", open);
      status.hidden = true;
      if (options.closest("details").open) window.GURU.chatbot.open();
    } catch {
      status.textContent = "Chat couldn’t open. Try again or contact us on WhatsApp.";
    } finally {
      loading = false;
    }
  };
  launcher.addEventListener("click", open);
})();
