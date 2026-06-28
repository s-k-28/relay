"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api, ApiError, isBackendLive } from "../api";
import type { Member, Stats, ThreadMessage } from "../types";
import { Wordmark, SignalDot } from "../brand";
import { Avatar } from "./Avatar";
import { AgentCard } from "./AgentCard";
import { ConnectPanel } from "./ConnectPanel";
import { Composer } from "./Composer";
import { StatStrip } from "./StatStrip";

export function Console() {
  const [members, setMembers] = useState<Member[]>([]);
  const [meId, setMeId] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [ready, setReady] = useState(false);
  const [live, setLive] = useState(false);

  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Record<string, ThreadMessage[]>>({});
  const [thinking, setThinking] = useState(false);

  const refreshStats = useCallback(async () => {
    try {
      setStats(await api.stats());
    } catch {
      /* stats are non-critical, leave the prior value */
    }
  }, []);

  const loadNetwork = useCallback(async () => {
    const net = await api.network();
    setMembers(net.members);
    setMeId(net.meId);
    setLive(isBackendLive());
    return net;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await loadNetwork();
        await refreshStats();
      } finally {
        setReady(true);
      }
    })();
  }, [loadNetwork, refreshStats]);

  async function handleConnect(name: string, role: string, aicooKey: string) {
    setConnecting(true);
    setConnectError(null);
    try {
      await api.connect(name, role, aicooKey);
      await loadNetwork();
      await refreshStats();
    } catch (err) {
      setConnectError(err instanceof ApiError ? err.code : "connect_failed");
    } finally {
      setConnecting(false);
    }
  }

  async function handleSend(question: string) {
    if (!selectedId || thinking) return;
    const target = selectedId;
    const askedAt = Date.now();
    const requesterMsg: ThreadMessage = { requestId: "local", role: "requester", text: question, ts: askedAt };
    setThreads((t) => ({ ...t, [target]: [...(t[target] ?? []), requesterMsg] }));
    setThinking(true);
    try {
      const res = await api.relay(target, question);
      const reply: ThreadMessage = {
        requestId: res.requestId,
        role: res.status === "escalated" ? "human" : "agent",
        text: res.answer,
        ts: Date.now(),
      };
      setThreads((t) => ({ ...t, [target]: [...(t[target] ?? []), reply] }));
      await refreshStats();
    } catch (err) {
      const note: ThreadMessage = {
        requestId: "error",
        role: "agent",
        text:
          err instanceof ApiError && err.code === "agent_unreachable"
            ? "I could not reach that agent just now. Give it a moment and try again."
            : "Something interrupted the relay. Try sending that again.",
        ts: Date.now(),
      };
      setThreads((t) => ({ ...t, [target]: [...(t[target] ?? []), note] }));
    } finally {
      setThinking(false);
    }
  }

  const me = useMemo(() => members.find((m) => m.id === meId) ?? null, [members, meId]);
  const others = useMemo(() => members.filter((m) => m.id !== meId), [members, meId]);
  const selected = useMemo(() => members.find((m) => m.id === selectedId) ?? null, [members, selectedId]);
  const selectedThread = selectedId ? threads[selectedId] ?? [] : [];
  const onlineCount = others.filter((m) => m.online).length;
  const lastMsg = selectedThread[selectedThread.length - 1];
  const escalated = lastMsg?.role === "human";

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex items-center gap-3 text-faint">
          <span className="h-2 w-2 animate-pulse rounded-full bg-signal" />
          <span className="font-mono text-[12px] uppercase tracking-[0.16em]">Loading network</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <ConsoleHeader me={me} live={live} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {!meId ? (
          <div className="anim-rise py-6">
            <ConnectPanel onConnect={handleConnect} submitting={connecting} error={connectError} />
          </div>
        ) : (
          <div className="anim-fade flex flex-col gap-6">
            <StatStrip stats={stats} loading={!stats} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
              {/* network directory */}
              <section aria-label="Network directory" className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-mono text-[12px] uppercase tracking-[0.16em] text-faint">
                    Network
                  </h2>
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
                      You are the first node here. Share Relay with a teammate so there is someone to
                      ask.
                    </p>
                  ) : (
                    others.map((m) => (
                      <AgentCard
                        key={m.id}
                        member={m}
                        isMe={false}
                        selected={m.id === selectedId}
                        onSelect={setSelectedId}
                      />
                    ))
                  )}
                </div>
              </section>

              {/* composer */}
              <section aria-label="Relay a question" className="lg:sticky lg:top-24 lg:self-start">
                <Composer
                  selected={selected}
                  messages={selectedThread}
                  thinking={thinking}
                  escalated={escalated}
                  onSend={handleSend}
                />
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ConsoleHeader({ me, live }: { me: Member | null; live: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="transition-opacity hover:opacity-80" aria-label="Relay home">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-4">
          <span
            title={live ? "Connected to live Relay routes." : "Routes are not deployed yet, showing preview data."}
            className="hidden items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] sm:flex"
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: live ? "var(--online)" : "var(--ghost)" }}
            />
            <span className="text-faint">{live ? "Live data" : "Preview data"}</span>
          </span>
          {me && (
            <span className="flex items-center gap-2.5 rounded-full border border-line bg-card py-1 pl-1.5 pr-3.5">
              <Avatar name={me.name} you size="sm" />
              <span className="flex flex-col leading-tight">
                <span className="text-[12.5px] font-medium text-ink">{me.name}</span>
                <span className="font-mono text-[10px] text-faint">{me.role}</span>
              </span>
              <SignalDot online={me.online} className="ml-0.5" />
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
