import { NumberTicker } from "../NumberTicker";
import { RelayMark } from "../../brand";

// The hero metric. Interruptions saved is the number that matters most here, so
// it gets the largest type on the screen, the signal color, and a plain-language
// line under it. A faint brand mark sits behind the figure for depth, never
// competing with it.
export function InterruptionsHero({
  saved,
  totalRequests,
  answeredByAgent,
}: {
  saved: number;
  totalRequests: number;
  answeredByAgent: number;
}) {
  return (
    <section
      aria-label="Interruptions saved"
      className="card-grad anim-rise relative overflow-hidden rounded-2xl border border-line p-7 sm:p-9"
    >
      <RelayMark
        aria-hidden="true"
        className="pointer-events-none absolute -right-7 -top-7 h-36 w-36 text-signal opacity-[0.06]"
      />
      <div className="relative z-10">
        <p className="eyebrow">Impact</p>
        <h2 className="mt-3 font-serif text-[1.45rem] font-medium leading-tight tracking-[-0.01em] text-ink">
          Interruptions saved
        </h2>
        <NumberTicker
          value={saved}
          className="mt-2 block font-mono text-[clamp(3.2rem,9vw,5.2rem)] font-medium leading-none tabular-nums text-signal"
        />
        <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted">
          Every answer an agent returned is a question a teammate did not have to stop and field.
        </p>
        <p className="mt-3 font-mono text-[12px] tabular-nums text-faint">
          {answeredByAgent} answered without a human · {totalRequests} relayed in total
        </p>
      </div>
    </section>
  );
}
