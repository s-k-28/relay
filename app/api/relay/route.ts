import { NextRequest, NextResponse } from "next/server";
import { accumulate, askAgent, notifyHuman } from "@/lib/aicoo";
import {
  appendThread,
  createRequest,
  getMember,
} from "@/lib/store";
import type { RelayBody } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/relay { toMemberId, question }
// Brokers the question to the target member's own agent, persists the request
// and thread, and escalates to the human when the agent cannot answer.
export async function POST(req: NextRequest) {
  let body: Partial<RelayBody>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const toMemberId = typeof body.toMemberId === "string" ? body.toMemberId.trim() : "";
  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!toMemberId || !question) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const target = await getMember(toMemberId);
  if (!target) {
    return NextResponse.json({ error: "member_not_found" }, { status: 404 });
  }

  // Resolve the asker's name from their identity cookie when present.
  const meId = req.cookies.get("relay_member")?.value ?? null;
  let fromName = "A teammate";
  if (meId) {
    const me = await getMember(meId);
    if (me) fromName = me.name;
  }

  // Ask the target's agent. A failure here is the only agent_unreachable path.
  let reply;
  try {
    reply = await askAgent(target.aicooKey, question, fromName);
  } catch {
    return NextResponse.json({ error: "agent_unreachable" }, { status: 502 });
  }

  const status = reply.escalate ? "escalated" : "answered";
  const answer = reply.escalate
    ? `This one needs ${target.name} directly, so I have escalated it and notified them with the full thread.`
    : reply.answer;

  const request = await createRequest({
    fromName,
    toMemberId: target.id,
    toName: target.name,
    question,
    status,
    answer,
  });

  await appendThread({ requestId: request.id, role: "requester", text: question, ts: Date.now() });
  await appendThread({ requestId: request.id, role: "agent", text: answer, ts: Date.now() });

  if (reply.escalate) {
    // Fail soft: the request is already marked escalated regardless.
    await notifyHuman(
      target.aicooKey,
      `Relay escalation from ${fromName}: "${question}". Open Relay to respond.`,
    );
  } else {
    // Write the resolved answer back so the next identical question is instant.
    await accumulate(target.aicooKey, question, `Q: ${question}\nA: ${answer}`);
  }

  return NextResponse.json({
    requestId: request.id,
    status,
    answer,
    toName: target.name,
  });
}
