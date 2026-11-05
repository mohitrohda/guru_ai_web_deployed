document.getElementById("y").textContent = new Date().getFullYear();
// In production, Cloudflare serves this page at any broken URL, so
// home links must be site-absolute ("/"). In local preview the file
// is opened as .../404.html, rewrite links relative so they work.
if (/404\.html$/.test(location.pathname) || location.protocol === "file:") {
  document.querySelectorAll("[data-home]").forEach(function (a) {
    var hash = a.getAttribute("data-hash");
    a.setAttribute("href", "index.html" + (hash ? "#" + hash : ""));
  });
}
