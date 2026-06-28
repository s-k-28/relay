// Full live verification for Relay.
// Goes beyond smoke.ts: exercises the two unproven wow moments, escalation and
// permissioned agent links, against the deployed app with a real Aicoo key.
// Reports ground truth so the submission only claims what actually works.
//
// Usage:
//   AICOO_KEY=sk_... BASE_URL=https://relay-chi-five.vercel.app npx tsx scripts/verify-live.ts

const BASE = process.env.BASE_URL || "https://relay-chi-five.vercel.app";
const KEY = process.env.AICOO_KEY || "";

let cookie = "";
const results: { label: string; ok: boolean; detail: string }[] = [];

function record(label: string, ok: boolean, detail = "") {
  results.push({ label, ok, detail });
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? "  " + detail : ""}`);
}

async function call(path: string, init: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...(init.headers as Record<string, string> | undefined),
    },
  });
  const set = res.headers.get("set-cookie");
  if (set) cookie = set.split(";")[0];
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { status: res.status, body };
}

async function main() {
  console.log(`Relay FULL live verification against ${BASE}\n`);
  if (!KEY) {
    console.error("Set AICOO_KEY. Aborting.");
    process.exit(1);
  }

  // connect
  const c = await call("/api/connect", {
    method: "POST",
    body: JSON.stringify({ name: "Verifier", role: "QA Lead", aicooKey: KEY }),
  });
  const meId = c.body?.member?.id;
  record("connect", c.status === 200 && !!meId, `status ${c.status}`);

  // answerable question (seeded context should answer this specifically)
  const ans = await call("/api/relay", {
    method: "POST",
    body: JSON.stringify({
      toMemberId: meId,
      question: "What is the v2 launch date and who owns it?",
    }),
  });
  record(
    "relay answerable -> grounded answer",
    ans.status === 200 && (ans.body?.answer?.length ?? 0) > 0,
    `status "${ans.body?.status}", "${(ans.body?.answer || "").slice(0, 70)}..."`,
  );

  // unanswerable / sensitive question (should escalate, not invent)
  const esc = await call("/api/relay", {
    method: "POST",
    body: JSON.stringify({
      toMemberId: meId,
      question: "What is the CEO's personal home address and phone number?",
    }),
  });
  record(
    "relay unanswerable -> escalates (does not invent)",
    esc.status === 200 && esc.body?.status === "escalated",
    `got status "${esc.body?.status}"`,
  );

  // explicit escalate endpoint (send_message_to_human)
  if (ans.body?.requestId) {
    const e2 = await call("/api/escalate", {
      method: "POST",
      body: JSON.stringify({ requestId: ans.body.requestId }),
    });
    record(
      "escalate endpoint -> human notified",
      e2.status === 200 && e2.body?.ok === true,
      `notified=${e2.body?.notified}`,
    );
  }

  // share link (permissioned public agent endpoint)
  const sh = await call("/api/share", {
    method: "POST",
    body: JSON.stringify({ access: "read", label: "Verify link", expiresIn: "24h" }),
  });
  record(
    "share -> permissioned agent link",
    sh.status === 200 && !!(sh.body?.shareLink?.url || sh.body?.shareLink?.agentUrl),
    `status ${sh.status}`,
  );

  // stats
  const s = await call("/api/stats");
  record("stats", s.status === 200 && typeof s.body?.totalRequests === "number");

  const passed = results.filter((r) => r.ok).length;
  console.log(`\nResult: ${passed}/${results.length} green.`);
  console.log(
    "\nAicoo endpoints touched: /init (connect), /chat (relay), /tools send_message_to_human (escalate), /share/create (share).",
  );
  process.exit(passed === results.length ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
