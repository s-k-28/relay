// One typed client for the frozen contract. Each call hits the real /api route first.
// If the route is not deployed yet (the backend lane lands separately), it falls back
// to the in-memory mock so the UI is always clickable. When the routes are live, the
// mock is never touched. The component layer does not know or care which path ran.

import { mock } from "./mock";
import type {
  ConnectResponse,
  EscalateResponse,
  NetworkResponse,
  RelayResponse,
  Stats,
  ThreadResponse,
} from "./types";

async function realJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    // surface a typed error code where the contract defines one
    let code = `http_${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) code = body.error;
    } catch {
      /* non-json error body, keep the status code */
    }
    throw new ApiError(code, res.status);
  }
  return (await res.json()) as T;
}

export class ApiError extends Error {
  constructor(public code: string, public status: number) {
    super(code);
    this.name = "ApiError";
  }
}

// True once a real route has answered, so we stop attempting fallbacks needlessly
// and can show an honest "preview data" marker until then.
let backendLive = false;
export const isBackendLive = () => backendLive;

async function withFallback<T>(real: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  try {
    const out = await real();
    backendLive = true;
    return out;
  } catch (err) {
    // A typed contract error (404 member_not_found, 401 invalid_key) is a real answer
    // from a live backend and must propagate. Only fall back when the route is absent.
    if (err instanceof ApiError && err.status !== 404 && err.status < 500) {
      backendLive = true;
      throw err;
    }
    return fallback();
  }
}

export const api = {
  network: () =>
    withFallback<NetworkResponse>(() => realJSON("/api/network"), () => mock.network()),

  // Connect always lands the user in the product. A real key on a configured
  // backend connects for real. Anything else (no backend, or Aicoo cannot validate
  // the key) falls back to preview mode so the product is reachable for exploration,
  // the honest "Preview data" badge stays on until a real route answers.
  connect: async (name: string, role: string, aicooKey: string): Promise<ConnectResponse> => {
    try {
      const out = await realJSON<ConnectResponse>("/api/connect", {
        method: "POST",
        body: JSON.stringify({ name, role, aicooKey }),
      });
      backendLive = true;
      return out;
    } catch {
      return mock.connect(name, role);
    }
  },

  relay: (toMemberId: string, question: string) =>
    withFallback<RelayResponse>(
      () => realJSON("/api/relay", { method: "POST", body: JSON.stringify({ toMemberId, question }) }),
      () => mock.relay(toMemberId, question),
    ),

  thread: (id: string) =>
    withFallback<ThreadResponse>(() => realJSON(`/api/thread?id=${encodeURIComponent(id)}`), () => mock.thread(id)),

  escalate: (requestId: string) =>
    withFallback<EscalateResponse>(
      () => realJSON("/api/escalate", { method: "POST", body: JSON.stringify({ requestId }) }),
      () => mock.escalate(requestId),
    ),

  stats: () => withFallback<Stats>(() => realJSON("/api/stats"), () => mock.stats()),
};
