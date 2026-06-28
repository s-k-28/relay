# SESSION 2 — FRONTEND + UX

You are one of four parallel agents building Relay for the AICOO Hackathon. You start with no
context, so read `docs/CONTEXT.md` IN FULL first (mission, rubric, the frozen contract, the Aicoo
API reference, the tools you have, anti-slop rules). Then read `PRD.md`, especially section 5
(flows), section 10 (CONTRACT), and section 11 (demo). The product must look genuinely premium. If
it looks vibe-coded, we lose. UI quality is a graded criterion.

You have full tooling: Claude Chrome browser automation (load via ToolSearch, see CONTEXT.md
section 6), the internet, the GitHub and Vercel CLIs. Use Chrome to study real product UIs and the
live Aicoo site for design language before you commit to a direction.

## Your lane (do not touch other files)

You OWN: `app/page.tsx`, `app/app/page.tsx`, `app/layout.tsx`, `app/globals.css`,
and a new `components/**` directory. You must NOT edit `app/api/**` or `lib/**`.
Import shared types from `lib/types.ts` (read-only) and call the routes in PRD section 10.

While backend routes are in flight, build against a small `lib/mock.ts` you own under
`components/` (or a local mock), then swap to real fetches. Never block on backend.

## Stack

Next.js 16 App Router, React 19, Tailwind v4 (already configured). Client components where you
need state. Use `fetch` to the contract routes.

## Screens

1. **Landing `/`** — what Relay is, in one strong sentence, plus a sub-line and a single
   primary CTA "Connect your agent" that routes to `/app`. Quiet, confident, editorial. One hero
   visual that signals a network of agents (nodes connected by lines), not stock clip art.

2. **App `/app`**:
   - **Connect panel** (first run): name, role, Aicoo API key field. On submit POST `/api/connect`.
     Add a small reassurance line that the key is stored server side and never exposed.
   - **Network directory**: every member as a clean agent card (name, role, an "online" dot).
   - **Composer**: pick a member, type a question, send to POST `/api/relay`. Show a tasteful
     thinking state, then the answer in a thread bubble. If status is `escalated`, show an
     escalation banner and a "the human was notified" note.
   - **Stat strip**: questions handled by agents vs escalated, interruptions saved (GET `/api/stats`).

## Design direction (this is graded, take it seriously)

- Aesthetic: a calm, premium "operator console." Think a quiet control surface, not a toy.
- Palette: one confident dark or ink base, one restrained accent (a single signal color), and
  generous neutral space. No rainbow gradients, no neon, no glassmorphism cliches.
- Typography: pick a characterful pairing, not the default Inter/Geist stack. A refined sans for
  UI, optionally a warmer face for the hero line. Set real type scale and line height.
- Motion: subtle. A spring on the agent answer arriving, a soft fade on cards. Nothing bouncy.
- Detail: real empty states, real loading states, hover and focus states, keyboard friendly.

## Anti-slop rules (hard)

- No em dashes anywhere in any copy. Use periods or commas.
- No "Unleash", "Seamless", "Revolutionize", "Supercharge", or generic AI marketing voice.
- No lorem ipsum in the final state. Write real, specific microcopy.
- Accessible: semantic landmarks, labeled inputs, visible focus, sufficient contrast.

## Done when

The full flow is clickable end to end against the real routes, it looks like a product a team
would pay for, and `npm run build` passes.
