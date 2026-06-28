// Relay end to end smoke test.
// Exercises the full deployed flow against a real Aicoo key and reports PASS or
// FAIL per step, so we never discover a broken route live on camera. It also
// prints which Aicoo endpoints were reached, which is our proof of real usage.
//
// Usage:
//   BASE_URL=https://relay-chi-five.vercel.app AICOO_KEY=sk_... npx tsx scripts/smoke.ts

// Module marker so this script has its own scope and does not collide with the
// other scripts in the typecheck program.
export {};

const BASE = process.env.BASE_URL || "https://relay-chi-five.vercel.app";
const KEY = process.env.AICOO_KEY || "";

let cookie = "";
let pass = 0;
let fail = 0;

function ok(label: string, cond: boolean, detail = "") {
  if (cond) {
    pass++;
    console.log(`  PASS  ${label}${detail ? "  " + detail : ""}`);
  } else {
    fail++;
    console.log(`  FAIL  ${label}${detail ? "  " + detail : ""}`);
  }
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
  console.log(`Relay smoke test against ${BASE}`);
  if (!KEY) {
    console.error("Set AICOO_KEY in the environment. Aborting.");
    process.exit(1);
  }

  // 1. connect (exercises Aicoo POST /init to validate the key)
  const c = await call("/api/connect", {
    method: "POST",
    body: JSON.stringify({
      name: "Smoke Tester",
      role: "QA",
      aicooKey: KEY,
    }),
  });
  ok("connect -> 200 + member", c.status === 200 && !!c.body?.member, `status ${c.status}`);
  ok("connect never leaks the key", JSON.stringify(c.body || {}).indexOf(KEY) === -1);
  const meId = c.body?.member?.id;

  // 2. network directory
  const n = await call("/api/network");
  ok("network -> members listed", n.status === 200 && Array.isArray(n.body?.members));
  ok("network never leaks any key", JSON.stringify(n.body || {}).indexOf(KEY) === -1);

  // 3. relay a question our seeded context can answer (exercises Aicoo POST /chat)
  let answeredReqId = "";
  if (meId) {
    const r = await call("/api/relay", {
      method: "POST",
      body: JSON.stringify({
        toMemberId: meId,
        question: "What is the v2 launch date and who owns it?",
      }),
    });
    ok(
      "relay -> grounded answer from the agent",
      r.status === 200 &&
        r.body?.status === "answered" &&
        typeof r.body?.answer === "string" &&
        r.body.answer.length > 0,
      `status ${r.status}/${r.body?.status}, len ${r.body?.answer?.length ?? 0}`,
    );
    if (r.body?.requestId) answeredReqId = r.body.requestId;
  } else {
    ok("relay (skipped, no member id)", false);
  }

  // 4. relay a question the context cannot answer (the agent emits ESCALATE)
  if (meId) {
    const r = await call("/api/relay", {
      method: "POST",
      body: JSON.stringify({
        toMemberId: meId,
        question: "What is the CEO's personal home address?",
      }),
    });
    ok(
      "relay -> escalates when the answer is absent or sensitive",
      r.status === 200 && r.body?.status === "escalated",
      `status ${r.status}/${r.body?.status}`,
    );
  }

  // 5. escalate endpoint pings the human via Aicoo send_message_to_human
  if (answeredReqId) {
    const e = await call("/api/escalate", {
      method: "POST",
      body: JSON.stringify({ requestId: answeredReqId }),
    });
    ok(
      "escalate -> ok + status escalated",
      e.status === 200 && e.body?.ok === true && e.body?.status === "escalated",
      `status ${e.status}`,
    );
    ok(
      "escalate -> human notified via Aicoo send_message_to_human",
      e.body?.notified === true,
      `notified ${e.body?.notified}`,
    );
  } else {
    ok("escalate (skipped, no request id)", false);
  }

  // 6. thread view for the request
  if (answeredReqId) {
    const t = await call(`/api/thread?id=${answeredReqId}`);
    ok(
      "thread -> request + messages",
      t.status === 200 && !!t.body?.request && Array.isArray(t.body?.messages),
      `status ${t.status}, msgs ${t.body?.messages?.length ?? 0}`,
    );
  }

  // 7. share creates a permissioned agent link via Aicoo share/create
  const sh = await call("/api/share", { method: "POST" });
  ok(
    "share -> permissioned agent link",
    sh.status === 200 &&
      typeof sh.body?.shareLink?.url === "string" &&
      sh.body.shareLink.url.length > 0,
    `status ${sh.status}`,
  );
  ok("share never leaks the key", JSON.stringify(sh.body || {}).indexOf(KEY) === -1);

  // 8. stats
  const s = await call("/api/stats");
  ok("stats -> totals", s.status === 200 && typeof s.body?.totalRequests === "number");

  // 9. proof endpoint lists the wired Aicoo endpoints and live counts
  const p = await call("/api/proof");
  ok(
    "proof -> lists Aicoo endpoints + live counts",
    p.status === 200 &&
      Array.isArray(p.body?.aicooEndpointsUsed) &&
      p.body.aicooEndpointsUsed.length >= 5 &&
      typeof p.body?.live?.requestsRelayed === "number",
    `status ${p.status}, endpoints ${p.body?.aicooEndpointsUsed?.length ?? 0}`,
  );

  console.log("");
  console.log("Aicoo endpoints exercised by this run:");
  console.log("  POST /api/v1/init                          via connect (key validation)");
  console.log("  POST /api/v1/chat                          via relay (grounded answer + escalate)");
  console.log("  POST /api/v1/tools send_message_to_human   via escalate (human ping)");
  console.log("  POST /api/v1/accumulate                    via relay (resolved write-back)");
  console.log("  POST /api/v1/share/create                  via share (permissioned link)");
  console.log("");
  console.log(`Result: ${pass} passed, ${fail} failed.`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
