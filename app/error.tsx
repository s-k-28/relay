"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/brand";
import { ArrowRight } from "@/components/icons";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the failure for diagnostics without showing the stack to the user.
    console.error(error);
  }, [error]);

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

        <p className="eyebrow mb-5">Something went wrong</p>

        <h1 className="font-serif text-[clamp(2rem,5vw,3rem)] font-medium leading-[1.08] tracking-[-0.01em] text-ink">
          Something interrupted the relay.
        </h1>

        <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-muted">
          The page stopped before it finished loading. Your work is safe, and nothing was lost. Most
          of the time a second attempt clears it.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="group inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3 text-[15px] font-semibold text-bg transition-transform hover:-translate-y-0.5"
          >
            Try again
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-line-strong px-6 py-3 text-[15px] text-ink transition-colors hover:border-faint hover:bg-card"
          >
            Back to home
          </Link>
        </div>

        {error.digest && (
          <p className="mt-7 font-mono text-[11px] tracking-[0.08em] text-ghost">
            Reference {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
