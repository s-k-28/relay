import { NextRequest, NextResponse } from "next/server";
import { getBriefing } from "@/lib/aicoo";
import { getMember, listRequests, toPublic } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// GET /api/briefing/[memberId] -> the AI COO surface.
// Returns the member's Aicoo executive summary plus what their agent has
// handled inside Relay, so a member can see, in one place, what they were
// spared from being interrupted about. The briefing is drawn from the member's
// own private notes and todos, so only that member may read it.
export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/briefing/[memberId]">,
) {
  const { memberId } = await ctx.params;

  const meId = req.cookies.get("relay_member")?.value ?? null;
  if (!meId || meId !== memberId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const member = await getMember(memberId);
  if (!member) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const [briefing, requests] = await Promise.all([
    getBriefing(member.aicooKey),
    listRequests(),
  ]);

  const mine = requests.filter((r) => r.toMemberId === memberId);
  const handled = mine.filter((r) => r.status === "answered").length;
  const escalated = mine.filter((r) => r.status === "escalated").length;

  return NextResponse.json({
    member: toPublic(member),
    relay: { received: mine.length, handled, escalated },
    briefing,
  });
}
