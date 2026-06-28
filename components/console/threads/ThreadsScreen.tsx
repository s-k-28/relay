"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRelay, type RelayRecord } from "@/components/console/store";
import { api } from "@/components/api";
import type { ThreadMessage } from "@/components/types";
import { NumberTicker } from "@/components/console/NumberTicker";
import { RelayMark } from "@/components/brand";
import { ArrowUpRight } from "@/components/icons";
import { HistoryList } from "./HistoryList";
import { ThreadDetail } from "./ThreadDetail";
import { synthesizeThread, type ThreadFilter } from "./util";

// Local, thr- prefixed keyframes so nothing collides with globals.css. Reduced
// motion is already neutralised globally by the prefers-reduced-motion block there.
const MOTION_CSS = `
@keyframes thr-row-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes thr-detail-in { from { opacity: 0; transform: translateY(7px); } to { opacity: 1; transform: none; } }
@keyframes thr-bubble-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes thr-chip-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.thr-row-in { animation: thr-row-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
.thr-bubble-in { animation: thr-bubble-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }
.thr-detail-enter { animation: thr-detail-in 0.42s cubic-bezier(0.22, 1, 0.36, 1) both; }
`;

// Resolve the message list for the open relay: prefer what the store already holds,
// otherwise read the thread once from the read-only API, and fall back to a faithful
// synthesis from the record so the pane is never blank.
function useThreadMessages(record: RelayRecord | null, stored: ThreadMessage[] | undefined) {
  const haveStored = !!(stored && stored.length);
  const reqId = record?.requestId ?? null;
  // Fetched messages are tagged with the relay they belong to, so a stale result
  // from a previous selection is ignored at read time rather than reset in the effect.
  const [fetched, setFetched] = useState<{ id: string; messages: ThreadMessage[] } | null>(null);

  useEffect(() => {
    if (!reqId || haveStored) return;
    let alive = true;
    api
      .thread(reqId)
      .then((res) => {
        if (alive && res.messages?.length) setFetched({ id: reqId, messages: res.messages });
      })
      .catch(() => {
        /* keep the synthesized fallback */
      });
    return () => {
      alive = false;
    };
  }, [reqId, haveStored]);

  return useMemo<ThreadMessage[]>(() => {
    if (!record) return [];
    if (haveStored) return stored!;
    if (fetched && fetched.id === record.requestId) return fetched.messages;
    return synthesizeThread(record);
  }, [record, haveStored, stored, fetched]);
}

export function ThreadsScreen() {
  const { history, members, threadsById, ready, loadNetwork } = useRelay();

  const [filter, setFilter] = useState<ThreadFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Warm the store once if we landed here directly (deep link) before the shell
  // loaded it. Idempotent and only fires while the store reports it is not ready.
  const kicked = useRef(false);
  useEffect(() => {
    if (!ready && !kicked.current) {
      kicked.current = true;
      void loadNetwork();
    }
  }, [ready, loadNetwork]);

  const roleById = useMemo(
    () => Object.fromEntries(members.map((m) => [m.id, m.role])) as Record<string, string>,
    [members],
  );

  const counts = useMemo<Record<ThreadFilter, number>>(
    () => ({
      all: history.length,
      answered: history.filter((r) => r.status === "answered").length,
      escalated: history.filter((r) => r.status === "escalated").length,
    }),
    [history],
  );

  const filtered = useMemo(
    () => (filter === "all" ? history : history.filter((r) => r.status === filter)),
    [history, filter],
  );

  // Resolve the active relay during render rather than in an effect: keep the user's
  // explicit pick while it stays visible, otherwise default to the newest row, and
  // fall to null when the active filter matches nothing.
  const activeId = useMemo(() => {
    if (filtered.length === 0) return null;
    if (selectedId && filtered.some((r) => r.requestId === selectedId)) return selectedId;
    return filtered[0].requestId;
  }, [filtered, selectedId]);

  const selectedRecord = useMemo(
    () => history.find((r) => r.requestId === activeId) ?? null,
    [history, activeId],
  );
  const selectedRole = selectedRecord ? roleById[selectedRecord.toMemberId] ?? null : null;
  const messages = useThreadMessages(selectedRecord, activeId ? threadsById[activeId] : undefined);

  function openRow(id: string) {
    setSelectedId(id);
    setDrawerOpen(true);
  }
  function closeDrawer() {
    setDrawerOpen(false);
  }

  const drawerShown = drawerOpen && !!selectedRecord;

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
      <style>{MOTION_CSS}</style>

      <header className="mb-7">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">History</p>
            <h1 className="mt-2 font-serif text-[30px] leading-tight text-ink">Threads</h1>
          </div>
          {history.length > 0 && (
            <p className="hidden shrink-0 items-baseline gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-faint sm:flex">
              <NumberTicker value={history.length} className="text-[15px] tabular-nums text-ink" />
              relays
            </p>
          )}
        </div>
        <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-muted">
          Every relay you have sent, answered by an agent or escalated to a human. Open one to read
          the full thread.
        </p>
      </header>

      {!ready ? (
        <Loading />
      ) : history.length === 0 ? (
        <Empty />
      ) : (
        <div className="anim-fade grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
          <section aria-label="Relay history">
            <HistoryList
              records={filtered}
              counts={counts}
              filter={filter}
              onFilter={setFilter}
              selectedId={activeId}
              onSelect={openRow}
              roleById={roleById}
            />
          </section>

          <section aria-label="Thread detail" className="hidden lg:block">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <ThreadDetail
                variant="pane"
                record={selectedRecord}
                role={selectedRole}
                messages={messages}
              />
            </div>
          </section>
        </div>
      )}

      {/* mobile drawer, slides up from the bottom when a row is opened */}
      {ready && history.length > 0 && (
        <MobileDrawer
          open={drawerShown}
          record={selectedRecord}
          role={selectedRole}
          messages={messages}
          onClose={closeDrawer}
        />
      )}
    </div>
  );
}

function MobileDrawer({
  open,
  record,
  role,
  messages,
  onClose,
}: {
  open: boolean;
  record: RelayRecord | null;
  role: string | null;
  messages: ThreadMessage[];
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Close thread"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-bg/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Thread detail"
        inert={!open || undefined}
        className={`fixed inset-x-0 bottom-0 z-40 flex max-h-[88vh] flex-col overflow-hidden rounded-t-2xl border-t border-line bg-card shadow-[0_-24px_60px_-24px_rgba(0,0,0,0.75)] transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <span
          aria-hidden="true"
          className="mx-auto mt-2.5 h-1 w-9 shrink-0 rounded-full bg-line-strong"
        />
        <ThreadDetail
          variant="drawer"
          record={record}
          role={role}
          messages={messages}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center" role="status" aria-busy="true">
      <div className="flex items-center gap-3 text-faint">
        <span className="h-2 w-2 animate-pulse rounded-full bg-signal" />
        <span className="font-mono text-[12px] uppercase tracking-[0.16em]">Loading history</span>
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div className="anim-rise mx-auto flex min-h-[420px] max-w-md flex-col items-center justify-center rounded-2xl border border-line bg-card px-8 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full border border-line-strong bg-raised text-signal-dim">
        <RelayMark className="h-6 w-6" />
      </span>
      <h2 className="mt-5 font-serif text-[22px] leading-tight text-ink">No relays yet.</h2>
      <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-muted">
        Every question you send to an agent lands here, with the full thread kept behind each
        answer.
      </p>
      <Link
        href="/app"
        className="group mt-6 inline-flex items-center gap-2 rounded-full border border-line-strong bg-raised px-4 py-2 text-[13px] text-ink transition-colors hover:border-signal/50"
      >
        Ask an agent
        <ArrowUpRight className="h-3.5 w-3.5 text-signal-dim transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
