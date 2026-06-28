"use client";

// The authenticated product shell. It gates the whole /app section, warms the shared
// store, and frames every screen with a persistent sidebar and a top header. Gating
// lives here so the individual screens stay focused on their own content.
//
// Flow on mount:
//   1. No session  -> replace to /login.
//   2. Signed in   -> loadNetwork() + refreshStats() on the shared store.
//   3. After load, meId is null and there is no prior connection marker -> /connect.
// Preview reachability: the in-memory mock resets meId on a hard reload, so the
// persisted connection marker keeps a returning person inside the shell instead of
// sending them back through onboarding.

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Member } from "@/components/types";
import { Wordmark, SignalDot } from "@/components/brand";
import { getAccount, clearAccount, type Account } from "@/components/auth/session";
import { Avatar } from "@/components/console/Avatar";
import { Sidebar } from "@/components/console/Sidebar";
import { useRelay, isConnected, clearRelay } from "@/components/console/store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, meId, members, live, loadNetwork, refreshStats } = useRelay();

  const [account, setAccount] = useState<Account | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Gate behind a sign in, then warm the shared store.
  useEffect(() => {
    const acc = getAccount();
    if (!acc) {
      router.replace("/login");
      return;
    }
    setAccount(acc);
    setAuthChecked(true);
    void loadNetwork();
    void refreshStats();
  }, [router, loadNetwork, refreshStats]);

  // Once the network has answered, a signed in person with no agent and no prior
  // connection has not finished onboarding. Send them to connect.
  useEffect(() => {
    if (!authChecked || !ready) return;
    if (meId === null && !isConnected()) {
      router.replace("/connect");
    }
  }, [authChecked, ready, meId, router]);

  // Close the drawer on navigation, on Escape, and lock body scroll while it is open.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [drawerOpen]);

  function handleSignOut() {
    clearAccount();
    clearRelay();
    router.push("/");
  }

  const me = meId ? members.find((m) => m.id === meId) ?? null : null;
  const gatingToConnect = ready && meId === null && !isConnected();

  // Hold a clean loader until we know there is a session, so the shell never flashes
  // before an unauthenticated person is redirected to /login.
  if (!authChecked) {
    return <FullLoader label="Checking session" />;
  }

  return (
    <div className="flex min-h-screen bg-bg">
      {/* persistent sidebar, large screens */}
      <aside className="hidden w-60 shrink-0 border-r border-line/70 bg-panel/40 lg:block">
        <div className="sticky top-0 flex h-screen flex-col overflow-y-auto px-3 py-5">
          <Sidebar me={me} live={live} />
        </div>
      </aside>

      {/* slide-in drawer, small screens */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setDrawerOpen(false)}
            className="anim-fade absolute inset-0 bg-bg/70 backdrop-blur-sm"
          />
          <div className="anim-drawer relative flex h-full w-72 max-w-[82%] flex-col border-r border-line bg-panel px-3 py-5 shadow-2xl">
            <Sidebar me={me} live={live} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* content column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          account={account}
          me={me}
          live={live}
          onMenu={() => setDrawerOpen(true)}
          onSignOut={handleSignOut}
        />
        <main className="flex-1">
          {ready && !gatingToConnect ? (
            children
          ) : (
            <MainLoader label={gatingToConnect ? "Finishing setup" : "Loading network"} />
          )}
        </main>
      </div>
    </div>
  );
}

function Header({
  account,
  me,
  live,
  onMenu,
  onSignOut,
}: {
  account: Account | null;
  me: Member | null;
  live: boolean;
  onMenu: () => void;
  onSignOut: () => void;
}) {
  const name = account?.name ?? me?.name ?? account?.email ?? "You";
  const role = me?.role ?? "Member";

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onMenu}
            aria-label="Open navigation"
            className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-line-strong hover:text-ink lg:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <Link href="/" className="rounded-md transition-opacity hover:opacity-80" aria-label="Relay home">
            <Wordmark />
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <span
            title={live ? "Connected to live Relay routes." : "Routes are not deployed yet, showing preview data."}
            className="hidden items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] sm:flex"
          >
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: live ? "var(--online)" : "var(--ghost)" }}
            />
            <span className="text-faint">{live ? "Live data" : "Preview data"}</span>
          </span>

          {account && (
            <span className="flex items-center gap-2.5 rounded-full border border-line bg-card py-1 pl-1.5 pr-1 sm:pr-3.5">
              <Avatar name={name} you size="sm" />
              <span className="hidden flex-col leading-tight sm:flex">
                <span className="text-[12.5px] font-medium text-ink">{name}</span>
                <span className="font-mono text-[10px] text-faint">{role}</span>
              </span>
              {me && <SignalDot online={me.online} className="ml-0.5 hidden sm:inline-block" />}
            </span>
          )}

          <button
            type="button"
            onClick={onSignOut}
            className="rounded-full border border-line px-3.5 py-1.5 text-[12.5px] text-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}

function FullLoader({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center" role="status" aria-busy="true">
      <div className="flex items-center gap-3 text-faint">
        <span className="h-2 w-2 animate-pulse rounded-full bg-signal" />
        <span className="font-mono text-[12px] uppercase tracking-[0.16em]">{label}</span>
      </div>
    </div>
  );
}

function MainLoader({ label }: { label: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-busy="true">
      <div className="flex items-center gap-3 text-faint">
        <span className="h-2 w-2 animate-pulse rounded-full bg-signal" />
        <span className="font-mono text-[12px] uppercase tracking-[0.16em]">{label}</span>
      </div>
    </div>
  );
}
