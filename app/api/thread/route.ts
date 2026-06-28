import { NextRequest, NextResponse } from "next/server";
import { getRequest, getThread } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/thread?id=REQUEST_ID -> the request plus its full message thread.
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id")?.trim() ?? "";
  if (!id) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const request = await getRequest(id);
  if (!request) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const messages = await getThread(id);
  return NextResponse.json({
    request: {
      id: request.id,
      fromName: request.fromName,
      toName: request.toName,
      question: request.question,
      status: request.status,
    },
    messages,
  });
}
