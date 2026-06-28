// Relay demo seeder.
// Seeds a connected member's Aicoo agent with a realistic persona's context, so
// the live demo produces specific, grounded answers instead of "I do not know".
// This also exercises the Aicoo /accumulate endpoint, which is part of how Relay
// makes the network smarter over time.
//
// Usage:
//   AICOO_KEY=sk_... npx tsx scripts/seed.ts maya
//   AICOO_KEY=sk_... npx tsx scripts/seed.ts devin
//   AICOO_KEY=sk_... npx tsx scripts/seed.ts sam
//
// The key is read from the environment at runtime and never stored.

const AICOO_BASE = "https://www.aicoo.io/api/v1";

type Note = { title: string; content: string };
type Persona = { name: string; role: string; folder: string; notes: Note[] };

// Three personas that form a believable startup team. The notes are written so a
// natural demo question has a precise, satisfying answer, and a sensitive or
// unknown question correctly has no answer and should escalate to the human.
const PERSONAS: Record<string, Persona> = {
  maya: {
    name: "Maya Chen",
    role: "Founder and CEO",
    folder: "Relay Demo",
    notes: [
      {
        title: "Company priorities (Q3)",
        content:
          "Top three priorities this quarter: ship the v2 launch by August 15, close the seed round, and hire two engineers. The launch is the gating item for the round.",
      },
      {
        title: "Refund policy",
        content:
          "Customers can request a full refund within 30 days, no questions asked. After 30 days we offer account credit only. Refunds are approved by the founder until we hire ops.",
      },
      {
        title: "Press and partnerships",
        content:
          "We are not announcing the funding round publicly until it closes. Partnership conversations with two design tools are early and confidential.",
      },
    ],
  },
  devin: {
    name: "Devin Park",
    role: "Engineering Lead",
    folder: "Relay Demo",
    notes: [
      {
        title: "v2 launch plan",
        content:
          "The v2 launch date is August 15. I own the launch. Backend is feature complete, the remaining work is load testing and the migration runbook. Code freeze is August 11.",
      },
      {
        title: "Service ownership",
        content:
          "I own the API and the data pipeline. Sam owns the web client. The auth service is shared. On-call rotates weekly and I take the launch week.",
      },
      {
        title: "Deploy process",
        content:
          "We deploy from main on merge. Rollbacks are one command. Production secrets live in the platform vault, never in the repo.",
      },
    ],
  },
  sam: {
    name: "Sam Rivera",
    role: "Design Lead",
    folder: "Relay Demo",
    notes: [
      {
        title: "Design system",
        content:
          "The design system is called Atlas. Primary type is a humanist sans, the accent color is a single warm amber, and we avoid heavy gradients. Components live in the shared library.",
      },
      {
        title: "Current sprint",
        content:
          "This sprint I am finishing the onboarding flow and the empty states for the dashboard. The launch marketing site is owned by the growth contractor, not me.",
      },
    ],
  },
};

async function main() {
  const key = process.env.AICOO_KEY;
  const who = (process.argv[2] || "").toLowerCase();
  if (!key) {
    console.error("Set AICOO_KEY in the environment. Aborting.");
    process.exit(1);
  }
  const persona = PERSONAS[who];
  if (!persona) {
    console.error(
      `Unknown persona "${who}". Choose one of: ${Object.keys(PERSONAS).join(", ")}`,
    );
    process.exit(1);
  }

  const body = {
    folders: { create: [persona.folder] },
    texts: persona.notes.map((n) => ({
      title: n.title,
      content: n.content,
      folder: persona.folder,
    })),
  };

  const res = await fetch(`${AICOO_BASE}/accumulate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const out = await res.text();
  if (!res.ok) {
    console.error(`Seed failed (${res.status}): ${out}`);
    process.exit(1);
  }
  console.log(
    `Seeded ${persona.name} (${persona.role}) with ${persona.notes.length} notes into "${persona.folder}".`,
  );
  console.log(out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
