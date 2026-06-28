import { Avatar } from "../Avatar";
import type { CSSVars } from "./motion";

export interface LeaderRow {
  id: string;
  name: string;
  total: number;
  answered: number;
  escalated: number;
}

// Most asked agents this session, top five, as horizontal bars that grow in on
// mount. Each bar's full length is the agent's share of the busiest agent, and
// inside it the answered/escalated split is drawn in signal and amber so the bar
// doubles as a resolution read. Counts stay visible as text, so the data is
// present even before (or without) the grow animation.
export function AgentLeaderboard({ rows }: { rows: LeaderRow[] }) {
  const max = rows[0]?.total ?? 1;

  return (
    <section
      aria-label="Most asked agents"
      className="card-grad anim-rise rounded-2xl border border-line p-6 sm:p-7"
      style={{ animationDelay: "0.1s" }}
    >
      <header className="flex items-baseline justify-between gap-4">
        <div>
          <p className="eyebrow">Demand</p>
          <h2 className="mt-3 font-serif text-[1.45rem] font-medium leading-tight tracking-[-0.01em] text-ink">
            Most asked agents
          </h2>
        </div>
        <span className="hidden shrink-0 font-mono text-[11px] text-ghost sm:block">
          relays this session
        </span>
      </header>

      <ol className="mt-6 flex flex-col gap-4">
        {rows.map((r, i) => {
          const widthPct = `${max ? (r.total / max) * 100 : 0}%`;
          const aShare = r.total ? (r.answered / r.total) * 100 : 0;
          const eShare = r.total ? (r.escalated / r.total) * 100 : 0;
          return (
            <li key={r.id} className="flex items-center gap-3">
              <Avatar name={r.name} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-[13.5px] font-medium text-ink">{r.name}</span>
                  <span className="shrink-0 font-mono text-[12px] tabular-nums text-faint">
                    {r.total}
                  </span>
                </div>
                <div
                  className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-raised"
                  role="img"
                  aria-label={`${r.name}: ${r.total} relayed, ${r.answered} answered, ${r.escalated} escalated`}
                >
                  <div
                    className="ins-grow flex h-full overflow-hidden rounded-full"
                    style={{ "--ins-w": widthPct, animationDelay: `${0.15 + i * 0.08}s` } as CSSVars}
                  >
                    <span className="h-full bg-signal-dim" style={{ width: `${aShare}%` }} />
                    <span className="h-full bg-amber" style={{ width: `${eShare}%` }} />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex items-center gap-5 border-t border-line pt-4">
        <Swatch color="var(--signal-dim)" label="Answered" />
        <Swatch color="var(--amber)" label="Escalated" />
      </div>
    </section>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
      <span
        aria-hidden="true"
        className="inline-block h-2 w-2 rounded-[3px]"
        style={{ background: color } as CSSVars}
      />
      {label}
    </span>
  );
}
