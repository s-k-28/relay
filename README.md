<div align="center">

# Relay

### A network where your AI agent answers for you, and only pulls in the human when it genuinely cannot.

<p>
<img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white">
<img alt="React 19" src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
<img alt="Tailwind CSS v4" src="https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white">
<img alt="Upstash Redis" src="https://img.shields.io/badge/Upstash-Redis-00E9A3?style=for-the-badge&logo=upstash&logoColor=white">
<img alt="Vercel" src="https://img.shields.io/badge/Vercel-Hosting-000000?style=for-the-badge&logo=vercel&logoColor=white">
<img alt="Built on Aicoo" src="https://img.shields.io/badge/Built_on-Aicoo-4F46E5?style=for-the-badge">
</p>

**[Live demo](#)** `[PENDING DEPLOY]` &nbsp;.&nbsp; **[Devpost writeup](docs/DEVPOST.md)** &nbsp;.&nbsp; **[Demo script](docs/DEMO.md)** &nbsp;.&nbsp; **[Market scan](docs/MARKET.md)**

</div>

---

Relay is built on [Aicoo](https://www.aicoo.io). Every person connects their own Aicoo agent once. After that, an incoming question is answered by that person's agent, grounded in the context they allowed it to see, in seconds. The human is pinged only when the agent truly cannot help. The human becomes the exception, not the default.

> **Project status.** Active build for the AICOO Hackathon. The six-route API contract, the architecture, the Aicoo integration, and the data model below are frozen and final. The frontend console and the backend route handlers are being implemented in parallel against this contract. The live deployment URL is inserted above once it ships. Anything not yet running is tagged `[PENDING DEPLOY]`.

## Contents

- [The problem](#the-problem)
- [How it works](#how-it-works)
- [Why Relay is different](#why-relay-is-different)
- [How Relay uses Aicoo](#how-relay-uses-aicoo)
- [Architecture](#architecture)
- [Request lifecycle](#request-lifecycle)
- [API contract](#api-contract)
- [Data model](#data-model)
- [Project structure](#project-structure)
- [Quickstart](#quickstart)
- [Environment variables](#environment-variables)
- [Deployment](#deployment)
- [Security model](#security-model)
- [Reliability](#reliability)
- [Demo](#demo)
- [Roadmap](#roadmap)
- [Built for the AICOO Hackathon](#built-for-the-aicoo-hackathon)

## The problem

Knowledge work runs on interruptions. A "quick question" costs the asker a wait and costs the answerer a context switch, and most of those questions are already answered somewhere the asker cannot see. Teams add shared docs, wikis, and chat search, and people still ping a human, because finding the answer is harder than asking a person. Gloria Mark's research on interrupted work at UC Irvine is the standard reference for how costly that switch is: interrupted work gets done, but with more stress and a slow climb back to focus.

Relay removes the interruption. The question goes to the right person's agent first. The agent answers from that person's permitted context. The human is touched only for the genuinely new or sensitive cases.

This is only possible because Aicoo gives every person a permissioned, callable agent. Relay routes between those agents. It cannot exist without Aicoo as its engine, which is the point.

## How it works

One question travels one path. A requester picks a member in the network and sends a question. The route handler loads that member's Aicoo key from Redis, never the requester's, and calls that member's agent. The agent answers as that person, from their context. If it cannot, the request is marked escalated and the human is notified with the full thread. Resolved answers are written back so the next identical question is faster.

```
THE BROWSER (any phone or laptop)
+------------------------------------------------------------------+
| React 19 Server Components (streamed) + small client islands     |
| Landing . Connect . Network directory . Composer . Thread . Stats|
+----------------+---------------------------------+---------------+
                 | server-rendered                  | fetch() /api/*
                 v                                  v
+--------------------------+        +------------------------------+
| Next.js 16 (Vercel Node) |        | Route Handlers (/api/*)      |
| RSC data loading         |        | connect  network  relay      |
| layout  pages  metadata  |        | thread   escalate  stats     |
+-----------+--------------+        +--------------+---------------+
            |                                      |
            v                                      v
+------------------------------------------------------------------+
|  THE RELAY BROKER   (lib/aicoo.ts  +  lib/store.ts)              |
|  load target member key -> askAgent(/chat) -> ESCALATE?          |
|     yes -> notifyHuman(/tools)  no -> persist answer             |
|  -> write request + thread -> update stats -> (accumulate)       |
+----------------------------+-------------------------------------+
            |                                      |
            v                                      v
   +---------------------+             +-----------------------+
   |  AICOO API          |             |  UPSTASH REDIS (KV)   |
   |  /init   /chat      |             |  members . requests   |
   |  /tools  /accumulate|             |  threads              |
   |  /share             |             |                       |
   +---------------------+             +-----------------------+
   per-member key, server-side only    flat keys, newest-first,
   never in the browser, never logged  zero-schema, fail-soft
```

## Why Relay is different

Every product in this space treats knowledge as a pool to search, or treats the human as the thing to schedule. Relay's unit is the person: each member is a node, represented by their own permissioned agent, with the human as the fallback.

| | Generic AI bot | Slack + Slack AI | Glean | **Relay** |
|---|:---:|:---:|:---:|:---:|
| Unit of knowledge | shared index | message archive | shared index | **a person's agent** |
| Answers on a specific person's behalf | No | No | No | **Yes** |
| Escalates to the human on failure | No | No | No | **Yes, with thread** |
| Refuses to guess, enforced in code | No | No | No | **Yes (`ESCALATE`)** |
| Multi-account by design | No | n/a | No | **Yes, per key** |

The full sourced competitive scan is in [`docs/MARKET.md`](docs/MARKET.md).

## How Relay uses Aicoo

Aicoo is the core engine, not a feature. Base URL `https://www.aicoo.io/api/v1`. Auth is `Authorization: Bearer <key>`. Each key is user owned. Relay uses each member's own key to act on their behalf, server side only. A key never reaches the browser bundle and is never logged.

| Aicoo endpoint | Role in Relay | Status |
|---|---|---|
| `POST /init` | Validate a freshly connected key at connect time. A member is only added to the network if their key returns a workspace. | Core |
| `POST /chat` | The heart of Relay. A member's agent answers an incoming question, grounded in that member's permitted context. Sent with `stream: false` for one clean response. | Core |
| `GET` / `POST /tools` | Escalation. `messaging.send_message_to_human` notifies the real person with the full thread. `messaging.search_pulse_contact` resolves a person in the network. | Core |
| `POST /accumulate` | Write a resolved question and answer back into the member's "Relay" folder, so a repeat question is handled instantly. | Designed, stretch |
| `POST /share/create` | Expose a member's agent as a permissioned, scoped link with read or read-calendar access. | Designed, stretch |

Escalation is explicit, not guessed. The agent answers as the member and replies with the exact sentinel token `ESCALATE` when it lacks the answer or the topic is sensitive. The broker treats that token as a first-class status, not a hint:

```
ask = askAgent(targetKey, question, askerName)   // POST /chat, stream:false

if includes(ask, "ESCALATE"):
    status = "escalated"
    notifyHuman(targetKey, summarize(thread))     // POST /tools, fail soft
else:
    status = "answered"

persist(request, thread, status)
```

This gives a probabilistic model a hard behavioral property: on sensitive or unknown questions it hands off instead of inventing, and the human gets the full context. Multi-account is the default, not a flag: the network is many people, each with their own key and their own context. There is no single shared corpus and no single developer key reading everyone.

## Architecture

Relay is one Next.js 16 application (App Router, React 19 Server Components) written end to end in TypeScript. There is no separate backend service: server logic lives in Server Components and Route Handlers on Vercel's Node runtime, right next to the UI that consumes them. State is Upstash Redis. Every external call on a side path is fail soft, so the answer a requester is waiting for is never held hostage by a notify or a write-back.

## Request lifecycle

```
1. POST /api/relay { toMemberId, question }   (Route Handler, Vercel Node)
2. read relay_member cookie -> the asker's identity (httpOnly, server only)
3. store.getMember(toMemberId) -> the TARGET member, including their key
      unknown id -> 404 member_not_found
4. askAgent(targetKey, question, askerName):
      POST https://www.aicoo.io/api/v1/chat
        Authorization: Bearer <target key>
        body { message, stream: false }
5. parse the reply for the ESCALATE sentinel
      ESCALATE present -> status "escalated"
      otherwise        -> status "answered", answer = reply
6. store.createRequest(...) + store.appendThread(...)   (Upstash Redis)
7. if escalated: notifyHuman(targetKey, threadSummary) via /tools  (fail soft)
8. respond { requestId, status, answer, toName }
```

`GET /api/stats` runs over the same persisted requests, so the impact numbers are produced by the same code that answers, not a separate report.

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

Error codes are part of the contract: `400 missing_fields`, `401 invalid_key`, `404 member_not_found`, `502 agent_unreachable`. Shared TypeScript types live in `lib/types.ts`, imported read-only by the frontend so both sides build against one shape.

## Data model

```
Member        { id, name, role, aicooKey (server only), createdAt, online }
RelayRequest  { id, fromName, toMemberId, toName, question, status, answer, createdAt }
                status in answered | escalated | resolved
ThreadMessage { requestId, role, text, ts }
                role in requester | agent | human
```

Store is Upstash Redis, chosen for zero-schema speed and one-click provisioning on Vercel. The key layout is flat and fast:

```
member:{id}     the member record (incl. server-only key)
members         set of every member id, for the directory
request:{id}    a relay request and its status and answer
requests        list of request ids, newest first
thread:{id}     list of the messages for one request, in order
```

`listMembers()` strips every key before the directory ever leaves the server.

## Project structure

```
relay/
  app/
    page.tsx              landing
    app/page.tsx          operator console (connect, network, relay, stats)
    layout.tsx            root layout and metadata
    globals.css           Tailwind v4 styles
    api/
      connect/route.ts    validate key, set cookie, store member
      network/route.ts    member directory, keys stripped
      relay/route.ts      the broker: ask agent, persist, escalate
      thread/route.ts     a request and its messages
      escalate/route.ts   mark escalated, notify human
      stats/route.ts      totals and interruptions saved
  lib/
    aicoo.ts              server-only Aicoo client (validate, ask, notify, accumulate)
    store.ts              Upstash-backed store
    types.ts              shared types (frontend imports read-only)
  docs/                   README companions: DEVPOST, MARKET, DEMO, AICOO-USAGE
  .env.example            the two Upstash variables
```

## Quickstart

You need Node 20 or newer and an Upstash Redis database. You do not need a global Aicoo key. Each member supplies their own key at connect time.

```bash
git clone https://github.com/s-k-28/relay
cd relay
npm install
cp .env.example .env.local   # then fill in the two values below
npm run dev                   # http://localhost:3000
```

Open the console, then connect with a name, a role, and your Aicoo API key from your Aicoo account settings. Each teammate connects their own key to become a node in the network.

## Environment variables

Two values, both for Upstash Redis. See [`.env.example`](.env.example).

```
KV_REST_API_URL=     # Upstash Redis REST URL
KV_REST_API_TOKEN=   # Upstash Redis REST token
```

Aicoo keys are never environment variables. They are entered by each member at connect, stored server side in Redis, and used only to call that member's own agent. `.env.local` is kept out of git by `.gitignore`.

## Deployment

Relay deploys to Vercel. Push to `main` to auto-deploy. Set the two Upstash variables in the Vercel project settings, and provision Upstash Redis from the Vercel Marketplace in one click. There is no global Aicoo key to configure, by design.

## Security model

| Boundary | Control |
|---|---|
| Browser to server | httpOnly `relay_member` cookie identity, no token in client JavaScript |
| API key at rest | server side only in Redis, never in any response |
| API key in transit | HTTPS to Aicoo, `Authorization: Bearer` header |
| Logs | keys are never written, ever |
| Who can answer for whom | the broker loads the target member's key, never the asker's |
| Input | validated at the route boundary, exact contract error codes |
| Sensitive questions | `ESCALATE` handoff instead of a fabricated answer |

## Reliability

| Failure | Relay's response |
|---|---|
| Aicoo `/chat` unreachable | contract `502 agent_unreachable`, no crash |
| `notifyHuman` (`/tools`) fails | fail soft, the answer is still persisted |
| `accumulate` write-back fails | fail soft, the answer is unaffected |
| Invalid Aicoo key at connect | `401 invalid_key`, member not admitted |
| Unknown member id on relay | `404 member_not_found` |
| Malformed API input | validated, `400 missing_fields`, never a 500 |

## Demo

1. Three teammates each connect their Aicoo agent. The network shows three live agents.
2. Person A asks Person B's agent a real question. The agent answers in seconds from B's context.
3. Person A asks something sensitive or unknown. The agent escalates, and B gets the ping with the full thread.
4. B resolves it, the answer writes back, and asking again is instant.
5. The stat strip shows questions handled by agents, escalations, and interruptions saved.

The full two minute script with spoken lines is in [`docs/DEMO.md`](docs/DEMO.md).

## Roadmap

- **Aicoo OAuth.** Aicoo OAuth is not released yet, so Relay uses the sanctioned API-key model today. When OAuth ships, connect swaps the pasted key for an OAuth grant, with no change to the routing model.
- **Accumulate write-back on by default**, so the network gets measurably faster on repeat questions.
- **Per-member share links** via `/share/create`, so a member can expose a scoped public agent endpoint.
- **Request history and presence**, so the console shows live online status and a full thread archive.

## Built for the AICOO Hackathon

Relay is judged on five weighted criteria, and every decision traces to one of them.

| Weight | Criterion | How Relay earns it |
|---|---|---|
| 30% | Use of Aicoo API and infrastructure | Aicoo is the engine: `/init`, `/chat`, `/tools`, `/accumulate`, `/share`, multi-account by design, each member acting through their own key |
| 25% | Product value and real workflow | kills the universal quick-question interruption tax |
| 20% | Technical execution and demo | frozen contract, code-level escalation guardrail, fail-soft calls, server-only key isolation |
| 15% | Demo clarity and submission | a tight two minute story, plus a complete engineering writeup |
| 10% | Team collaboration with AI COO | we ran our own build on Aicoo notes, todos, and `/briefing` |

### Documentation

- [`PRD.md`](PRD.md) product requirements and the frozen contract.
- [`docs/DEVPOST.md`](docs/DEVPOST.md) the submission writeup, mapped to the rubric.
- [`docs/MARKET.md`](docs/MARKET.md) the sourced competitive scan.
- [`docs/DEMO.md`](docs/DEMO.md) the two minute demo script.
- [`docs/AICOO-USAGE.md`](docs/AICOO-USAGE.md) how we used Aicoo to coordinate the build.

<div align="center">

Relay answers as you, from your context, and pulls in the human the moment it should not answer alone. That is the entire point, kept in code.

</div>
