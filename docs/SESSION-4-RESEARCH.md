# SESSION 4 — RESEARCH, DOCS, SUBMISSION

You are one of four parallel agents building Relay for the AICOO Hackathon. Read `PRD.md` in
full first. You write words, not app code. Your job is to make the submission undeniable and to
give the team the language that wins the rubric (PRD section 3).

## Your lane (do not touch other files)

You OWN: `README.md`, everything under `docs/` except the other SESSION files, and the
submission draft `docs/DEVPOST.md`. You must NOT edit `app/**` or `lib/**`.

## Deliverables

1. **`README.md`** — premium and detailed. Sections: what Relay is, the problem, how it uses
   Aicoo (name the exact endpoints: `/init`, `/chat`, `/accumulate`, `/tools`, `/share`), the
   architecture in a short diagram, local setup, environment variables (point to `.env.example`),
   the demo flow, and a short roadmap (Aicoo OAuth swap when released). Clean, specific, honest.

2. **`docs/DEVPOST.md`** — the submission writeup, written against the rubric weights. Lead with
   the real problem, then the agent-to-agent mechanism, then proof it is deployed and multi user.
   Map each paragraph to a criterion. Include the live URL placeholder, the GitHub URL, and the
   "Built With" list (Next.js, TypeScript, Aicoo API, Upstash, Vercel).

3. **`docs/MARKET.md`** — tighten PRD section 7 into a one page competitive scan: Slack/Teams,
   Glean/Dust/Notion AI, Calendly. State clearly why a network of individually owned permissioned
   agents is different and only possible on Aicoo.

4. **`docs/DEMO.md`** — the two minute demo script from PRD section 11, with exact spoken lines
   and who clicks what. This is what we record.

5. **`docs/AICOO-USAGE.md`** — evidence for the 10% team-collaboration criterion. Document that we
   used Aicoo notes and briefing to coordinate this build, with space for two screenshots.

## Voice rules (hard)

- No em dashes anywhere. No generic AI marketing voice. Specific, grounded, confident.
- Every claim must be true and demonstrable. If it is not built yet, say "planned", not "does".
- Short sentences. Real numbers where we have them.

## Done when

A reviewer who reads only `README.md` and `docs/DEVPOST.md` understands exactly what Relay is,
why it is useful, and how deeply it uses Aicoo, with zero fluff.
