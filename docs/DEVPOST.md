# Relay

**A network where your AI agent answers for you, and only pulls in the human when it genuinely cannot.**

Built on Aicoo for the AICOO Hackathon.

- Live demo: https://relay-chi-five.vercel.app
- Source: https://github.com/s-k-28/relay

> Live now. The product is deployed at https://relay-chi-five.vercel.app and verifiable: `GET /api/stats` returns the real answered-vs-escalated counts from the same store the broker writes to, and `GET /api/network` lists members with their Aicoo keys stripped. A question has already been answered end to end by an agent in production. The architecture, the frozen six-route contract, and the Aicoo integration described below are final and live.

---

## The problem worth solving (Product value, 25%)

Knowledge work runs on interruptions, and the interruption is the most expensive line item nobody tracks. The unit is the "quick question." It costs the asker a wait, and it costs the answerer a context switch. Gloria Mark's research on interrupted work at UC Irvine is the standard reference for how costly that switch is: interrupted work still gets done, but with more stress, more effort, and a slow climb back to focus. The cruel part is that most of those questions already have answers, written down somewhere the asker cannot find, which is why people give up searching and ping a human instead. Finding the answer is harder than interrupting a person, so the interruption wins every time.

Teams have thrown shared docs, wikis, and chat search at this for a decade. People still ping a human. Relay removes the interruption instead of decorating it. The question goes to the right person's agent first. The agent answers from the context that person allowed it to see, in seconds. The human is reached only for the genuinely new or sensitive cases. The human becomes the exception, not the default. This is universal. Every team that has ever said "quick question" is the market.

## The mechanism: a network of agents, not one more bot (Aicoo usage, 30%)

Relay is person-to-person agent routing. Every member connects their own Aicoo agent once and becomes a node in the network, a callable agent with a name and a role. A request is brokered to the target person's own agent, grounded in that person's permitted context, using that person's own key. There is no shared corpus and no single developer key reading everyone. The unit is a person, not a knowledge base. This is the exact agent-to-agent thesis the hackathon rewards, and it is the entire reason Aicoo is load bearing rather than decorative.

Aicoo is the engine. Relay calls it on every meaningful path, server side only, with `Authorization: Bearer <member key>` against `https://www.aicoo.io/api/v1`:

- `POST /init` validates a freshly connected key at connect time. A member is only admitted to the network if their key returns a real workspace, so the directory is never populated with dead nodes.
- `POST /chat` is the heart of the product. The target member's agent answers an incoming question grounded in that member's context. Relay sends `stream: false` to get one clean, final assistant message instead of an NDJSON event stream, because the broker wants a single answer to persist, not a token feed to render.
- `GET` and `POST /tools` drive escalation. When an agent cannot answer, `messaging.send_message_to_human` notifies the real person with the full thread attached, and `messaging.search_pulse_contact` resolves a person inside the network.
- `POST /accumulate` writes a resolved question and answer back into the member's "Relay" folder, so the next identical question is handled instantly and the network gets measurably smarter every time a human steps in. Designed, on the stretch path.
- `POST /share/create` exposes a member's agent as a permissioned, scoped link with read or read-calendar access. Designed, on the stretch path.

The escalation is explicit, not a guess. Relay frames the `/chat` message so the agent answers as the member and replies with the exact sentinel token `ESCALATE` when it lacks the answer or the topic is sensitive. The backend parses that token, sets the request status to `escalated`, and fires `send_message_to_human`. Multi-account is the default state, not a feature flag: the network is many people, each with their own key and their own context, brokered independently. Every Aicoo call on the escalation and write-back paths is fail soft, so a notify failure or a write-back failure never corrupts the answer the requester already received. Keys are user-owned credentials, validated at connect, stored server side, never returned in any response, and never written to any log.

## Technical execution (Technical execution and demo, 20%)

The stack is deliberately lean so the demo path has nothing to break. Next.js 16 with the App Router and React 19, TypeScript end to end, Tailwind CSS v4 for the interface, Upstash Redis for state via `@upstash/redis`, and Vercel for hosting. The Aicoo client lives in `lib/aicoo.ts` and runs only on the server, so a key never enters the browser bundle.

The API is a frozen contract of six JSON route handlers on the Node runtime, each with exact error codes:

```
POST /api/connect   { name, role?, aicooKey }   -> { member }            sets httpOnly relay_member cookie
GET  /api/network                                -> { members[], meId }
POST /api/relay     { toMemberId, question }     -> { requestId, status, answer, toName }
GET  /api/thread?id=REQ                          -> { request, messages[] }
POST /api/escalate  { requestId }                -> { ok, status, notified }
GET  /api/stats                                  -> { totalRequests, answeredByAgent, escalated, resolved, interruptionsSaved }
```

Error codes are part of the contract, not an afterthought: `400 missing_fields`, `401 invalid_key`, `404 member_not_found`, `502 agent_unreachable`. Identity is an httpOnly `relay_member` cookie set at connect, not a token in client storage, so the browser never holds anything sensitive. The data model is three records: `Member { id, name, role, aicooKey (server only), createdAt, online }`, `RelayRequest { id, fromName, toMemberId, toName, question, status, answer, createdAt }` with status in `answered | escalated | resolved`, and `ThreadMessage { requestId, role, text, ts }` with role in `requester | agent | human`. Redis keys are flat and fast: `member:{id}`, a `members` set, `request:{id}`, a `requests` list newest first, and a `thread:{id}` list per request. Upstash was chosen for zero-schema speed and one-click provisioning on Vercel, so there is no migration step between idea and running state.

The critical path is single hop and observable. `POST /api/relay` loads the target member's key from Redis, never the requester's, calls `askAgent`, persists the request and the thread, sets the status, and on escalate calls `notifyHuman`. This is deployed and live on Vercel at https://relay-chi-five.vercel.app, reachable on a phone, with real Aicoo agents answering from their own context. The live `GET /api/stats` already reflects a question answered end to end by an agent, with the key never present in any response.

## The demo (Demo clarity and submission, 15%)

The story is two minutes, three people, one question, one escalation. Ava the founder connects her agent live. She asks Ben's agent for the Q3 launch date and owner, and the agent answers in seconds from Ben's context while Ben is never interrupted. She asks something sensitive, a discount approval, and the agent refuses to guess and escalates, so Ben gets the ping with the full thread. Ben answers once, Relay writes the answer back, and the same question is now instant for anyone. The stat strip closes the loop: questions handled by agents, escalations, and interruptions saved. Every step is a real action against the deployed product at https://relay-chi-five.vercel.app, not a slide. The full script with spoken lines is in `docs/DEMO.md`. The recorded walkthrough is linked at the top of the Devpost entry.

## We ran our own build on Aicoo (Team collaboration, 10%)

Relay's thesis is that an agent answers from context and a human is the fallback, and we ran the build the same way. Four parallel sessions, each with a lane: an orchestrator that integrates and deploys, a frontend session, a backend and Aicoo session, and this research and docs session. We used Aicoo notes and todos as the shared build log and the Aicoo `POST /briefing` endpoint to summarize build status, the same AI COO surface a real team uses for a standup and the same surface Relay leans on for escalation and write-back. The agents did the work in their lanes, and the human integrated at the points that needed judgment. Evidence and screenshots are in `docs/AICOO-USAGE.md`. This is the most honest demonstration we can offer: the pattern that powers the product also ran the build.

## What is next

Aicoo OAuth is not released yet, so Relay uses the sanctioned API-key model today and notes the swap. When OAuth ships, connect exchanges the pasted key for an OAuth grant with no change to the routing model. After that: accumulate write-back on by default so repeat questions are measurably faster, per-member `/share/create` links for scoped public agent endpoints, and live presence plus a full thread archive in the console.

## Built With

Next.js 16, React 19, TypeScript, Tailwind CSS v4, Aicoo API (`/init`, `/chat`, `/tools`, `/accumulate`, `/share`), Upstash Redis, Vercel.
