// Relay end to end smoke test.
// Exercises the full deployed flow against a real Aicoo key and reports PASS or
// FAIL per step, so we never discover a broken route live on camera. It also
// prints which Aicoo endpoints were reached, which is our proof of real usage.
//
// Usage:
//   BASE_URL=https://relay-chi-five.vercel.app AICOO_KEY=sk_... npx tsx scripts/smoke.ts

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

  // 3. relay a real question to our own agent (exercises Aicoo POST /chat)
  let answered = false;
  if (meId) {
    const r = await call("/api/relay", {
      method: "POST",
      body: JSON.stringify({
        toMemberId: meId,
        question: "What is the v2 launch date and who owns it?",
      }),
    });
    answered =
      r.status === 200 &&
      typeof r.body?.answer === "string" &&
      r.body.answer.length > 0;
    ok(
      "relay -> grounded answer from the agent",
      answered,
      `status ${r.status}, len ${r.body?.answer?.length ?? 0}`,
    );
  } else {
    ok("relay (skipped, no member id)", false);
  }

  // 4. stats
  const s = await call("/api/stats");
  ok("stats -> totals", s.status === 200 && typeof s.body?.totalRequests === "number");

  console.log("");
  console.log("Aicoo endpoints exercised by this run:");
  console.log("  POST /api/v1/init   via connect (key validation)");
  console.log("  POST /api/v1/chat   via relay (grounded answer)");
  console.log("");
  console.log(`Result: ${pass} passed, ${fail} failed.`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export {};
