"use client";

// The Network screen body. Gating and the shell chrome now live in app/app/layout,
// so this is purely the network view: a compact live band, the stat row, the
// directory, and the composer, all reading and writing the shared store.
//
// Per-member conversation is reconstructed from the store: history maps each request
// to its member, and threadsById holds the message pair. The in-flight question and
// any send error are local view state layered on top, so the store only ever holds
// completed exchanges that the Threads and Insights screens can trust.

import { useMemo, useState } from "react";
import type { ThreadMessage } from "@/components/types";
import { ApiError } from "@/components/api";
import { NetworkGraph } from "@/components/NetworkGraph";
import { useRelay } from "./store";
import { AgentCard } from "./AgentCard";
import { Composer } from "./Composer";
import { StatStrip } from "./StatStrip";

export function NetworkScreen() {
  const { members, meId, stats, history, threadsById, selectedId, thinking, select, relay } = useRelay();

  // The question currently in flight and the last send error. Both are cleared as the
  // store settles, so they never double up with the persisted thread.
  const [pending, setPending] = useState<ThreadMessage | null>(null);
  const [errorNote, setErrorNote] = useState<ThreadMessage | null>(null);

  const me = useMemo(() => (meId ? members.find((m) => m.id === meId) ?? null : null), [members, meId]);
  const others = useMemo(() => members.filter((m) => m.id !== meId), [members, meId]);
  const selected = useMemo(() => members.find((m) => m.id === selectedId) ?? null, [members, selectedId]);

  // Reconstruct the thread with the selected member from the request-keyed store.
  // history is newest first, so reverse the matches to read oldest to newest.
  const baseThread = useMemo<ThreadMessage[]>(() => {
    if (!selectedId) return [];
    return history
      .filter((r) => r.toMemberId === selectedId)
      .slice()
      .reverse()
      .flatMap((r) => threadsById[r.requestId] ?? []);
  }, [history, threadsById, selectedId]);

  const messages = useMemo<ThreadMessage[]>(() => {
    if (!pending && !errorNote) return baseThread;
    const extra: ThreadMessage[] = [];
    if (pending) extra.push(pending);
    if (errorNote) extra.push(errorNote);
    return [...baseThread, ...extra];
  }, [baseThread, pending, errorNote]);

  const onlineCount = others.filter((m) => m.online).length;
  const last = baseThread[baseThread.length - 1];
  const escalated = !thinking && !pending && last?.role === "human";

  function handleSelect(id: string) {
    select(id);
    setPending(null);
    setErrorNote(null);
  }

  async function handleSend(question: string) {
    if (!selectedId || thinking) return;
    setErrorNote(null);
    setPending({ requestId: "pending", role: "requester", text: question, ts: Date.now() });
    try {
      await relay(selectedId, question);
    } catch (err) {
      setErrorNote({
        requestId: "error",
        role: "agent",
        text:
          err instanceof ApiError && err.code === "agent_unreachable"
            ? "I could not reach that agent just now. Give it a moment and try again."
            : "Something interrupted the relay. Try sending that again.",
        ts: Date.now(),
      });
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-7 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-6">
        {/* live band */}
        <section
          className="anim-rise relative overflow-hidden rounded-2xl border border-line bg-card"
          style={{ animationDelay: "0ms" }}
        >
          <div className="aurora" aria-hidden="true" />
          <div className="relative flex items-center justify-between gap-6 px-6 py-6 sm:px-8">
            <div className="min-w-0">
              <p className="eyebrow mb-3">Live network</p>
              <h1 className="font-serif text-[clamp(1.6rem,3vw,2.1rem)] font-medium leading-tight tracking-[-0.01em] text-ink">
                Ask anyone, stay heads down.
              </h1>
              <p className="mt-2.5 max-w-md text-[14px] leading-relaxed text-muted">
                Pick a teammate and their agent answers from permitted context. A human is pulled in
                only when the agent genuinely cannot help.
              </p>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
                {others.length} agents · {onlineCount} online
              </p>
            </div>
            <div className="hidden h-[170px] w-[300px] shrink-0 items-center justify-center md:flex">
              <NetworkGraph className="h-full w-full opacity-90" />
            </div>
          </div>
        </section>

        {/* compact stat row */}
        <div className="anim-rise" style={{ animationDelay: "80ms" }}>
          <StatStrip stats={stats} loading={!stats} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
          {/* directory */}
          <section
            aria-label="Network directory"
            className="anim-rise flex flex-col gap-3"
            style={{ animationDelay: "160ms" }}
          >
            <div className="flex items-baseline justify-between">
              <h2 className="font-mono text-[12px] uppercase tracking-[0.16em] text-faint">Network</h2>
              <span className="font-mono text-[11px] text-ghost">
                {others.length} agents · {onlineCount} online
              </span>
            </div>

            {me && (
              <div className="flex flex-col gap-2">
                <AgentCard member={me} isMe selected={false} onSelect={() => {}} />
              </div>
            )}

            <div className="rule-fade my-1" />

            <div className="flex flex-col gap-2">
              {others.length === 0 ? (
                <p className="rounded-xl border border-line bg-card px-4 py-6 text-center text-[13px] leading-relaxed text-faint">
                  You are the first node here. Share Relay with a teammate so there is someone to ask.
                </p>
              ) : (
                others.map((m) => (
                  <AgentCard
                    key={m.id}
                    member={m}
                    isMe={false}
                    selected={m.id === selectedId}
                    onSelect={handleSelect}
                  />
                ))
              )}
            </div>
          </section>

          {/* composer */}
          <section
            aria-label="Relay a question"
            className="anim-rise lg:sticky lg:top-[88px] lg:self-start"
            style={{ animationDelay: "240ms" }}
          >
            <Composer
              selected={selected}
              messages={messages}
              thinking={thinking}
              escalated={escalated}
              onSend={handleSend}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
