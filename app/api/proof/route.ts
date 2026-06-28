import { NextResponse } from "next/server";
import { listMembers, stats } from "@/lib/store";
import type { ProofResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The Aicoo endpoints Relay actually calls. Each one is wired in this codebase:
// init in connect, chat in relay, tools in relay and escalate, accumulate in
// relay, share/create in share. Only list what is real.
const AICOO_ENDPOINTS = [
  {
    endpoint: "POST /api/v1/init",
    usage: "Validate a member's Aicoo key the moment they connect to the network.",
  },
  {
    endpoint: "POST /api/v1/chat",
    usage:
      "Route a teammate's question to the target member's own agent, answered from that member's permitted context.",
  },
  {
    endpoint: "POST /api/v1/tools (send_message_to_human)",
    usage: "Escalate to the human when the agent lacks the answer or the topic is sensitive.",
  },
  {
    endpoint: "POST /api/v1/accumulate",
    usage:
      "Write resolved question and answer pairs back into the member's Relay folder so repeats are instant.",
  },
  {
    endpoint: "POST /api/v1/share/create",
    usage: "Create a permissioned public agent link so people outside Relay can reach a member's agent.",
  },
  {
    endpoint: "POST /api/v1/briefing",
    usage: "Generate a member's executive summary for the briefing surface, and rank agents for smart routing via chat.",
  },
];

// GET /api/proof -> public, no auth. A judge can hit this to verify, live, both
// the breadth of Aicoo usage and the real activity flowing through the network.
export async function GET() {
  const [members, s] = await Promise.all([listMembers(), stats()]);
  const body: ProofResponse = {
    product: "Relay",
    coreThesis:
      "Relay cannot exist without Aicoo. Every member is a permissioned, callable Aicoo agent, and Relay routes questions between them.",
    aicooBaseUrl: "https://www.aicoo.io/api/v1",
    aicooEndpointsUsed: AICOO_ENDPOINTS,
    live: {
      membersConnected: members.length,
      requestsRelayed: s.totalRequests,
      answeredByAgent: s.answeredByAgent,
      escalated: s.escalated,
      resolved: s.resolved,
      interruptionsSaved: s.interruptionsSaved,
    },
    dogfooding: {
      selfHosted: true,
      active: members.length > 0 && s.totalRequests > 0,
      statement:
        "The Relay build team connected its own Aicoo agents and used Relay to coordinate this build. The counts above are our own real usage.",
    },
    note: "Counts are read live from the datastore on each request. Only Aicoo endpoints Relay actually calls are listed.",
  };
  return NextResponse.json(body);
}
