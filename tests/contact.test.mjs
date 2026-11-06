import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import endpoint from "../api/contact.mjs";

const origin = "https://preview.guru.test";
const fakeProvider = "https://api.emailjs.com/api/v1.0/email/send";
const nativeFetch = globalThis.fetch;
const environment = {
  EMAILJS_PUBLIC_KEY: "test-user",
  EMAILJS_PRIVATE_KEY: "test-secret",
  EMAILJS_SERVICE_ID: "test-service",
  EMAILJS_TEMPLATE_ID: "test-template",
};
const saved = new Map(Object.keys(environment).map(key => [key, process.env[key]]));
let sends = [];
let serial = 0;
let delivery = () => new Response("OK");

before(() => {
  Object.assign(process.env, environment);
  globalThis.fetch = async (url, options) => {
    assert.equal(url, fakeProvider, "The test should never contact an external service");
    sends.push(JSON.parse(options.body));
    return delivery();
  };
});
after(() => {
  globalThis.fetch = nativeFetch;
  for (const [key, value] of saved) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

function brief(overrides = {}) {
  serial++;
  return {
    name: "Local Test", email: "qa" + serial + "@example.invalid", phone: "",
    goal: "billing", service: "Billing Software", message: "I need a billing and stock system.",
    website: "", key: serial.toString(16).padStart(32, "0"), ...overrides,
  };
}
function post(data, headers = {}) {
  return new Request(origin + "/api/contact", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json", ...headers },
    body: typeof data === "string" ? data : JSON.stringify(data),
  });
}

test("rejects cross-origin, malformed, oversized and bot requests before delivery", async () => {
  sends = [];
  assert.equal((await endpoint.fetch(new Request(origin + "/api/contact"))).status, 405);
  assert.equal((await endpoint.fetch(post(brief(), { Origin: "https://other.test" }))).status, 403);
  assert.equal((await endpoint.fetch(post(brief(), { "Content-Type": "text/plain" }))).status, 415);
  assert.equal((await endpoint.fetch(post("{"))).status, 400);
  assert.equal((await endpoint.fetch(post("x".repeat(13_000)))).status, 413);
  assert.equal((await endpoint.fetch(post(brief({ website: "filled" })))).status, 400);
  const validation = await endpoint.fetch(post(brief({ email: "bad", goal: "unknown", service: "hidden" })));
  assert.equal(validation.status, 422);
  assert.deepEqual(Object.keys((await validation.json()).fields).sort(), ["email", "goal", "service"]);
  assert.equal(sends.length, 0);
});

test("shares the provider contract, blocks concurrent duplicates and acknowledges a retry once", async () => {
  sends = [];
  let complete;
  delivery = () => new Promise(resolve => { complete = resolve; });
  const data = brief();
  const first = endpoint.fetch(post(data));
  while (!complete) await new Promise(resolve => setImmediate(resolve));
  const duplicate = await endpoint.fetch(post(data));
  assert.equal(duplicate.status, 409);
  assert.equal((await duplicate.json()).code, "delivery_pending");
  complete(new Response("OK"));
  const result = await first;
  assert.deepEqual(await result.json(), { ok: true, code: "accepted" });
  assert.equal(result.headers.get("cache-control"), "no-store");
  assert.equal((await endpoint.fetch(post(data))).status, 200);
  assert.equal((await endpoint.fetch(post({ ...data, message: "Another brief with the same key." }))).status, 409);
  assert.equal(sends.length, 1);
  assert.equal(sends[0].template_params.goal, "Simplify billing and stock");
  assert.equal(sends[0].template_params.phone, "");
  assert.equal(sends[0].template_params.reply_to, data.email);
});

test("allows a rejected request to retry and never repeats an uncertain delivery", async () => {
  sends = [];
  const retry = brief();
  delivery = () => new Response("rejected", { status: 400 });
  assert.equal((await endpoint.fetch(post(retry))).status, 502);
  delivery = () => new Response("OK");
  assert.equal((await endpoint.fetch(post(retry))).status, 200);
  const uncertain = brief();
  delivery = () => { throw new Error("Test timeout"); };
  const failed = await endpoint.fetch(post(uncertain));
  assert.equal((await failed.json()).code, "delivery_uncertain");
  delivery = () => new Response("OK");
  const again = await endpoint.fetch(post(uncertain));
  assert.equal((await again.json()).code, "delivery_uncertain");
  assert.equal(sends.length, 3);
});

test("rate limits repeated submissions to the same email", async () => {
  sends = [];
  delivery = () => new Response("OK");
  const email = "qa-rate@example.invalid";
  for (let i = 0; i < 4; i++) assert.equal((await endpoint.fetch(post(brief({ email })))).status, 200);
  const limit = await endpoint.fetch(post(brief({ email })));
  assert.equal(limit.status, 429);
  assert.ok(Number(limit.headers.get("retry-after")) > 0);
  assert.equal(sends.length, 4);
});

test("reports missing provider configuration without a success response", async () => {
  delete process.env.EMAILJS_PRIVATE_KEY;
  try {
    const response = await endpoint.fetch(post(brief()));
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { ok: false, code: "delivery_unconfigured" });
  } finally {
    process.env.EMAILJS_PRIVATE_KEY = environment.EMAILJS_PRIVATE_KEY;
  }
});
