"use client";

import type { RelayRecord } from "@/components/console/store";
import { Avatar } from "@/components/console/Avatar";
import { StatusChip } from "./StatusChip";
import { FILTERS, relativeTime, type ThreadFilter } from "./util";

// Left column: a labelled segmented filter and the semantic list of relays.
export function HistoryList({
  records,
  counts,
  filter,
  onFilter,
  selectedId,
  onSelect,
  roleById,
}: {
  records: RelayRecord[];
  counts: Record<ThreadFilter, number>;
  filter: ThreadFilter;
  onFilter: (f: ThreadFilter) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  roleById: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* segmented filter, active state cross-fades between options */}
      <div
        role="group"
        aria-label="Filter threads by status"
        className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-panel/60 p-1"
      >
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              aria-pressed={active}
              onClick={() => onFilter(f.key)}
              className="relative flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[12px] font-medium"
            >
              <span
                aria-hidden="true"
                className={`absolute inset-0 rounded-lg border transition-opacity duration-300 ${
                  active ? "border-line-strong bg-raised opacity-100" : "border-transparent opacity-0"
                }`}
              />
              <span className={`relative z-10 transition-colors ${active ? "text-ink" : "text-faint"}`}>
                {f.label}
              </span>
              <span
                className={`relative z-10 font-mono text-[10px] tabular-nums transition-colors ${
                  active ? "text-signal-dim" : "text-ghost"
                }`}
              >
                {counts[f.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* history rows */}
      {records.length === 0 ? (
        <p className="rounded-xl border border-line bg-card px-4 py-6 text-center text-[13px] leading-relaxed text-faint">
          No {filter === "all" ? "" : `${filter} `}relays to show.
        </p>
      ) : (
        <ul aria-label="Relay history" className="flex flex-col gap-2">
          {records.map((r, i) => (
            <li key={r.requestId}>
              <HistoryRow
                record={r}
                role={roleById[r.toMemberId]}
                index={i}
                selected={r.requestId === selectedId}
                onSelect={onSelect}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function HistoryRow({
  record,
  role,
  index,
  selected,
  onSelect,
}: {
  record: RelayRecord;
  role?: string;
  index: number;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(record.requestId)}
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
      className={`thr-row-in group flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-200 ${
        selected
          ? "border-signal/55 bg-signal-deep/30"
          : "border-line bg-card hover:-translate-y-px hover:border-line-strong hover:bg-raised"
      }`}
    >
      <Avatar name={record.toName} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-[14px] font-medium text-ink">{record.toName}</p>
          <time className="shrink-0 font-mono text-[10px] text-ghost">{relativeTime(record.ts)}</time>
        </div>
        <p className="truncate text-[12px] text-faint">{role || "Agent"}</p>
        <p className="mt-1.5 truncate text-[13px] leading-relaxed text-muted">{record.question}</p>
        <div className="mt-2">
          <StatusChip status={record.status} />
        </div>
      </div>
    </button>
  );
}
