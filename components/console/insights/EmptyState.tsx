import Link from "next/link";
import { RelayMark } from "../../brand";
import { ArrowRight } from "../../icons";

// Shown when nothing has been relayed yet. No fabricated figures, no placeholder
// charts. A calm invitation to relay the first question, which is what fills this
// screen with real data.
export function EmptyState() {
  return (
    <div className="anim-rise mx-auto mt-10 flex max-w-md flex-col items-center rounded-2xl border border-line card-grad px-8 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full border border-line-strong bg-raised">
        <RelayMark className="h-7 w-7 text-signal" />
      </span>
      <h2 className="mt-6 font-serif text-[1.6rem] font-medium leading-tight tracking-[-0.01em] text-ink">
        No relays yet
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">
        Ask a teammate&apos;s agent a question and this screen fills in: what the network answered,
        what it escalated, and the interruptions it saved along the way.
      </p>
      <Link
        href="/app"
        className="shine group mt-7 inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3 text-[15px] font-semibold text-bg transition-transform hover:-translate-y-0.5"
      >
        Relay your first question
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
