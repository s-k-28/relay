// Runnable self-check for the Aicoo client parsing logic.
// No framework needed. Run with: node lib/aicoo.test.ts
// Stubs fetch so we exercise answer extraction, escalate detection, the NDJSON
// fallback, and key validation without touching the live API.

import assert from "node:assert";
import { askAgent, validateKey } from "./aicoo.ts";

let next = { ok: true, status: 200, body: "" };
globalThis.fetch = (async () => ({
  ok: next.ok,
  status: next.status,
  text: async () => next.body,
})) as unknown as typeof fetch;

// Single JSON object answer.
next = { ok: true, status: 200, body: JSON.stringify({ message: "Q3 ships Aug 12, owned by Priya." }) };
let r = await askAgent("k", "when is launch", "Sam");
assert.equal(r.escalate, false);
assert.match(r.answer, /Aug 12/);

// ESCALATE token.
next = { ok: true, status: 200, body: JSON.stringify({ message: "ESCALATE" }) };
r = await askAgent("k", "what is your salary", "Sam");
assert.equal(r.escalate, true);
assert.equal(r.answer, "");

// NDJSON stream fallback joins text deltas.
next = {
  ok: true,
  status: 200,
  body: [
    JSON.stringify({ type: "text-delta", textDelta: "Hello " }),
    JSON.stringify({ type: "text-delta", textDelta: "there." }),
    JSON.stringify({ type: "completion", metadata: {} }),
  ].join("\n"),
};
r = await askAgent("k", "hi", "Sam");
assert.equal(r.escalate, false);
assert.equal(r.answer, "Hello there.");

// Plain text body passes through.
next = { ok: true, status: 200, body: "Plain text answer." };
r = await askAgent("k", "hi", "Sam");
assert.equal(r.answer, "Plain text answer.");

// Empty body escalates.
next = { ok: true, status: 200, body: "" };
r = await askAgent("k", "hi", "Sam");
assert.equal(r.escalate, true);

// validateKey is true on 200, false otherwise.
next = { ok: true, status: 200, body: JSON.stringify({ success: true }) };
assert.equal(await validateKey("k"), true);
next = { ok: false, status: 401, body: JSON.stringify({ error: "unauthorized" }) };
assert.equal(await validateKey("k"), false);

console.log("ALL AICOO CHECKS PASSED");
