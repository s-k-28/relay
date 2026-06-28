// Shared helpers for the Threads (history) screen. Pure functions and constants only.

import type { ThreadMessage } from "@/components/types";
import type { RelayRecord } from "@/components/console/store";

export type ThreadFilter = "all" | "answered" | "escalated";

// Segmented control options, in display order.
export const FILTERS: { key: ThreadFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "answered", label: "Answered" },
  { key: "escalated", label: "Escalated" },
];

// HH:MM, matches the live Composer's clock so bubbles read consistently.
export function clock(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Calm relative label for history rows, with a date fallback past a week.
export function relativeTime(ts: number, now: number = Date.now()): string {
  const secs = Math.max(0, Math.floor((now - ts) / 1000));
  if (secs < 45) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" });
}

// When a relay has no stored or fetched message list, rebuild a faithful two turn
// thread from the record we already hold: the question, then the answer or the
// escalation note. Keeps the detail pane truthful without a network round trip.
export function synthesizeThread(record: RelayRecord): ThreadMessage[] {
  return [
    { requestId: record.requestId, role: "requester", text: record.question, ts: record.ts },
    {
      requestId: record.requestId,
      role: record.status === "escalated" ? "human" : "agent",
      text: record.answer,
      ts: record.ts + 1,
    },
  ];
}
