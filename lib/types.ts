// Shared contract types for Relay.
// Owned by the backend lane, imported read only by the frontend.
// These shapes are the frozen API contract (PRD sections 8 and 10).

// Status of a relayed request through its lifecycle.
export type RequestStatus = "answered" | "escalated" | "resolved";

// Who authored a message in a request thread.
export type ThreadRole = "requester" | "agent" | "human";

// A person who connected their Aicoo agent. The aicooKey is server side only
// and is never serialized into any API response. PublicMember is the safe shape.
export interface Member {
  id: string;
  name: string;
  role: string;
  aicooKey: string;
  createdAt: number;
  online: boolean;
}

// Member shape that is safe to expose to the client. No key, ever.
export interface PublicMember {
  id: string;
  name: string;
  role: string;
  online: boolean;
}

// A question relayed from one person to a member's agent.
export interface RelayRequest {
  id: string;
  fromName: string;
  toMemberId: string;
  toName: string;
  question: string;
  status: RequestStatus;
  answer: string;
  createdAt: number;
}

// A single message in a request thread.
export interface ThreadMessage {
  requestId: string;
  role: ThreadRole;
  text: string;
  ts: number;
}

// POST /api/connect
export interface ConnectBody {
  name: string;
  role?: string;
  aicooKey: string;
}
export interface ConnectResponse {
  member: PublicMember;
}

// GET /api/network
export interface NetworkResponse {
  members: PublicMember[];
  meId: string | null;
}

// POST /api/relay
export interface RelayBody {
  toMemberId: string;
  question: string;
}
export type Confidence = "high" | "medium" | "low" | "none";

export interface RelayResponse {
  requestId: string;
  status: "answered" | "escalated";
  answer: string;
  toName: string;
  confidence?: Confidence;
}

// POST /api/route (ask the network): smart routing plus multi-hop fallback.
export interface RouteHop {
  memberId: string;
  name: string;
  answered: boolean;
}
export interface RouteResponse {
  requestId: string;
  status: "answered" | "escalated";
  answer: string;
  routedTo: { id: string; name: string; role: string };
  hops: RouteHop[];
  confidence?: Confidence;
}

// GET /api/briefing/[memberId]: AI COO summary plus this member's relay activity.
export interface BriefingResponse {
  member: PublicMember;
  relay: { received: number; handled: number; escalated: number };
  briefing: string | null;
}

// GET /api/thread?id=REQUEST_ID
export interface ThreadResponse {
  request: {
    id: string;
    fromName: string;
    toName: string;
    question: string;
    status: RequestStatus;
  };
  messages: ThreadMessage[];
}

// POST /api/escalate
export interface EscalateBody {
  requestId: string;
}
export interface EscalateResponse {
  ok: true;
  status: "escalated";
  notified: boolean;
}

// POST /api/share (additive Aicoo surface, not part of the original six)
export interface ShareResponse {
  shareLink: { url: string; agentUrl: string };
}

// GET /api/proof (public, no auth) -> self-reporting proof of real Aicoo usage.
export interface ProofResponse {
  product: string;
  coreThesis: string;
  aicooBaseUrl: string;
  aicooEndpointsUsed: Array<{ endpoint: string; usage: string }>;
  live: {
    membersConnected: number;
    requestsRelayed: number;
    answeredByAgent: number;
    escalated: number;
    resolved: number;
    interruptionsSaved: number;
  };
  dogfooding: {
    selfHosted: boolean;
    active: boolean;
    statement: string;
  };
  note: string;
}

// GET /api/stats
export interface StatsResponse {
  totalRequests: number;
  answeredByAgent: number;
  escalated: number;
  resolved: number;
  interruptionsSaved: number;
}

// Error envelope. The codes here are the exact ones in the contract.
export type ErrorCode =
  | "missing_fields"
  | "invalid_key"
  | "member_not_found"
  | "agent_unreachable"
  | "not_found"
  | "unauthorized";

export interface ErrorResponse {
  error: ErrorCode;
}
