"use client";

import { useMemo } from "react";
import { useRelay } from "@/components/console/store";
import { InsightsKeyframes } from "@/components/console/insights/motion";
import { KpiRow } from "@/components/console/insights/KpiRow";
import { InterruptionsHero } from "@/components/console/insights/InterruptionsHero";
import { SplitDonut } from "@/components/console/insights/SplitDonut";
import { AgentLeaderboard, type LeaderRow } from "@/components/console/insights/AgentLeaderboard";
import { EmptyState } from "@/components/console/insights/EmptyState";

// INSIGHTS / analytics screen. Reads entirely from the shared store: store.stats
// is the source of truth for the headline figures, store.history (newest first)
// drives the leaderboard and acts as a fallback when stats has not loaded yet so
// a preview session still reads honestly. Every chart is hand-built SVG/CSS.
export default function InsightsPage() {
  const { stats, history, members, ready } = useRelay();

  // Online agents, straight off the membership list per the contract.
  const agentsOnline = useMemo(() => (members ?? []).filter((m) => m.online).length, [members]);

  // History-derived counts. Used as a fallback only when stats is null.
  const histAnswered = useMemo(
    () => (history ?? []).filter((r) => r.status === "answered").length,
    [history],
  );
  const histEscalated = useMemo(
    () => (history ?? []).filter((r) => r.status === "escalated").length,
    [history],
  );

  // Top five most-asked agents, grouped by member id, counting the answered and
  // escalated split so the bars can show both.
  const rows = useMemo<LeaderRow[]>(() => {
    const byAgent = new Map<string, LeaderRow>();
    for (const r of history ?? []) {
      const cur =
        byAgent.get(r.toMemberId) ??
        { id: r.toMemberId, name: r.toName, total: 0, answered: 0, escalated: 0 };
      cur.total += 1;
      if (r.status === "escalated") cur.escalated += 1;
      else cur.answered += 1;
      byAgent.set(r.toMemberId, cur);
    }
    return [...byAgent.values()].sort((a, b) => b.total - a.total).slice(0, 5);
  }, [history]);

  const histLen = history?.length ?? 0;
  const totalRequests = stats?.totalRequests ?? histLen;
  const answeredByAgent = stats?.answeredByAgent ?? histAnswered;
  const escalated = stats?.escalated ?? histEscalated;
  const resolved = stats?.resolved ?? 0;
  const interruptionsSaved = stats?.interruptionsSaved ?? histAnswered;

  const isEmpty = (!stats || stats.totalRequests === 0) && histLen === 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8 sm:py-10">
      <InsightsKeyframes />

      <header className="anim-fade flex flex-col gap-3">
        <p className="eyebrow">Insights</p>
        <h1 className="font-serif text-[clamp(1.9rem,4vw,2.7rem)] font-medium leading-tight tracking-[-0.01em] text-ink">
          What your network answered
        </h1>
        <p className="max-w-xl text-[15px] leading-relaxed text-muted">
          A live read on questions relayed, what agents resolved on their own, and the human
          interruptions that never had to happen.
        </p>
      </header>

      {!ready ? (
        <Loading />
      ) : isEmpty ? (
        <EmptyState />
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          <KpiRow
            totalRequests={totalRequests}
            answeredByAgent={answeredByAgent}
            escalated={escalated}
            agentsOnline={agentsOnline}
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <InterruptionsHero
              saved={interruptionsSaved}
              totalRequests={totalRequests}
              answeredByAgent={answeredByAgent}
            />
            <SplitDonut answered={answeredByAgent} escalated={escalated} resolved={resolved} />
          </div>

          {rows.length > 0 && <AgentLeaderboard rows={rows} />}
        </div>
      )}
    </div>
  );
}

function Loading() {
  return (
    <div className="mt-10 flex min-h-[40vh] items-center justify-center">
      <div className="flex items-center gap-3 text-faint">
        <span className="h-2 w-2 animate-pulse rounded-full bg-signal" />
        <span className="font-mono text-[12px] uppercase tracking-[0.16em]">Loading insights</span>
      </div>
    </div>
  );
}
