# Relay

A network where your AI agent answers for you, and only pulls in the human when it genuinely cannot.

Relay is built on [Aicoo](https://www.aicoo.io). Every person connects their own Aicoo agent once. After that, an incoming question is answered by that person's agent, grounded in the context they allowed it to see, in seconds. The human is pinged only when the agent truly cannot help. The human becomes the exception, not the default.

> Project status: active build for the AICOO Hackathon. The API contract and architecture below are frozen and final. The frontend console and the backend route handlers are being implemented in parallel. The live deployment URL is added to this file once it ships.

---

## The problem

Knowledge work runs on interruptions. A "quick question" costs the asker a wait and costs the answerer a context switch, and most of those questions are already answered somewhere the asker cannot see. Teams add shared docs, wikis, and chat search, and people still ping a human, because finding the answer is harder than asking a person.

Relay removes the interruption. The question goes to the right person's agent first. The agent answers from that person's permitted context. The human is touched only for the genuinely new or sensitive cases.

This is only possible because Aicoo gives every person a permissioned, callable agent. Relay routes between those agents. It cannot exist without Aicoo as its engine, which is the point.

## How it works

```
  Requester (browser)
        |
        v
  Next.js App Router on Vercel
   - app/page.tsx        landing
   - app/app/page.tsx    operator console (connect, network, relay, stats)
   - app/api/*           six JSON routes (frozen contract)
        |
        |  loads target member's own key, server side only
        v
  lib/aicoo.ts  ---- Authorization: Bearer <member key> ---->  Aicoo API
        |                                                       /init  validate
        |                                                       /chat  answer
        v                                                       /tools escalate
  lib/store.ts  ---->  Upstash Redis                            /accumulate writeback
   members, requests, threads                                  /share  permissioned link
```

One question travels one path. A requester picks a member in the network and sends a question. The route handler loads that member's Aicoo key from Redis, never the requester's, and calls that member's agent. The agent answers as that person, from their context. If it cannot, the request is marked escalated and the human is notified. Resolved answers are written back so the next identical question is faster.

## How Relay uses Aicoo

Aicoo is the core engine, not a feature. Base URL `https://www.aicoo.io/api/v1`. Auth is `Authorization: Bearer <key>`. Each key is user owned. Relay uses each member's own key to act on their behalf, server side only. A key never reaches the browser bundle and is never logged.

| Aicoo endpoint | Role in Relay | Status |
|---|---|---|
| `POST /init` | Validate a freshly connected key at connect time. A member is only added to the network if their key returns a workspace. | Core |
| `POST /chat` | The heart of Relay. A member's agent answers an incoming question, grounded in that member's permitted context. Sent with `stream: false` for one clean response. | Core |
| `GET` / `POST /tools` | Escalation. `messaging.send_message_to_human` notifies the real person with the full thread when their agent cannot answer. `messaging.search_pulse_contact` resolves a person in the network. | Core |
| `POST /accumulate` | Write a resolved question and answer back into the member's "Relay" folder, so a repeat question is handled instantly. | Designed, stretch |
| `POST /share/create` | Expose a member's agent as a permissioned, scoped link with read or read-calendar access. | Designed, stretch |

Escalation is explicit, not guessed. The agent is prompted to answer as the member and to reply with the exact token `ESCALATE` when it lacks the answer or the topic is sensitive. The backend reads that token, sets the request status to `escalated`, and calls `send_message_to_human`. Every Aicoo call on the escalation and write-back paths is fail soft, so a notify failure never breaks the answer the requester already received.

Multi-account by design. The network is many people, each with their own key and their own context. There is no single shared corpus and no single developer key reading everyone. That is the difference between a network of agents and one big bot.

## API contract

All routes are under `/api`. All responses are JSON. Identity is an httpOnly `relay_member` cookie set on connect. No Aicoo key appears in any response.

```
POST /api/connect   { name, role?, aicooKey }   -> { member: { id, name, role, online: true } }   sets cookie
GET  /api/network                                -> { members: [{ id, name, role, online }], meId }
POST /api/relay     { toMemberId, question }     -> { requestId, status: "answered" | "escalated", answer, toName }
GET  /api/thread?id=REQ                          -> { request: { id, fromName, toName, question, status }, messages: [] }
POST /api/escalate  { requestId }                -> { ok: true, status: "escalated", notified }
GET  /api/stats                                  -> { totalRequests, answeredByAgent, escalated, resolved, interruptionsSaved }
```

Error codes are part of the contract: `400 missing_fields`, `401 invalid_key`, `404 member_not_found`, `502 agent_unreachable`. Shared TypeScript types live in `lib/types.ts`.

## Data model

```
Member        { id, name, role, aicooKey (server only), createdAt, online }
RelayRequest  { id, fromName, toMemberId, toName, question, status, answer, createdAt }
                status in answered | escalated | resolved
ThreadMessage { requestId, role, text, ts }
                role in requester | agent | human
```

Store is Upstash Redis, chosen for zero-schema speed and one-click provisioning on Vercel. Keys: `member:{id}`, `members` (set), `request:{id}`, `requests` (list, newest first), `thread:{id}` (list).

## Stack

- Next.js 16, App Router, React 19, TypeScript.
- Tailwind CSS v4.
- Upstash Redis via `@upstash/redis`.
- Aicoo API for every agent answer, escalation, and write-back.
- Vercel for hosting.

## Local setup

You need Node 20 or newer and an Upstash Redis database. You do not need a global Aicoo key. Each member supplies their own key at connect time.

```bash
git clone https://github.com/s-k-28/relay
cd relay
npm install
cp .env.example .env.local   # then fill in the two values below
npm run dev                   # http://localhost:3000
```

Open the app, go to the console, and connect with a name, a role, and your Aicoo API key from your Aicoo account settings. Each teammate connects their own key to become a node in the network.

## Environment variables

Two values, both for Upstash Redis. See `.env.example`.

```
KV_REST_API_URL=     # Upstash Redis REST URL
KV_REST_API_TOKEN=   # Upstash Redis REST token
```

Aicoo keys are never environment variables. They are entered by each member at connect, stored server side in Redis, and used only to call that member's own agent. Keep `.env.local` out of git. It already is, via `.gitignore`.

## Demo flow

1. Three teammates each connect their Aicoo agent. The network shows three live agents.
2. Person A asks Person B's agent a real question. The agent answers in seconds from B's context.
3. Person A asks something sensitive or unknown. The agent escalates, and B gets the ping with the full thread.
4. B resolves it, the answer writes back, and asking again is instant.
5. The stat strip shows questions handled by agents, escalations, and interruptions saved.

The full two minute script with spoken lines is in [`docs/DEMO.md`](docs/DEMO.md).

## Documentation

- [`PRD.md`](PRD.md) product requirements and the frozen contract.
- [`docs/DEVPOST.md`](docs/DEVPOST.md) the submission writeup, mapped to the rubric.
- [`docs/MARKET.md`](docs/MARKET.md) the competitive scan.
- [`docs/DEMO.md`](docs/DEMO.md) the two minute demo script.
- [`docs/AICOO-USAGE.md`](docs/AICOO-USAGE.md) how we used Aicoo to coordinate the build.

## Roadmap

- Aicoo OAuth. Aicoo OAuth is not released yet, so Relay uses the sanctioned API-key model today. When OAuth ships, connect swaps the pasted key for an OAuth grant, with no change to the routing model.
- Accumulate write-back on by default, so the network gets measurably faster on repeat questions.
- Per-member share links via `/share/create`, so a member can expose a scoped public agent endpoint.
- Request history and presence, so the console shows live online status and a full thread archive.

## Security notes

- Aicoo keys are server side only. They are validated at connect, stored in Redis, and never returned in any response or written to any log.
- Identity is an httpOnly cookie, not a token in client storage.
- Inputs are validated at the route boundary, and the contract error codes are returned exactly.
