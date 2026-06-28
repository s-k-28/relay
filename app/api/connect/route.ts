import { NextRequest, NextResponse } from "next/server";
import { validateKey } from "@/lib/aicoo";
import { createMember, toPublic } from "@/lib/store";
import type { ConnectBody } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/connect { name, role?, aicooKey }
// Validates the key against Aicoo, stores the member, sets the identity cookie.
export async function POST(req: NextRequest) {
  let body: Partial<ConnectBody>;
  try {
    const parsed: unknown = await req.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }
    body = parsed as Partial<ConnectBody>;
  } catch {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const aicooKey = typeof body.aicooKey === "string" ? body.aicooKey.trim() : "";
  const role =
    typeof body.role === "string" && body.role.trim() ? body.role.trim() : "Member";

  // Presence plus length caps at the trust boundary so a caller cannot abuse
  // Aicoo quota or Redis storage with oversized input.
  if (!name || !aicooKey || name.length > 120 || role.length > 120 || aicooKey.length > 500) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const valid = await validateKey(aicooKey);
  if (!valid) {
    return NextResponse.json({ error: "invalid_key" }, { status: 401 });
  }

  const member = await createMember({ name, role, aicooKey });

  const res = NextResponse.json({ member: toPublic(member) });
  res.cookies.set("relay_member", member.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
