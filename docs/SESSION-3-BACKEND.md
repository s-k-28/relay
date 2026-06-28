# SESSION 3 — BACKEND + AICOO INTEGRATION

You are one of four parallel agents building Relay for the AICOO Hackathon. Read `PRD.md`
in full first, especially section 10 (CONTRACT) and section 8 (data model). The deadline is
hard. Build only what the contract specifies. Do not redesign it.

## Your lane (do not touch other files)

You OWN: `app/api/**` and `lib/**` (`lib/aicoo.ts`, `lib/store.ts`, `lib/types.ts`).
You must NOT edit: `app/` UI files, `app/globals.css`, `README.md`, `docs/**`.
Commit frequently with clear messages. Push to `main`.

## Stack

Next.js 16 App Router, TypeScript, route handlers on the Node runtime. Data store is Upstash
Redis via `@upstash/redis` (install it). Read keys from `KV_REST_API_URL` / `KV_REST_API_TOKEN`.

## Build, in order

1. `lib/types.ts` — the shared types from PRD section 8 and 10. Frontend imports these.

2. `lib/aicoo.ts` — server-only Aicoo client. Base `https://www.aicoo.io/api/v1`, auth header
   `Authorization: Bearer KEY`. Implement:
   - `aicoo<T>(key, path, init)` — fetch wrapper, parses JSON, throws `AicooError(status, code, body)` on non-ok.
   - `validateKey(key)` — `POST /init`, returns true if 200.
   - `askAgent(key, question, askerName)` — `POST /chat` with `{ message, stream: false }`. Frame the
     message so the agent answers as the member from their permitted context, and replies with the
     exact token `ESCALATE` when it lacks the answer or the topic is sensitive. Return `{ answer, escalate: boolean }`.
   - `notifyHuman(key, summary)` — `POST /tools` with `{ tool: "send_message_to_human", params: {...} }`. Fail soft.
   - `accumulate(key, title, content)` — `POST /accumulate` writing resolved Q&A into a "Relay" folder. Fail soft.

3. `lib/store.ts` — Upstash-backed store. Functions: `createMember`, `getMember(id)` (includes key,
   server only), `listMembers()` (strip keys), `createRequest`, `getRequest`, `listRequests`,
   `appendThread`, `getThread`, `stats()`. Keys per PRD section 8.

4. Route handlers per CONTRACT (PRD section 10): `app/api/connect/route.ts`,
   `app/api/network/route.ts`, `app/api/relay/route.ts`, `app/api/thread/route.ts`,
   `app/api/escalate/route.ts`, `app/api/stats/route.ts`.
   - `connect` validates the key with `validateKey`, stores the member, sets an httpOnly
     `relay_member` cookie with the member id.
   - `relay` loads the target member's key, calls `askAgent`, persists the request and thread,
     sets status `answered` or `escalated`, and on escalate calls `notifyHuman` (fail soft).
   - Never return any `aicooKey` in any response. Never log key values.

## Non-negotiables

- Keys are server-side only. Validate all input. Return the exact error codes in the contract.
- Every Aicoo call is fail-soft where the contract allows, but the happy path must be real.
- No em dashes anywhere in strings or comments. Plain, clean prose.

## Done when

All six routes return contract-shaped JSON, a real Aicoo key answers a real question through
`/api/relay`, and `npm run build` passes with no type errors.
