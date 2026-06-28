// Runnable self-check for the Aicoo client parsing logic.
// No framework needed. Run with: node lib/aicoo.test.mjs
// Stubs fetch so we exercise answer extraction, ESCALATE detection, the NDJSON
// and SSE fallbacks, and key validation without touching the live API.
// Kept as .mjs so it stays out of the typecheck program while importing the
// real aicoo.ts through Node's built in TypeScript support.

import assert from "node:assert";
import { askAgent, validateKey } from "./aicoo.ts";

let next = { ok: true, status: 200, body: "" };
globalThis.fetch = async () => ({
  ok: next.ok,
  status: next.status,
  text: async () => next.body,
});

// Single JSON object answer.
next = { ok: true, status: 200, body: JSON.stringify({ message: "Q3 ships Aug 12, owned by Priya." }) };
let r = await askAgent("k", "when is launch", "Sam");
assert.strictEqual(r.escalate, false);
assert.match(r.answer, /Aug 12/);
assert.strictEqual(r.confidence, "high"); // default when answered without a tag

// Answer carrying a CONFIDENCE tag: the tag is captured and stripped clean.
next = { ok: true, status: 200, body: JSON.stringify({ message: "Ships Aug 12.\nCONFIDENCE: medium" }) };
r = await askAgent("k", "when", "Sam");
assert.strictEqual(r.escalate, false);
assert.strictEqual(r.confidence, "medium");
assert.strictEqual(r.answer, "Ships Aug 12.");

// ESCALATE token.
next = { ok: true, status: 200, body: JSON.stringify({ message: "ESCALATE" }) };
r = await askAgent("k", "what is your salary", "Sam");
assert.strictEqual(r.escalate, true);
assert.strictEqual(r.answer, "");
assert.strictEqual(r.confidence, "none");

// ESCALATE with a trailing colon still escalates.
next = { ok: true, status: 200, body: JSON.stringify({ message: "ESCALATE: needs the human." }) };
r = await askAgent("k", "approve budget", "Sam");
assert.strictEqual(r.escalate, true);

// SSE framed text deltas are parsed.
next = {
  ok: true,
  status: 200,
  body: [
    "data: " + JSON.stringify({ type: "text-delta", textDelta: "Streamed " }),
    "data: " + JSON.stringify({ type: "text-delta", textDelta: "answer." }),
    "data: [DONE]",
  ].join("\n"),
};
r = await askAgent("k", "hi", "Sam");
assert.strictEqual(r.answer, "Streamed answer.");

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
assert.strictEqual(r.escalate, false);
assert.strictEqual(r.answer, "Hello there.");

// Plain text body passes through.
next = { ok: true, status: 200, body: "Plain text answer." };
r = await askAgent("k", "hi", "Sam");
assert.strictEqual(r.answer, "Plain text answer.");

// Empty body escalates.
next = { ok: true, status: 200, body: "" };
r = await askAgent("k", "hi", "Sam");
assert.strictEqual(r.escalate, true);

// validateKey is true on 200, false otherwise.
next = { ok: true, status: 200, body: JSON.stringify({ success: true }) };
assert.strictEqual(await validateKey("k"), true);
next = { ok: false, status: 401, body: JSON.stringify({ error: "unauthorized" }) };
assert.strictEqual(await validateKey("k"), false);

console.log("ALL AICOO CHECKS PASSED");
