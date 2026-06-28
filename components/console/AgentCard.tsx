"use client";

import type { Member } from "../types";
import { Avatar } from "./Avatar";
import { SignalDot } from "../brand";

export function AgentCard({
  member,
  isMe,
  selected,
  onSelect,
}: {
  member: Member;
  isMe: boolean;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const firstName = member.name.split(" ")[0];

  if (isMe) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-line bg-panel/50 px-4 py-3.5">
        <Avatar name={member.name} you size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-medium text-ink">{member.name}</p>
          <p className="truncate text-[12px] text-faint">{member.role}</p>
        </div>
        <span className="rounded-full border border-signal/30 bg-signal-deep px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-signal-dim">
          You
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(member.id)}
      aria-pressed={selected}
      className={`group flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all ${
        selected
          ? "border-signal/55 bg-signal-deep/40"
          : "border-line bg-card hover:border-line-strong hover:bg-raised"
      }`}
    >
      <Avatar name={member.name} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium text-ink">{member.name}</p>
        <p className="truncate text-[12px] text-faint">{member.role}</p>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <span className="flex items-center gap-1.5">
          <SignalDot online={member.online} />
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
            {member.online ? "online" : "away"}
          </span>
        </span>
        <span
          className={`font-mono text-[10px] tracking-[0.08em] transition-colors ${
            selected ? "text-signal-dim" : "text-ghost group-hover:text-faint"
          }`}
        >
          {selected ? "selected" : `ask ${firstName}`}
        </span>
      </div>
    </button>
  );
}
