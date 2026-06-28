"use client";

import type { ThreadMessage } from "@/components/types";
import type { RelayRecord } from "@/components/console/store";
import { Avatar } from "@/components/console/Avatar";
import { ArrowRight, Hand, Node } from "@/components/icons";
import { StatusChip } from "./StatusChip";
import { clock } from "./util";

// The right hand thread reader. Purely presentational: the screen resolves the
// message list and hands it down, so the same component serves the desktop pane
// and the mobile drawer without fetching twice.
export function ThreadDetail({
  record,
  messages,
  role,
  variant,
  onClose,
}: {
  record: RelayRecord | null;
  messages: ThreadMessage[];
  role?: string | null;
  variant: "pane" | "drawer";
  onClose?: () => void;
}) {
  if (!record) {
    // Only reachable on the desktop pane when a filter matched nothing. The drawer
    // stays closed when there is no record to show.
    return (
      <div className="flex min-h-[480px] flex-col items-center justify-center rounded-2xl border border-line bg-card px-8 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full border border-line-strong bg-raised text-faint">
          <Node className="h-5 w-5" />
        </span>
        <p className="mt-4 text-[14px] text-muted">Select a thread to read it.</p>
        <p className="mt-1.5 max-w-[14rem] text-[12.5px] leading-relaxed text-faint">
          Pick any relay on the left to see the full exchange.
        </p>
      </div>
    );
  }

  const firstName = record.toName.split(" ")[0];
  const escalated = record.status === "escalated";
  const root =
    variant === "pane"
      ? "flex min-h-[480px] max-h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-2xl border border-line bg-card"
      : "flex min-h-0 flex-1 flex-col overflow-hidden";

  return (
    <div className={root}>
      {/* header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-line bg-panel/40 px-5 py-3.5">
        {variant === "drawer" && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Back to history"
            className="-ml-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
          </button>
        )}
        <Avatar name={record.toName} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-medium text-ink">{record.toName}</p>
          <p className="truncate text-[12px] text-faint">{role || "Agent"}</p>
        </div>
        <StatusChip status={record.status} />
      </div>

      {/* thread, re-keyed by relay so it re-animates on selection change */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div key={record.requestId} className="thr-detail-enter space-y-4 px-5 py-6">
          {messages.map((m, i) => (
            <Bubble key={`${m.ts}-${i}`} message={m} name={record.toName} index={i} />
          ))}
        </div>
      </div>

      {/* escalation note, mirrors the live composer's banner */}
      {escalated && (
        <div className="flex shrink-0 items-start gap-2.5 border-t border-amber/30 bg-amber-deep/40 px-5 py-3">
          <Hand className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
          <p className="text-[12.5px] leading-relaxed text-amber">
            Escalated to {firstName}. The agent stepped back and looped in the human with the full
            thread attached.
          </p>
        </div>
      )}
    </div>
  );
}

// Chat bubble, copied from the Composer so history reads in the same visual language:
// the requester sits right on a raised bubble, the agent and human sit left with an
// avatar, and the human (escalation) bubble carries an amber tint.
function Bubble({
  message,
  name,
  index,
}: {
  message: ThreadMessage;
  name: string;
  index: number;
}) {
  const delay = { animationDelay: `${Math.min(index * 70, 350)}ms` };

  if (message.role === "requester") {
    return (
      <div className="thr-bubble-in flex justify-end" style={delay}>
        <div className="max-w-[78%]">
          <div className="rounded-2xl rounded-br-sm border border-line-strong bg-raised px-4 py-2.5 text-[14.5px] leading-relaxed text-ink">
            {message.text}
          </div>
          <p className="mt-1 pr-1 text-right font-mono text-[10px] text-ghost">
            You · {clock(message.ts)}
          </p>
        </div>
      </div>
    );
  }

  const human = message.role === "human";
  return (
    <div className="thr-bubble-in flex items-start gap-3" style={delay}>
      <Avatar name={name} size="sm" />
      <div className="max-w-[82%]">
        <div
          className={`rounded-2xl rounded-tl-sm border px-4 py-3 text-[14.5px] leading-relaxed ${
            human ? "border-amber/35 bg-amber-deep/30 text-ink" : "border-line bg-raised text-ink"
          }`}
        >
          {message.text}
        </div>
        <p className="mt-1 pl-1 font-mono text-[10px] text-ghost">
          {human ? `${name.split(" ")[0]} (human)` : `${name.split(" ")[0]}'s agent`} ·{" "}
          {clock(message.ts)}
        </p>
      </div>
    </div>
  );
}
