"use client";

// The shared client store for the authenticated product shell. Every screen
// (Network, Threads, Insights, Settings) reads the same snapshot through useRelay,
// so a selection, a relayed answer, or a stat update is visible everywhere at once
// and survives a reload. It is a plain module store wired to React through
// useSyncExternalStore: getSnapshot returns one cached object that only changes
// when the state actually changes, which keeps render-time reads stable and avoids
// the infinite loop you get from returning a fresh object on every call.
//
// Data comes from @/components/api, which tries the real /api routes first and
// falls back to an in-memory mock when the backend is absent, so this store works
// in preview and against a live backend without changes.

import { useSyncExternalStore } from "react";
import { api, isBackendLive } from "@/components/api";
import type { Member, Stats, ThreadMessage } from "@/components/types";

// One relayed question and its outcome. history holds these newest first.
export interface RelayRecord {
  requestId: string;
  toMemberId: string;
  toName: string;
  question: string;
  answer: string;
  status: "answered" | "escalated";
  ts: number;
}

// The read-only shape every screen consumes. Do not change this shape: the Threads
// and Insights lanes depend on it.
export interface RelaySnapshot {
  members: Member[];
  meId: string | null;
  live: boolean;
  stats: Stats | null;
  history: RelayRecord[];
  threadsById: Record<string, ThreadMessage[]>;
  selectedId: string | null;
  thinking: boolean;
  ready: boolean;
}

interface RelayActions {
  loadNetwork: () => Promise<void>;
  refreshStats: () => Promise<void>;
  select: (id: string | null) => void;
  relay: (toMemberId: string, question: string) => Promise<void>;
}

// localStorage keys. history, threads, and the selection are restored on load so a
// reload keeps the session. The connected marker records that this person has
// finished onboarding at least once, so the shell does not bounce them back to
// /connect after a reload even when the in-memory mock has reset meId to null.
const KEY = {
  history: "relay.history",
  threads: "relay.threads",
  selected: "relay.selected",
  connected: "relay.connected",
} as const;

const hasWindow = () => typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!hasWindow()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode or quota. keep running in memory for this tab. */
  }
}

function remove(key: string): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* nothing to recover from on a clear. */
  }
}

interface State {
  members: Member[];
  meId: string | null;
  live: boolean;
  stats: Stats | null;
  history: RelayRecord[];
  threadsById: Record<string, ThreadMessage[]>;
  selectedId: string | null;
  thinking: boolean;
  ready: boolean;
}

// Persisted slices are hydrated at module load on the client. Live data (members,
// meId, stats) is fetched after mount, so it starts empty and fills in via loadNetwork.
const state: State = {
  members: [],
  meId: null,
  live: false,
  stats: null,
  history: read<RelayRecord[]>(KEY.history, []),
  threadsById: read<Record<string, ThreadMessage[]>>(KEY.threads, {}),
  selectedId: read<string | null>(KEY.selected, null),
  thinking: false,
  ready: false,
};

function build(): RelaySnapshot {
  return {
    members: state.members,
    meId: state.meId,
    live: state.live,
    stats: state.stats,
    history: state.history,
    threadsById: state.threadsById,
    selectedId: state.selectedId,
    thinking: state.thinking,
    ready: state.ready,
  };
}

// The cached snapshot. getSnapshot returns this exact reference until emit() swaps
// it, which is what keeps useSyncExternalStore from looping.
let snapshot: RelaySnapshot = build();

// A stable empty snapshot for the server render and the first hydration pass, so the
// server and client agree before localStorage and the network fill the store in.
const serverSnapshot: RelaySnapshot = {
  members: [],
  meId: null,
  live: false,
  stats: null,
  history: [],
  threadsById: {},
  selectedId: null,
  thinking: false,
  ready: false,
};

const listeners = new Set<() => void>();

function emit(): void {
  snapshot = build();
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Dedupe concurrent loads (React strict mode mounts effects twice in development)
// while still allowing a later, intentional reload.
let inflightNetwork: Promise<void> | null = null;

export function loadNetwork(): Promise<void> {
  if (inflightNetwork) return inflightNetwork;
  inflightNetwork = (async () => {
    try {
      const net = await api.network();
      state.members = net.members;
      state.meId = net.meId;
      state.live = isBackendLive();
      // A real connected agent means onboarding is complete. Remember it so a reload
      // keeps this person in the shell even if the mock has dropped meId.
      if (net.meId) write(KEY.connected, "1");
    } catch {
      // The network call failed outright. Keep any prior directory and still mark
      // ready so the shell, its header, and sign out stay reachable.
      state.live = isBackendLive();
    } finally {
      state.ready = true;
      inflightNetwork = null;
      emit();
    }
  })();
  return inflightNetwork;
}

export async function refreshStats(): Promise<void> {
  try {
    state.stats = await api.stats();
    emit();
  } catch {
    // stats are non-critical, leave the prior value in place.
  }
}

export function select(id: string | null): void {
  if (state.selectedId === id) return;
  state.selectedId = id;
  write(KEY.selected, id);
  emit();
}

export async function relay(toMemberId: string, question: string): Promise<void> {
  if (state.thinking) return;
  const target = state.members.find((m) => m.id === toMemberId);
  const toName = target?.name ?? "Agent";
  const askedAt = Date.now();

  state.thinking = true;
  emit();

  try {
    const res = await api.relay(toMemberId, question);
    const requester: ThreadMessage = { requestId: res.requestId, role: "requester", text: question, ts: askedAt };
    const reply: ThreadMessage = {
      requestId: res.requestId,
      role: res.status === "escalated" ? "human" : "agent",
      text: res.answer,
      ts: Date.now(),
    };
    // Append the full exchange under its request id and record it newest first.
    state.threadsById = { ...state.threadsById, [res.requestId]: [requester, reply] };
    state.history = [
      {
        requestId: res.requestId,
        toMemberId,
        toName: res.toName || toName,
        question,
        answer: res.answer,
        status: res.status,
        ts: askedAt,
      },
      ...state.history,
    ];
    state.thinking = false;
    write(KEY.threads, state.threadsById);
    write(KEY.history, state.history);
    emit();
    // Refresh the counters after the exchange lands, but do not block the relay
    // resolving on it, so the caller can clear its optimistic question immediately.
    void refreshStats();
  } catch (err) {
    state.thinking = false;
    emit();
    throw err;
  }
}

// Clear the shared session on sign out so the next person starts clean. Live data is
// dropped and the persisted slices removed; the next loadNetwork repopulates.
export function clearRelay(): void {
  state.members = [];
  state.meId = null;
  state.live = false;
  state.stats = null;
  state.history = [];
  state.threadsById = {};
  state.selectedId = null;
  state.thinking = false;
  state.ready = false;
  remove(KEY.history);
  remove(KEY.threads);
  remove(KEY.selected);
  remove(KEY.connected);
  emit();
}

// Whether this person has connected an agent before. Read by the shell to decide
// preview reachability without forcing a fresh /connect after every reload.
export function isConnected(): boolean {
  if (!hasWindow()) return false;
  try {
    return window.localStorage.getItem(KEY.connected) === "1";
  } catch {
    return false;
  }
}

const actions: RelayActions = { loadNetwork, refreshStats, select, relay };

export function useRelay(): RelaySnapshot & RelayActions {
  const snap = useSyncExternalStore(subscribe, () => snapshot, () => serverSnapshot);
  return { ...snap, ...actions };
}
