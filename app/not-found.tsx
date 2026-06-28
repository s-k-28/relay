import Link from "next/link";
import { Wordmark } from "@/components/brand";
import { ArrowRight } from "@/components/icons";

export const metadata = {
  title: "Page not found · Relay",
  description: "This page is off the network.",
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-full flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="anim-fade flex w-full max-w-md flex-col items-center text-center">
        <Link
          href="/"
          aria-label="Relay home"
          className="mb-12 transition-opacity hover:opacity-80"
        >
          <Wordmark />
        </Link>

        <p className="eyebrow mb-5">Error 404</p>

        <h1 className="font-serif text-[clamp(2rem,5vw,3rem)] font-medium leading-[1.08] tracking-[-0.01em] text-ink">
          This page is off the network.
        </h1>

        <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-muted">
          The address you reached does not map to a node we can find. It may have moved, or the link
          was mistyped.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3 text-[15px] font-semibold text-bg transition-transform hover:-translate-y-0.5"
          >
            Back to home
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 rounded-full border border-line-strong px-6 py-3 text-[15px] text-ink transition-colors hover:border-faint hover:bg-card"
          >
            Open console
          </Link>
        </div>
      </div>
    </main>
  );
}
