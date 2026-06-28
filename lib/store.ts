// Upstash Redis backed store for Relay. Server side only.
// Keys (PRD section 8): member:{id}, members (set), request:{id},
// requests (list, newest first), thread:{id} (list).

import { Redis } from "@upstash/redis";
import type {
  Member,
  PublicMember,
  RelayRequest,
  RequestStatus,
  StatsResponse,
  ThreadMessage,
} from "./types";

// Lazy singleton so importing this module never throws. The env is only
// required when a route actually touches the store at request time, which
// keeps `next build` working without secrets present.
let client: Redis | null = null;
function db(): Redis {
  if (!client) {
    // Accept either the Vercel KV naming or Upstash's native naming, since the
    // Vercel marketplace integration injects one or the other depending on path.
    const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const token =
      process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
      throw new Error(
        "Upstash not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN (or the UPSTASH_REDIS_REST_* equivalents).",
      );
    }
    client = new Redis({ url, token });
  }
  return client;
}

// Strip the Aicoo key. This is the only shape that ever reaches the client,
// so the key cannot leak through the directory by construction.
function toPublic(m: Member): PublicMember {
  return { id: m.id, name: m.name, role: m.role, online: m.online };
}

export async function createMember(input: {
  name: string;
  role: string;
  aicooKey: string;
}): Promise<Member> {
  const member: Member = {
    id: crypto.randomUUID(),
    name: input.name,
    role: input.role,
    aicooKey: input.aicooKey,
    createdAt: Date.now(),
    online: true,
  };
  await db().set(`member:${member.id}`, member);
  await db().sadd("members", member.id);
  return member;
}

// Includes the Aicoo key. Server side callers only.
export async function getMember(id: string): Promise<Member | null> {
  const m = await db().get<Member>(`member:${id}`);
  return m ?? null;
}

export async function listMembers(): Promise<PublicMember[]> {
  const ids = (await db().smembers("members")) as string[];
  if (!ids.length) return [];
  const rows = (await db().mget(...ids.map((id) => `member:${id}`))) as (Member | null)[];
  return rows
    .filter((m): m is Member => !!m)
    .sort((a, b) => a.createdAt - b.createdAt)
    .map(toPublic);
}

export async function createRequest(input: {
  fromName: string;
  toMemberId: string;
  toName: string;
  question: string;
  status: RequestStatus;
  answer: string;
}): Promise<RelayRequest> {
  const request: RelayRequest = {
    id: crypto.randomUUID(),
    fromName: input.fromName,
    toMemberId: input.toMemberId,
    toName: input.toName,
    question: input.question,
    status: input.status,
    answer: input.answer,
    createdAt: Date.now(),
  };
  await db().set(`request:${request.id}`, request);
  await db().lpush("requests", request.id); // newest first
  return request;
}

export async function getRequest(id: string): Promise<RelayRequest | null> {
  const r = await db().get<RelayRequest>(`request:${id}`);
  return r ?? null;
}

export async function setRequestStatus(
  id: string,
  status: RequestStatus,
): Promise<RelayRequest | null> {
  const r = await getRequest(id);
  if (!r) return null;
  const updated: RelayRequest = { ...r, status };
  await db().set(`request:${id}`, updated);
  return updated;
}

export async function listRequests(): Promise<RelayRequest[]> {
  const ids = (await db().lrange("requests", 0, -1)) as string[];
  if (!ids.length) return [];
  const rows = (await db().mget(...ids.map((id) => `request:${id}`))) as (RelayRequest | null)[];
  return rows.filter((r): r is RelayRequest => !!r);
}

export async function appendThread(msg: ThreadMessage): Promise<void> {
  await db().rpush(`thread:${msg.requestId}`, msg);
}

export async function getThread(id: string): Promise<ThreadMessage[]> {
  const rows = (await db().lrange(`thread:${id}`, 0, -1)) as ThreadMessage[];
  return rows ?? [];
}

export async function stats(): Promise<StatsResponse> {
  const requests = await listRequests();
  let answeredByAgent = 0;
  let escalated = 0;
  let resolved = 0;
  for (const r of requests) {
    if (r.status === "answered") answeredByAgent++;
    else if (r.status === "escalated") escalated++;
    else if (r.status === "resolved") resolved++;
  }
  // interruptionsSaved counts only what the agent handled with zero human ping.
  // Escalated and resolved requests both reached the human, so they do not count.
  return {
    totalRequests: requests.length,
    answeredByAgent,
    escalated,
    resolved,
    interruptionsSaved: answeredByAgent,
  };
}
