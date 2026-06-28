import { NextRequest, NextResponse } from "next/server";
import { accumulate, askAgent, notifyHuman, rankMembers } from "@/lib/aicoo";
import { appendThread, createRequest, getMember, listMembers } from "@/lib/store";
import type { RelayBody, RouteHop } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// How many agents to try before falling back to a human.
const MAX_HOPS = 3;

// POST /api/route { question } -> ask the network.
// Aicoo ranks the members for the question, then each agent is tried in order
// until one answers from its context. If every tried agent escalates, the
// request escalates to the best matched human. This is the agent network: the
// question routes itself, and a human is the last resort, not the first.
export async function POST(req: NextRequest) {
  let body: Partial<RelayBody>;
  try {
    const parsed: unknown = await req.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }
    body = parsed as Partial<RelayBody>;
  } catch {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question || question.length > 4000) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const members = await listMembers();
  if (members.length === 0) {
    return NextResponse.json({ error: "member_not_found" }, { status: 404 });
  }

  // Resolve the asker and a key to run the router with.
  const meId = req.cookies.get("relay_member")?.value ?? null;
  let fromName = "A teammate";
  let routerKey: string | null = null;
  if (meId) {
    const me = await getMember(meId);
    if (me) {
      fromName = me.name;
      routerKey = me.aicooKey;
    }
  }
  if (!routerKey) {
    const first = await getMember(members[0].id);
    routerKey = first?.aicooKey ?? null;
  }
  if (!routerKey) {
    return NextResponse.json({ error: "agent_unreachable" }, { status: 502 });
  }

  const ranked = await rankMembers(routerKey, question, members);
  const hops: RouteHop[] = [];

  for (const id of ranked.slice(0, MAX_HOPS)) {
    const target = await getMember(id);
    if (!target) continue;

    let reply;
    try {
      reply = await askAgent(target.aicooKey, question, fromName);
    } catch {
      hops.push({ memberId: target.id, name: target.name, answered: false });
      continue;
    }

    if (!reply.escalate) {
      let request;
      try {
        request = await createRequest({
          fromName,
          toMemberId: target.id,
          toName: target.name,
          question,
          status: "answered",
          answer: reply.answer,
        });
        await appendThread({ requestId: request.id, role: "requester", text: question, ts: Date.now() });
        await appendThread({ requestId: request.id, role: "agent", text: reply.answer, ts: Date.now() });
      } catch {
        return NextResponse.json({ error: "agent_unreachable" }, { status: 502 });
      }
      await accumulate(target.aicooKey, question, `Q: ${question}\nA: ${reply.answer}`);
      hops.push({ memberId: target.id, name: target.name, answered: true });
      return NextResponse.json({
        requestId: request.id,
        status: "answered",
        answer: reply.answer,
        routedTo: { id: target.id, name: target.name, role: target.role },
        hops,
        confidence: reply.confidence,
      });
    }

    hops.push({ memberId: target.id, name: target.name, answered: false });
  }

  // No agent could answer. Escalate to the best matched human (top ranked).
  const top = await getMember(ranked[0]);
  const toName = top?.name ?? members[0].name;
  const toMemberId = top?.id ?? members[0].id;
  const answer = `No agent in the network could answer this from permitted context, so I have escalated it to ${toName}.`;

  let request;
  try {
    request = await createRequest({
      fromName,
      toMemberId,
      toName,
      question,
      status: "escalated",
      answer,
    });
    await appendThread({ requestId: request.id, role: "requester", text: question, ts: Date.now() });
    await appendThread({ requestId: request.id, role: "agent", text: answer, ts: Date.now() });
  } catch {
    return NextResponse.json({ error: "agent_unreachable" }, { status: 502 });
  }
  if (top) {
    await notifyHuman(
      top.aicooKey,
      `Relay escalation from ${fromName}: "${question}". No agent could answer. Open Relay to respond.`,
    );
  }
  return NextResponse.json({
    requestId: request.id,
    status: "escalated",
    answer,
    routedTo: { id: toMemberId, name: toName, role: top?.role ?? "" },
    hops,
    confidence: "none",
  });
}
