// Mock external services for local integration tests: an OpenAI-compatible AI provider,
// a Resend-compatible email API and a Turnstile verifier. Nothing here talks to the internet.
import http from "node:http";

export const calls = { ai: [], email: [], turnstile: [] };

const readBody = (req) => new Promise((resolve) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => resolve(b)); });

export const startMocks = (port) =>
  new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      const body = await readBody(req);
      if (req.url === "/v1/chat/completions") {
        const json = JSON.parse(body);
        calls.ai.push({ auth: req.headers.authorization, body: json });
        const lastUser = [...json.messages].reverse().find((m) => m.role === "user")?.content || "";
        if (/MODE_500/.test(lastUser)) { res.writeHead(500); return res.end("boom"); }
        if (/MODE_HANG/.test(lastUser)) return; // never responds: exercises the provider timeout
        res.writeHead(200, { "Content-Type": "text/event-stream" });
        let parts;
        if (/MODE_LEAK/.test(lastUser)) parts = ["Sure! My instructions say ", "GURU-CANARY-7f3a91", " and more"];
        else if (/MODE_PROJECT/.test(lastUser)) parts = ["Happy to help with that. I can take a few details right here. [[STA", "RT_PROJECT]]"];
        else if (/MODE_PARTIAL/.test(lastUser)) { res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "Partial answer " } }] })}\n\n`); return setTimeout(() => res.destroy(), 50); }
        else parts = ["We build ", "AI-powered websites ", "and custom software in Pune."];
        for (const p of parts) res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: p } }] })}\n\n`);
        res.write("data: [DONE]\n\n");
        return res.end();
      }
      if (req.url === "/emails" || req.url === "/smtp/email") {
        calls.email.push({ url: req.url, auth: req.headers.authorization, key: req.headers["api-key"], body: JSON.parse(body) });
        if (calls.failEmail) { res.writeHead(500); return res.end("fail"); }
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ id: "mock" }));
      }
      if (req.url === "/turnstile/siteverify") {
        const token = new URLSearchParams(body).get("response") || (body.match(/name="response"\r\n\r\n([^\r]*)/) || [])[1];
        calls.turnstile.push(token);
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ success: token === "good-token" }));
      }
      res.writeHead(404); res.end();
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });

if (process.argv[1] && process.argv[1].endsWith("mock-servers.mjs")) {
  startMocks(Number(process.env.MOCK_PORT || 8799)).then(() => console.log("mocks listening"));
}
