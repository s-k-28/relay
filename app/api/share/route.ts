import { NextRequest, NextResponse } from "next/server";
import { createShareLink } from "@/lib/aicoo";
import { getMember } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/share -> create a permissioned public agent link for the current
// member through Aicoo /share/create. Additive surface, not in the original six.
// This route acts on the caller's own behalf, so it requires their identity.
export async function POST(req: NextRequest) {
  const meId = req.cookies.get("relay_member")?.value ?? null;
  const me = meId ? await getMember(meId) : null;
  if (!me) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const link = await createShareLink(me.aicooKey, `Relay: ${me.name}`);
  if (!link) {
    return NextResponse.json({ error: "agent_unreachable" }, { status: 502 });
  }

  return NextResponse.json({ shareUrl: link.url, agentUrl: link.agentUrl });
}
