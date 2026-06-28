import { NumberTicker } from "../NumberTicker";
import type { CSSVars } from "./motion";

type Tone = "ink" | "signal" | "amber";

const TONE: Record<Tone, string> = {
  ink: "text-ink",
  signal: "text-signal",
  amber: "text-amber",
};

// Four count-up KPIs, staggered in on mount. Mirrors the StatStrip language
// (gap-px over a line fill, card-grad cells) but tuned for the analytics screen:
// answered reads in signal, escalated in amber, and "agents online" carries a
// live dot. Figures are tabular so the count-up does not jitter the layout.
export function KpiRow({
  totalRequests,
  answeredByAgent,
  escalated,
  agentsOnline,
}: {
  totalRequests: number;
  answeredByAgent: number;
  escalated: number;
  agentsOnline: number;
}) {
  const items: { label: string; value: number; tone: Tone; live?: boolean }[] = [
    { label: "Questions relayed", value: totalRequests, tone: "ink" },
    { label: "Answered by agents", value: answeredByAgent, tone: "signal" },
    { label: "Escalated to humans", value: escalated, tone: "amber" },
    { label: "Agents online", value: agentsOnline, tone: "ink", live: true },
  ];

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-4">
      {items.map((it, i) => (
        <div
          key={it.label}
          className="ins-rise card-grad flex flex-col gap-2 px-5 py-4"
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
            {it.live && (
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--online)" } as CSSVars}
              />
            )}
            {it.label}
          </span>
          <NumberTicker
            value={it.value}
            className={`font-mono text-[26px] font-medium tabular-nums leading-none ${TONE[it.tone]}`}
          />
        </div>
      ))}
    </div>
  );
}
