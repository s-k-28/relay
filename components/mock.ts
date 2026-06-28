// A small in-memory stand-in for the backend lane so the whole flow is clickable
// before /api routes land. Mirrors the frozen contract exactly. Every api call in
// api.ts tries the real route first and only falls back here when it is unreachable,
// so this file quietly disappears the moment the backend is merged.

import type {
  ConnectResponse,
  EscalateResponse,
  Member,
  NetworkResponse,
  RelayResponse,
  Stats,
  ThreadMessage,
  ThreadResponse,
} from "./types";

interface MockRequest {
  id: string;
  fromName: string;
  toMemberId: string;
  toName: string;
  question: string;
  status: "answered" | "escalated" | "resolved";
  answer: string;
  createdAt: number;
}

// Seed the directory with a believable cross-functional team so the network reads real.
const seedMembers: Member[] = [
  { id: "m_dara", name: "Dara Okonkwo", role: "Head of Product", online: true },
  { id: "m_lin", name: "Lin Wei", role: "Staff Engineer, Platform", online: true },
  { id: "m_mara", name: "Mara Lindqvist", role: "Design Lead", online: true },
  { id: "m_sef", name: "Sef Abara", role: "Revenue Operations", online: false },
  { id: "m_juno", name: "Juno Park", role: "Customer Success", online: true },
];

// What each agent can answer from its person's permitted context. Real, specific copy.
const knowledge: Record<string, { match: RegExp; answer: string }[]> = {
  m_dara: [
    {
      match: /q3|launch|date|ship|release|roadmap/i,
      answer:
        "Q3 launch is locked for September 16. Scope is the shared inbox plus the routing rules. I own the go or no go call, and the gate is a green migration dry run two weeks before.",
    },
    {
      match: /priorit|next|focus|build/i,
      answer:
        "This cycle the priority order is routing reliability, then the audit log, then SSO. Anything outside those three needs a written reason before it goes on the board.",
    },
  ],
  m_lin: [
    {
      match: /deploy|ci|pipeline|build|env|stag/i,
      answer:
        "Deploys go out through the main pipeline. Staging promotes to production on a green run, no manual step. If you need an env var it goes in Vercel project settings, never in the repo.",
    },
    {
      match: /rate limit|api|endpoint|latency|timeout/i,
      answer:
        "The agent layer is capped at ten calls a minute on the free tier, so batch where you can. p95 on the relay path is under two seconds when the upstream is warm.",
    },
  ],
  m_mara: [
    {
      match: /color|palette|brand|token|design system|font|type/i,
      answer:
        "We run one ink base, slate neutrals, and a single signal accent. Type is an editorial serif for headlines and a grotesque for the interface. Tokens live in the system file, do not hardcode hex.",
    },
    {
      match: /figma|component|spacing|grid/i,
      answer:
        "Components live in the Console library in Figma. Spacing is on a four point grid. If a state is missing, add empty, loading, and focus before you mark a screen done.",
    },
  ],
  m_sef: [
    {
      match: /pricing|plan|tier|discount|quote/i,
      answer:
        "List is forty nine per seat monthly, thirty nine annual. Standing discount authority is ten percent. Anything deeper needs a one line reason and routes to me.",
    },
  ],
  m_juno: [
    {
      match: /onboard|customer|ticket|support|account|renewal/i,
      answer:
        "New accounts get a thirty minute kickoff and a shared rollout checklist. Renewals open ninety days out. Tickets tagged urgent are first response inside one hour during business hours.",
    },
  ],
};

// Topics an agent should not answer alone. These pull the human in.
const sensitive =
  /salary|comp\b|compensation|equity|raise|fire|layoff|terminate|acqui|legal|lawsuit|nda|password|secret|ssn|medical|health|personal|home address|resign/i;

function agentAnswer(memberId: string, question: string): { status: "answered" | "escalated"; answer: string } {
  if (sensitive.test(question)) {
    return {
      status: "escalated",
      answer:
        "This one is sensitive, so I did not answer on my own. I notified the human and attached the full thread. You will hear back from them directly.",
    };
  }
  const topics = knowledge[memberId] ?? [];
  const hit = topics.find((t) => t.match.test(question));
  if (hit) return { status: "answered", answer: hit.answer };

  const member = state.members.find((m) => m.id === memberId);
  const role = member ? member.role.toLowerCase() : "their work";
  return {
    status: "answered",
    answer: `From what ${member?.name.split(" ")[0] ?? "they"} has shared with me on ${role}, here is the short version. I do not have a written source for the exact detail you asked, so treat this as a pointer and escalate if you need it confirmed.`,
  };
}

interface MockState {
  members: Member[];
  meId: string | null;
  requests: MockRequest[];
  threads: Record<string, ThreadMessage[]>;
  seq: number;
}

const state: MockState = {
  members: seedMembers.map((m) => ({ ...m })),
  meId: null,
  requests: [],
  threads: {},
  seq: 1,
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const mock = {
  async network(): Promise<NetworkResponse> {
    await wait(120);
    return { members: state.members.map((m) => ({ ...m })), meId: state.meId };
  },

  async connect(name: string, role: string): Promise<ConnectResponse> {
    await wait(420);
    const id = `m_me_${state.seq++}`;
    const member: Member = { id, name, role: role || "Member", online: true };
    state.members = [member, ...state.members];
    state.meId = id;
    return { member: { id, name: member.name, role: member.role, online: true } };
  },

  async relay(toMemberId: string, question: string): Promise<RelayResponse> {
    const target = state.members.find((m) => m.id === toMemberId);
    if (!target) throw new Error("member_not_found");
    // believable agent think time, slightly variable
    await wait(900 + Math.floor(Math.random() * 700));
    const me = state.members.find((m) => m.id === state.meId);
    const fromName = me?.name ?? "You";
    const { status, answer } = agentAnswer(toMemberId, question);
    const id = `req_${state.seq++}`;
    const now = Date.now();
    state.requests.unshift({
      id,
      fromName,
      toMemberId,
      toName: target.name,
      question,
      status,
      answer,
      createdAt: now,
    });
    state.threads[id] = [
      { requestId: id, role: "requester", text: question, ts: now },
      { requestId: id, role: status === "escalated" ? "human" : "agent", text: answer, ts: now + 1 },
    ];
    return { requestId: id, status, answer, toName: target.name };
  },

  async thread(id: string): Promise<ThreadResponse> {
    await wait(100);
    const req = state.requests.find((r) => r.id === id);
    if (!req) throw new Error("not_found");
    return {
      request: { id: req.id, fromName: req.fromName, toName: req.toName, question: req.question, status: req.status },
      messages: state.threads[id] ?? [],
    };
  },

  async escalate(requestId: string): Promise<EscalateResponse> {
    await wait(280);
    const req = state.requests.find((r) => r.id === requestId);
    if (req) req.status = "escalated";
    return { ok: true, status: "escalated", notified: true };
  },

  async stats(): Promise<Stats> {
    await wait(120);
    const totalRequests = state.requests.length;
    const answeredByAgent = state.requests.filter((r) => r.status === "answered").length;
    const escalated = state.requests.filter((r) => r.status === "escalated").length;
    const resolved = state.requests.filter((r) => r.status === "resolved").length;
    return {
      totalRequests,
      answeredByAgent,
      escalated,
      resolved,
      // each agent answer is one interruption a human did not have to field
      interruptionsSaved: answeredByAgent,
    };
  },
};
