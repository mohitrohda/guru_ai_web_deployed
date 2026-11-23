// Lightweight BM25 retrieval over the bundled knowledge base (functions/_kb/kb.json).
// Sized for a ~300-chunk site: no vector database, no embeddings, no extra network hop.
import kb from "../_kb/kb.json";

const STOP = new Set(("a an the and or of to in on for with is are was were be been it this that these those at by from as " +
  "do does did can could will would should you your we our us i me my what how when where which who whom why " +
  "kya hai hain ka ki ke ko se me mein aap hum mujhe mala tumhi ahe kay kasa").split(" "));

// Hinglish / Roman Marathi cue words -> English index terms.
const ALIASES = {
  kitna: "price cost", kitne: "price cost", paisa: "price cost", paise: "price cost", kharcha: "price cost",
  kharch: "price cost", kiti: "price cost", daam: "price", rate: "price",
  banwana: "build develop", banvaycha: "build develop", banana: "build develop", banao: "build develop",
  banvayche: "build develop", chahiye: "need", pahije: "need", havay: "need", hava: "need",
  samay: "timeline duration", waqt: "timeline duration", kitni: "timeline duration", vel: "timeline duration",
  sampark: "contact", number: "contact phone", ghadi: "timeline", kab: "when timeline", kadhi: "when timeline",
  dukan: "retail shop", dukaan: "retail shop", hisab: "billing accounting", bill: "billing invoice",
  site: "website", app: "mobile app", chatbot: "chatbot assistant", bot: "chatbot",
};

const stem = (w) =>
  w.length > 5 ? w.replace(/(ing|ers|er|ed|es|s)$/, "") : w.length > 3 ? w.replace(/s$/, "") : w;

export const tokenize = (text) => {
  const out = [];
  for (const raw of String(text).toLowerCase().replace(/[^a-z0-9+#.\s]/g, " ").split(/\s+/)) {
    const w = raw.replace(/^\.+|\.+$/g, "");
    if (!w || STOP.has(w)) continue;
    out.push(stem(w));
    if (ALIASES[w]) for (const a of ALIASES[w].split(" ")) out.push(stem(a));
  }
  return out;
};

// Build the index once per isolate.
const docs = kb.chunks.map((c) => {
  const tokens = tokenize(`${c.title} ${c.title} ${(c.keywords || []).join(" ")} ${c.text}`);
  const tf = new Map();
  for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
  return { chunk: c, tf, len: tokens.length || 1 };
});
const N = docs.length;
const avgLen = docs.reduce((s, d) => s + d.len, 0) / Math.max(N, 1);
const df = new Map();
for (const d of docs) for (const t of d.tf.keys()) df.set(t, (df.get(t) || 0) + 1);

export const search = (query, { limit = 6, minScore = 1.2 } = {}) => {
  const q = [...new Set(tokenize(query))];
  if (!q.length) return [];
  const k1 = 1.4, b = 0.75;
  const scored = [];
  for (const d of docs) {
    let score = 0;
    for (const t of q) {
      const f = d.tf.get(t);
      if (!f) continue;
      const idf = Math.log(1 + (N - (df.get(t) || 0) + 0.5) / ((df.get(t) || 0) + 0.5));
      score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * d.len) / avgLen)));
    }
    // Curated high-signal chunks outrank auto-extracted page summaries on ties.
    if (score > 0 && d.chunk.type !== "page") score *= 1.15;
    if (score >= minScore) scored.push({ chunk: d.chunk, score });
  }
  scored.sort((a, b2) => b2.score - a.score);
  return scored.slice(0, limit);
};

export const company = kb.company;
export const kbMeta = kb.meta;
