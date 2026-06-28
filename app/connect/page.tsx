"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/components/api";
import { Wordmark } from "@/components/brand";
import { ConnectPanel } from "@/components/console/ConnectPanel";
import { getAccount, clearAccount } from "@/components/auth/session";

export default function ConnectPage() {
  const router = useRouter();

  // Gate this step behind a sign in. `checked` stays false until we know there is
  // an account, so the panel never flashes before a redirect to /login.
  const [checked, setChecked] = useState(false);
  const [defaultName, setDefaultName] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Read the client only session after mount. Wrapped so the state updates land in
    // a microtask rather than synchronously in the effect body, matching how the
    // console gates itself.
    (async () => {
      const account = getAccount();
      if (!account) {
        // Must sign in before connecting an agent.
        router.replace("/login");
        return;
      }
      if (account.name) setDefaultName(account.name);
      setChecked(true);
    })();
  }, [router]);

  const handleConnect = useCallback(
    async (name: string, role: string, aicooKey: string) => {
      setConnecting(true);
      setError(null);
      try {
        await api.connect(name, role, aicooKey);
        // Connected. The console reads meId from the network call and renders product.
        router.push("/app");
      } catch (err) {
        setError(err instanceof ApiError ? err.code : "connect_failed");
        setConnecting(false);
      }
    },
    [router],
  );

  function handleSignOut() {
    clearAccount();
    router.push("/login");
  }

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 text-faint">
          <span className="h-2 w-2 animate-pulse rounded-full bg-signal" />
          <span className="font-mono text-[12px] uppercase tracking-[0.16em]">Checking session</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
          <Link href="/" className="transition-opacity hover:opacity-80" aria-label="Relay home">
            <Wordmark />
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-full border border-line px-3.5 py-1.5 text-[12.5px] text-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            Not you? Sign out
          </button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="anim-rise w-full">
          <ConnectPanel
            onConnect={handleConnect}
            submitting={connecting}
            error={error}
            defaultName={defaultName}
          />
        </div>
      </main>
    </div>
  );
}
