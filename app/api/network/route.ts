import { NextRequest, NextResponse } from "next/server";
import { listMembers } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/network -> the directory of agents plus who you are.
export async function GET(req: NextRequest) {
  const meId = req.cookies.get("relay_member")?.value ?? null;
  const members = await listMembers();
  return NextResponse.json({ members, meId });
}
