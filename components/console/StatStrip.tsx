"use client";

import type { Stats } from "../types";

const ITEMS: { key: keyof Stats; label: string; signal?: boolean }[] = [
  { key: "totalRequests", label: "Questions relayed" },
  { key: "answeredByAgent", label: "Answered by agents" },
  { key: "escalated", label: "Escalated to humans" },
  { key: "interruptionsSaved", label: "Interruptions saved", signal: true },
];

export function StatStrip({ stats, loading }: { stats: Stats | null; loading: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-4">
      {ITEMS.map((it) => {
        const value = stats ? stats[it.key] : 0;
        return (
          <div key={it.key} className="card-grad flex flex-col gap-1.5 px-5 py-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
              {it.label}
            </span>
            <span
              className={`font-mono text-[26px] font-medium tabular-nums leading-none transition-colors ${
                it.signal ? "text-signal" : "text-ink"
              } ${loading && !stats ? "opacity-40" : ""}`}
            >
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
