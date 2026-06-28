// A small frontend session helper. For now Relay's auth is client side only:
// the sign in screen records who the person is in localStorage so the rest of the
// flow (connect, then the console) knows there is an account present. Real auth,
// provider secrets, and the /api/auth handlers belong to the backend lane and are
// intentionally out of scope here. When that lands, this helper is replaced by a
// server session and the localStorage read becomes a no op.

export type Provider = "google" | "github" | "email";

export interface Account {
  provider: Provider;
  email: string;
  name?: string;
}

const STORAGE_KEY = "relay_account";
const PROVIDERS: ReadonlySet<string> = new Set(["google", "github", "email"]);

// Read the current account, or null if no one is signed in. All access is guarded
// for the server, where window and localStorage do not exist.
export function getAccount(): Account | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Account>;
    // Validate the shape so a stale or hand edited value never breaks the gate.
    if (!parsed || typeof parsed.email !== "string" || !PROVIDERS.has(parsed.provider as string)) {
      return null;
    }
    return {
      provider: parsed.provider as Provider,
      email: parsed.email,
      name: typeof parsed.name === "string" && parsed.name.trim() ? parsed.name : undefined,
    };
  } catch {
    // Corrupt JSON or a locked down storage. Treat it as signed out.
    return null;
  }
}

export function setAccount(account: Account): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
  } catch {
    // Private mode or a full quota. Non fatal for a demo session, the flow still
    // continues in memory for this tab.
  }
}

export function clearAccount(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to recover from on a clear. Leave it.
  }
}
