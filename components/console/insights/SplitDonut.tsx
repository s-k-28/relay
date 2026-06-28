import type { CSSVars } from "./motion";

// Answered vs escalated, as a ring that draws itself in on mount. Built by hand
// from two stroked circles on a normalized path (pathLength 100), so the dash
// length reads directly as a percentage. Each segment is positioned by an SVG
// rotate() and revealed by the ins-draw keyframe growing its dash from 0.
//
// Signal carries the answered share (the good path), amber the escalated share.
export function SplitDonut({
  answered,
  escalated,
  resolved,
}: {
  answered: number;
  escalated: number;
  resolved: number;
}) {
  const total = answered + escalated;
  const aFrac = total ? answered / total : 0;
  const aPct = aFrac * 100;
  const ePct = total ? (escalated / total) * 100 : 0;
  const aRound = total ? Math.round(aPct) : 0;
  const eRound = total ? 100 - aRound : 0;

  const summary = total
    ? `Of ${total} agent replies, ${answered} answered (${aRound} percent) and ${escalated} escalated to a human (${eRound} percent).`
    : "No agent replies yet.";

  return (
    <figure
      aria-label="Answered versus escalated"
      className="card-grad anim-rise m-0 flex flex-col rounded-2xl border border-line p-7 sm:p-9"
      style={{ animationDelay: "0.05s" }}
    >
      <figcaption className="mb-5">
        <p className="eyebrow">Resolution</p>
        <h2 className="mt-3 font-serif text-[1.45rem] font-medium leading-tight tracking-[-0.01em] text-ink">
          Answered vs escalated
        </h2>
      </figcaption>

      <div className="flex flex-col items-center gap-7 sm:flex-row sm:gap-8">
        <div className="relative h-44 w-44 shrink-0">
          <svg viewBox="0 0 140 140" role="img" aria-label={summary} className="h-full w-full">
            <circle cx="70" cy="70" r="52" fill="none" stroke="var(--line-strong)" strokeWidth="13" />
            {total > 0 && (
              <>
                <g transform="rotate(-90 70 70)">
                  <circle
                    cx="70"
                    cy="70"
                    r="52"
                    fill="none"
                    stroke="var(--signal)"
                    strokeWidth="13"
                    strokeLinecap="butt"
                    pathLength={100}
                    className="ins-draw"
                    strokeDasharray={`${aPct} 100`}
                    style={{ "--ins-arc": aPct, animationDelay: "0.15s" } as CSSVars}
                  />
                </g>
                <g transform={`rotate(${-90 + aFrac * 360} 70 70)`}>
                  <circle
                    cx="70"
                    cy="70"
                    r="52"
                    fill="none"
                    stroke="var(--amber)"
                    strokeWidth="13"
                    strokeLinecap="butt"
                    pathLength={100}
                    className="ins-draw"
                    strokeDasharray={`${ePct} 100`}
                    style={{ "--ins-arc": ePct, animationDelay: "0.4s" } as CSSVars}
                  />
                </g>
              </>
            )}
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <span className="block font-mono text-[2rem] font-medium tabular-nums leading-none text-signal">
                {total ? `${aRound}%` : "--"}
              </span>
              <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
                {total ? "answered" : "no replies"}
              </span>
            </div>
          </div>
        </div>

        <dl className="w-full min-w-0 flex-1 space-y-3">
          <LegendRow color="var(--signal)" label="Answered by agents" count={answered} pct={aRound} show={total > 0} />
          <LegendRow color="var(--amber)" label="Escalated to humans" count={escalated} pct={eRound} show={total > 0} />
          {resolved > 0 && (
            <p className="border-t border-line pt-3 font-mono text-[11px] leading-relaxed text-faint">
              {resolved} later resolved by a human
            </p>
          )}
        </dl>
      </div>
    </figure>
  );
}

function LegendRow({
  color,
  label,
  count,
  pct,
  show,
}: {
  color: string;
  label: string;
  count: number;
  pct: number;
  show: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex min-w-0 items-center gap-2 text-[13px] text-muted">
        <span
          aria-hidden="true"
          className="inline-block h-2.5 w-2.5 shrink-0 rounded-[3px]"
          style={{ background: color } as CSSVars}
        />
        <span className="truncate">{label}</span>
      </dt>
      <dd className="shrink-0 font-mono text-[12px] tabular-nums text-ink">
        {count}
        <span className="ml-1.5 text-faint">{show ? `${pct}%` : "--"}</span>
      </dd>
    </div>
  );
}
