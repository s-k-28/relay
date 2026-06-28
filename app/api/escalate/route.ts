import { NextRequest, NextResponse } from "next/server";
import { notifyHuman } from "@/lib/aicoo";
import { appendThread, getMember, getRequest, setRequestStatus } from "@/lib/store";
import type { EscalateBody } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// POST /api/escalate { requestId }
// Marks a request escalated and pings the human through Aicoo. Notify is fail soft.
export async function POST(req: NextRequest) {
  let body: Partial<EscalateBody>;
  try {
    const parsed: unknown = await req.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }
    body = parsed as Partial<EscalateBody>;
  } catch {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const requestId = typeof body.requestId === "string" ? body.requestId.trim() : "";
  if (!requestId) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const request = await getRequest(requestId);
  if (!request) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Idempotent: only the first transition pings the human and writes the note.
  if (request.status === "escalated") {
    return NextResponse.json({ ok: true, status: "escalated", notified: false });
  }

  await setRequestStatus(requestId, "escalated");

  let notified = false;
  const target = await getMember(request.toMemberId);
  if (target) {
    notified = await notifyHuman(
      target.aicooKey,
      `Relay escalation from ${request.fromName}: "${request.question}". Open Relay to respond.`,
    );
  }

  await appendThread({
    requestId,
    role: "agent",
    text: `Escalated to ${request.toName}.`,
    ts: Date.now(),
  });

  return NextResponse.json({ ok: true, status: "escalated", notified });
}
