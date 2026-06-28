import { NextResponse } from "next/server";
import { getBriefing } from "@/lib/aicoo";
import { getMember, listRequests, toPublic } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/briefing/[memberId] -> the AI COO surface.
// Returns the member's Aicoo executive summary plus what their agent has
// handled inside Relay, so a member can see, in one place, what they were
// spared from being interrupted about.
export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/briefing/[memberId]">,
) {
  const { memberId } = await ctx.params;

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
