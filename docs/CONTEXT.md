# Relay — Full Context for a Fresh Agent

You were just cloned into this repo with no prior context. Read this entire file before writing
anything. It contains the mission, the grading rubric, the stack, the API contract, the Aicoo API
reference, the tools you have, and the coordination rules. Then read `PRD.md` for depth, then read
your own `docs/SESSION-N-*.md` lane file.

This is a hackathon with a hard deadline. Move fast, stay in your lane, commit often.

---

## 1. What we are building

Relay is a network where your AI agent answers for you, and only pulls in the human when it
genuinely cannot.

The problem: knowledge work runs on interruptions. Every "quick question" makes the asker wait and
forces the answerer to context switch, and most of those questions are already answered somewhere
the asker cannot see. Relay fixes this. Each person connects their own Aicoo agent once. After that,
their agent fields incoming questions against the context that person allowed it to see, answers in
seconds, and escalates to the human only for genuinely new or sensitive cases. The human becomes the
exception, not the default.

This is only possible because Aicoo gives every person a permissioned, callable agent. Relay cannot
exist without Aicoo as its engine. That is the entire point.

## 2. The rubric is the spec (memorize this)

We are judged on exactly these weights. Every decision should trace to one of them.

```
30%  Use of Aicoo API / infrastructure   -> Aicoo is the core engine, many endpoints, multi-account
25%  Product value / real workflow        -> solves a genuine, painful, real-life job
20%  Technical execution + demo           -> deployed, working, no broken paths
15%  Demo clarity + submission            -> tight 2 min video, complete writeup
10%  Team collaboration with AI COO       -> we ran our own build on Aicoo, with evidence
```

If a feature does not move one of these numbers, do not build it.

## 3. Stack and repo

- Next.js 16 (App Router, React 19), TypeScript, Tailwind v4. Already scaffolded.
- Data store: Upstash Redis via `@upstash/redis`. Env: `KV_REST_API_URL`, `KV_REST_API_TOKEN`.
- Deploy target: Vercel. Repo: https://github.com/s-k-28/relay
- You are working in your own clone on your own branch. Commit often. Push your branch. Session 1
  (the orchestrator) merges branches into `main`, deploys, and submits. Do not merge to main yourself.

## 4. The frozen API contract

All routes under `/api`, all JSON. Identity is an httpOnly `relay_member` cookie set on connect.
Aicoo keys never appear in any response or any log.

```
POST /api/connect   { name, role?, aicooKey }      -> { member:{ id,name,role,online:true } }  sets cookie
GET  /api/network                                   -> { members:[{id,name,role,online}], meId }
POST /api/relay     { toMemberId, question }        -> { requestId, status:"answered"|"escalated", answer, toName }
GET  /api/thread?id=REQ                             -> { request:{id,fromName,toName,question,status}, messages:[] }
POST /api/escalate  { requestId }                   -> { ok:true, status:"escalated", notified }
GET  /api/stats                                     -> { totalRequests, answeredByAgent, escalated, resolved, interruptionsSaved }
```

Shared TypeScript types live in `lib/types.ts` (owned by the backend session, imported read-only by
frontend). Frontend builds against these shapes with local mocks until routes land. Neither side waits.

## 5. Aicoo API reference (you do not need to log in, it is all here)

Base URL `https://www.aicoo.io/api/v1`. Auth header `Authorization: Bearer KEY`. The key is a
user-owned credential: server-side only, never in the browser bundle, never logged.

Endpoints Relay uses:

```
POST /init
  body {} -> { success, workspace:{ folders, totalFiles, totalSizeBytes } }
  Use to validate a freshly connected key.

POST /chat
  body { message, stream:false, userTimezone? } -> final assistant message text
  (When stream is true it returns NDJSON events: text-delta, tool-call-start, completion.
   Always send stream:false for Relay so you get one clean response.)
  This is how a member's agent answers, grounded in that member's permitted context.

POST /tools          body { tool, params } -> { success, result }
GET  /tools          -> { tools:[...], totalTools }   (discover available tools)
  Relevant tools: messaging.send_message_to_human (escalate to the human),
  messaging.search_pulse_contact (find a person in the network).

POST /accumulate
  body { texts:[{ title, content, folder? }], folders?:{ create?:[] } } -> { success, created, updated }
  Use to write a resolved question and answer back into the member's "Relay" folder so repeats are instant.

POST /share/create
  body { scope:"all"|"folders", access:"read"|"read_calendar"|"read_calendar_write", label?, expiresIn?, identity? }
  -> { shareLink:{ url, agentUrl, ... } }
  Optional stretch: lets a member expose a permissioned public agent endpoint.

GET  /briefing  /  POST /briefing  -> executive summary from notes/todos (optional, AI COO surface)
```

Auth model note from Aicoo: the API key represents the user who created it. Your product uses each
user's own key to act on their behalf. Do not use one developer key to read another user's data.
Aicoo OAuth is coming but not released, so we use the sanctioned API-key model and note the future swap.

Rate limits: free tier is 10 requests per minute. Keep calls lean.

## 6. Tools you have (use them)

Every session has full tooling. Use it.

- Claude Chrome browser automation (MCP `mcp__claude-in-chrome__*`). If the tools are not loaded,
  load them with ToolSearch first, for example:
  `ToolSearch "select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__read_page,mcp__claude-in-chrome__get_page_text"`
  Call `tabs_context_mcp` first, then create your own new tab. Do not reuse another session's tab.
  - Frontend: open https://www.aicoo.io for live design language, and reference real products for layout polish.
  - Backend: the machine-readable spec is at https://www.aicoo.io/docs/api/spec if you want to confirm a shape (login required there, but section 5 above already has what you need).
  - Research: browse competitors (Slack, Glean, Dust, Notion AI) to ground the market section.
- Full internet access for docs and references.
- Vercel CLI (`npx vercel`) and GitHub CLI (`gh`) are available.
- You may NOT sign in, create accounts, or print secret keys. If a step needs a login or a secret,
  stop and tell the human the exact one click to perform. Never paste a secret value into chat or a file.

## 7. Anti-slop rules (hard, this is graded)

- No em dashes anywhere, in code, comments, or copy. Use periods or commas.
- No generic AI marketing voice. Banned words: Unleash, Seamless, Revolutionize, Supercharge, Effortless.
- No lorem ipsum in any final state. Write real, specific microcopy and real content.
- Accessibility is not optional: semantic landmarks, labeled inputs, visible focus, sufficient contrast.
- The product must look like something a team would pay for. If it looks vibe-coded, we lose points.

## 8. Coordination

- Lanes: Session 2 owns `app/` UI plus `components/`. Session 3 owns `app/api/` plus `lib/`.
  Session 4 owns `README.md` and `docs/` (except SESSION files). Session 1 orchestrates and integrates.
- Never edit another lane's files. If you need a change there, write it in your report, not their files.
- Commit small and often. Push your branch. When your lane is done and `npm run build` passes, report
  "LANE ready on branch NAME" with a one paragraph summary of what you built and any contract gaps.
