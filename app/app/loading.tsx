import { Wordmark } from "@/components/brand";

// Pulsing placeholder block. Decorative only, hidden from assistive tech.
function Bar({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`block animate-pulse rounded bg-line ${className}`} />;
}

// One agent row skeleton, matching AgentCard geometry (avatar + two text lines).
function AgentCardSkeleton({ me = false }: { me?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-line px-4 py-3.5 ${
        me ? "bg-panel/50" : "bg-card"
      }`}
    >
      <span aria-hidden="true" className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-line" />
      <div className="min-w-0 flex-1 space-y-2">
        <Bar className="h-3 w-32" />
        <Bar className="h-2.5 w-20 bg-line/70" />
      </div>
      <Bar className="h-2.5 w-12 bg-line/70" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="flex min-h-full flex-1 flex-col" role="status" aria-busy="true">
      <span className="sr-only">Loading the console.</span>

      {/* header bar, mirrors ConsoleHeader */}
      <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <Wordmark />
          <div className="flex items-center gap-4">
            <Bar className="hidden h-7 w-24 rounded-full bg-line/70 sm:block" />
            <Bar className="h-9 w-36 rounded-full bg-line/70" />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <div className="flex flex-col gap-6">
          {/* stat strip skeleton, four cells */}
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="card-grad flex flex-col gap-2.5 px-5 py-4">
                <Bar className="h-2.5 w-3/4 bg-line/70" />
                <Bar className="h-6 w-14" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
            {/* left directory column */}
            <section aria-label="Loading network directory" className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-faint">
                  Network
                </span>
                <Bar className="h-2.5 w-24 bg-line/70" />
              </div>

              <AgentCardSkeleton me />

              <div className="rule-fade my-1" />

              <div className="flex flex-col gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <AgentCardSkeleton key={i} />
                ))}
              </div>
            </section>

            {/* right composer column */}
            <section aria-label="Loading composer" className="lg:sticky lg:top-24 lg:self-start">
              <div className="flex min-h-[460px] flex-col overflow-hidden rounded-2xl border border-line bg-card">
                {/* composer header */}
                <div className="flex items-center gap-3 border-b border-line bg-panel/40 px-5 py-4">
                  <span
                    aria-hidden="true"
                    className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-line"
                  />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Bar className="h-3 w-40" />
                    <Bar className="h-2.5 w-24 bg-line/70" />
                  </div>
                  <Bar className="h-2.5 w-16 bg-line/70" />
                </div>

                {/* composer body */}
                <div className="flex-1 px-5 py-6">
                  <Bar className="h-2.5 w-32 bg-line/70" />
                  <Bar className="mt-3 h-3 w-3/4" />
                  <div className="mt-5 flex flex-col gap-2">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg border border-line bg-bg/40 px-3.5 py-3"
                      >
                        <Bar className="h-2.5 w-2/3 bg-line/70" />
                        <Bar className="h-3 w-3 rounded-full bg-line/70" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* composer input */}
                <div className="border-t border-line bg-panel/40 p-3">
                  <div className="flex items-end justify-between gap-2 rounded-xl border border-line-strong bg-bg/60 px-3 py-2.5">
                    <Bar className="h-4 w-2/3 bg-line/70" />
                    <span
                      aria-hidden="true"
                      className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-line"
                    />
                  </div>
                  <Bar className="mt-2 h-2.5 w-48 bg-line/70" />
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
