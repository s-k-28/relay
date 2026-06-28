# Relay — Product Requirements Document

> Built for the AICOO Hackathon. Relay is a network where your AI agent answers for you,
> and only pulls in the human when it genuinely cannot.

---

## 1. One-liner

Slack assumes a human reads every message. Relay flips it: every person is represented by
their own Aicoo agent, so a teammate gets an answer in seconds from your permitted context,
and you only get interrupted when the agent truly cannot help.

## 2. The real problem (why this is genuinely useful)

Knowledge work runs on interruptions. The average "quick question" costs the asker a wait and
the answerer a context switch, and most of those questions are things already written down
somewhere the asker cannot see. Teams have tried shared docs, wikis, and Slack search, and they
still ping a human because finding the answer is harder than asking a person.

Relay removes the interruption. Each person connects their Aicoo agent once. From then on, their
agent fields incoming questions against the context that person allowed it to see, answers
instantly, and escalates to the human only for the genuinely new or sensitive cases. The human
is the exception, not the default.

This is only possible because Aicoo gives every person a permissioned, callable agent. The
product cannot exist without Aicoo as its core, which is exactly what the rubric rewards.

## 3. How it scores (the rubric is the spec)

| Weight | Criterion | How Relay wins it |
|---|---|---|
| 30% | Use of Aicoo API / infra | Aicoo is the engine: each request is brokered to the target person's own agent (`/chat`), grounded in their context, with `/accumulate` writing resolved answers back so the network gets smarter, `/share` for permissioned exposure, and `/tools` (`send_message_to_human`) for escalation. Multi-account by design. |
| 25% | Product value / real workflow | Kills the "quick question" interruption tax. Universal across every team. |
| 20% | Technical execution + demo | Deployed on Vercel, multi-user, real keys, no mocked paths in the demo. |
| 15% | Demo clarity + submission | Two minute story: three people, one question, an instant agent answer, one escalation. |
| 10% | Team collaboration with AI COO | We run our own build on Aicoo and Relay, with evidence captured. |

## 4. Users

- **Member**: a person who connects their Aicoo agent. Becomes a node in the network.
- **Requester**: anyone in the network sending a question to a member.
- **Human (fallback)**: the member themselves, pinged only on escalation.

## 5. Core flows

1. **Connect your agent.** Enter name, role, and your Aicoo API key. We validate it against
   Aicoo `/init`, store it server side, and you are now reachable in the network. The key never
   returns to the browser.
2. **Browse the network.** See every member as a callable agent with a name and role. No keys
   are ever exposed client side.
3. **Relay a question.** Pick a member, type a question. Relay calls that member's agent with
   their own key, grounded in their permitted context, and returns an answer in seconds.
4. **Escalate when needed.** If the agent lacks the answer or the topic is sensitive, the
   request is marked escalated and the human is notified through Aicoo `send_message_to_human`,
   with the full thread attached.
5. **Get smarter.** Resolved answers are written back to the member's Aicoo context with
   `/accumulate`, so the next identical question is handled even faster.
6. **See the impact.** A live stat strip shows questions handled by agents vs escalated, and an
   estimate of interruptions saved.

## 6. Scope

**In scope (MVP, must demo):** connect agent, network directory, relay a question to a real
agent and get a real grounded answer, escalation path, live stats, deployed and multi user.

**Stretch (only if green by integration time):** accumulate write-back, share-link permission
controls per member, request history thread view, presence/online status.

**Out of scope:** real auth/passwords (session cookie identity only), billing, mobile native,
OAuth (Aicoo OAuth is not released yet; we use the sanctioned API-key model and note the swap).

## 7. Market scan (pragmatic, time-boxed)

- **Slack / Teams**: the status quo. Synchronous, interrupt-first, search is weak. Relay sits on
  top of the same need but answers before a human is touched.
- **Internal Q&A bots (Glean, Dust, Notion AI)**: single-corpus assistants. They answer from a
  shared knowledge base, not from a specific person's permissioned context, and they are not a
  network of distinct people's agents. Relay is person-to-person agent routing, not one big bot.
- **Calendly / intro tools**: route to a human's time. Relay routes to a human's knowledge and
  only escalates to their time when needed.
- **Why Relay is differentiated**: it is a network of individually owned, permissioned agents.
  The unit is a person, not a knowledge base. That is uniquely enabled by Aicoo and is the exact
  agent-to-agent thesis of this hackathon.

Positioning line: "The interruption layer for teams, replaced by agents."

## 8. Data model

- `Member { id, name, role, aicooKey (server only), createdAt, online }`
- `RelayRequest { id, fromName, toMemberId, toName, question, status, answer, createdAt }`
  - `status` in `answered | escalated | resolved`
- `ThreadMessage { requestId, role, text, ts }` where `role` in `requester | agent | human`

Store: Upstash Redis (KV). Keys: `member:{id}`, `members` (set), `request:{id}`, `requests`
(list, newest first), `thread:{id}` (list). Chosen for zero-schema speed and one-click Vercel
provisioning.

## 9. API contract (frozen, see CONTRACT in section 10)

Frontend builds against these shapes with mock data until the routes land. Backend implements
exactly these shapes. Neither waits on the other.

## 10. CONTRACT

All routes are under `/api`. All responses are JSON. Auth/identity is a `relay_member` httpOnly
cookie set on connect. Aicoo keys never appear in any response.

```
POST /api/connect
  body: { name: string, role?: string, aicooKey: string }
  200:  { member: { id, name, role, online: true } }   // sets relay_member cookie
  400 { error: "missing_fields" } | 401 { error: "invalid_key" }

GET /api/network
  200:  { members: Array<{ id, name, role, online }>, meId: string | null }

POST /api/relay
  body: { toMemberId: string, question: string }
  200:  { requestId: string, status: "answered" | "escalated", answer: string, toName: string }
  404 { error: "member_not_found" } | 502 { error: "agent_unreachable" }

GET /api/thread?id=REQUEST_ID
  200:  { request: { id, fromName, toName, question, status }, messages: ThreadMessage[] }

POST /api/escalate
  body: { requestId: string }
  200:  { ok: true, status: "escalated", notified: boolean }

GET /api/stats
  200:  { totalRequests, answeredByAgent, escalated, resolved, interruptionsSaved }
```

Shared types live in `lib/types.ts` (owned by backend session, imported by frontend).

## 11. Demo script (two minutes, every step real)

1. Three teammates each connect their Aicoo agent. Network shows three live agents. (15s)
2. Person A asks Person B's agent "what is the Q3 launch date and who owns it." The agent answers
   in seconds from B's context. (30s)
3. Person A asks something sensitive. The agent escalates, and B gets the ping with the thread. (30s)
4. B resolves it, the answer writes back, and asking again is instant. (25s)
5. Stat strip: N questions handled by agents, interruptions saved. Close on the line. (20s)

## 12. Success criteria

- Deployed public URL, reachable on a phone.
- Two real Aicoo accounts answer real questions from their own context, live.
- Zero broken paths in the demo flow.
- Submission complete on Devpost before 18:00 with video and writeup mapped to the rubric.
