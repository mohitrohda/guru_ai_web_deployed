// Server-side sales notification. Provider adapters: "resend" and "brevo".
// Nothing is sent unless EMAIL_PROVIDER, EMAIL_API_KEY, LEAD_NOTIFY_TO and LEAD_NOTIFY_FROM are all set.

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const oneLine = (s, n = 120) => String(s ?? "").replace(/[\r\n\t]+/g, " ").slice(0, n);

export const emailConfigured = (env) =>
  Boolean(env.EMAIL_PROVIDER && env.EMAIL_API_KEY && env.LEAD_NOTIFY_TO && env.LEAD_NOTIFY_FROM);

const parseAddress = (raw) => {
  const m = String(raw).match(/^\s*(?:"?([^"<]*?)"?\s*)?<([^>]+)>\s*$/);
  return m ? { name: (m[1] || "").trim(), email: m[2].trim() } : { name: "", email: String(raw).trim() };
};

const fields = (lead) => [
  ["Name", lead.name],
  ["Company", lead.company || "-"],
  ["Email", lead.email],
  ["Phone", lead.phone || "-"],
  ["Service", lead.service],
  ["Project description", lead.project_description],
  ["Requirements", lead.requirements || "-"],
  ["Budget", lead.budget_range || "Not provided"],
  ["Timeline", lead.expected_timeline || "Not provided"],
  ["Language", lead.language],
  ["Page", lead.page_path || "-"],
  ["Reference", lead.ref],
];

export const buildEmail = (lead) => {
  const rows = fields(lead);
  const text = ["New project enquiry from the GURU AI website assistant", "", ...rows.map(([k, v]) => `${k}: ${v}`),
    "", "The visitor consented to being contacted about this enquiry."].join("\n");
  const html =
    `<h2 style="font-family:sans-serif">New project enquiry</h2>` +
    `<table style="font-family:sans-serif;border-collapse:collapse" cellpadding="6">` +
    rows.map(([k, v]) => `<tr><td style="color:#555;vertical-align:top"><b>${esc(k)}</b></td><td style="white-space:pre-wrap">${esc(v)}</td></tr>`).join("") +
    `</table><p style="font-family:sans-serif;color:#555">The visitor consented to being contacted about this enquiry.</p>`;
  return { subject: `New project enquiry: ${oneLine(lead.service, 60)} (${oneLine(lead.name, 60)})`, text, html };
};

const adapters = {
  async resend(env, lead, mail, signal) {
    const base = env.EMAIL_API_BASE_URL || "https://api.resend.com";
    const res = await fetch(`${base}/emails`, {
      method: "POST", signal,
      headers: { Authorization: `Bearer ${env.EMAIL_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.LEAD_NOTIFY_FROM,
        to: String(env.LEAD_NOTIFY_TO).split(",").map((s) => s.trim()).filter(Boolean),
        reply_to: lead.email, subject: mail.subject, html: mail.html, text: mail.text,
      }),
    });
    if (!res.ok) throw new Error(`resend_${res.status}`);
  },
  async brevo(env, lead, mail, signal) {
    const base = env.EMAIL_API_BASE_URL || "https://api.brevo.com/v3";
    const from = parseAddress(env.LEAD_NOTIFY_FROM);
    const res = await fetch(`${base}/smtp/email`, {
      method: "POST", signal,
      headers: { "api-key": env.EMAIL_API_KEY, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        sender: { name: from.name || "GURU AI Website", email: from.email },
        to: String(env.LEAD_NOTIFY_TO).split(",").map((s) => ({ email: s.trim() })).filter((t) => t.email),
        replyTo: { email: lead.email }, subject: mail.subject, htmlContent: mail.html, textContent: mail.text,
      }),
    });
    if (!res.ok) throw new Error(`brevo_${res.status}`);
  },
};

/** Returns { status: "sent" | "failed" | "not_configured", error? }. Never throws. */
export const sendLeadNotification = async (env, lead) => {
  if (!emailConfigured(env)) return { status: "not_configured" };
  const adapter = adapters[String(env.EMAIL_PROVIDER).toLowerCase()];
  if (!adapter) return { status: "failed", error: "unknown_provider" };
  try {
    await adapter(env, lead, buildEmail(lead), AbortSignal.timeout(6000));
    return { status: "sent" };
  } catch (e) {
    return { status: "failed", error: String(e && e.message ? e.message : e).slice(0, 80) };
  }
};
