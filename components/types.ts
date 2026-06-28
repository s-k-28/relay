// Local mirror of the frozen API contract (docs/CONTEXT.md section 4, PRD section 10).
// The backend session owns lib/types.ts. The frontend lane cannot edit lib/, so these
// shapes live here read-only until lib/types.ts lands, then the two reconcile.

export type RequestStatus = "answered" | "escalated" | "resolved";
export type ThreadRole = "requester" | "agent" | "human";

export interface Member {
  id: string;
  name: string;
  role: string;
  online: boolean;
}

export interface ThreadMessage {
  requestId: string;
  role: ThreadRole;
  text: string;
  ts: number;
}

export interface NetworkResponse {
  members: Member[];
  meId: string | null;
}

export interface ConnectResponse {
  member: { id: string; name: string; role: string; online: true };
}

export interface RelayResponse {
  requestId: string;
  status: "answered" | "escalated";
  answer: string;
  toName: string;
}

export interface ThreadResponse {
  request: { id: string; fromName: string; toName: string; question: string; status: RequestStatus };
  messages: ThreadMessage[];
}

export interface EscalateResponse {
  ok: true;
  status: "escalated";
  notified: boolean;
}

export interface Stats {
  totalRequests: number;
  answeredByAgent: number;
  escalated: number;
  resolved: number;
  interruptionsSaved: number;
}
