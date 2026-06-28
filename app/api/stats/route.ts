import { NextResponse } from "next/server";
import { stats } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/stats -> live counters for the impact strip.
export async function GET() {
  return NextResponse.json(await stats());
}
