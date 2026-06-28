"use client";

// Settings. Profile comes from the client session, connection status and the
// connected agent come from the shared store. Clean cards, one signal accent, and a
// sign out that clears both the session and the shared session data.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NetworkGraph } from "@/components/NetworkGraph";
import { SignalDot } from "@/components/brand";
import { ArrowRight } from "@/components/icons";
import { Avatar } from "@/components/console/Avatar";
import { getAccount, clearAccount, type Account } from "@/components/auth/session";
import { useRelay, clearRelay } from "@/components/console/store";

const SUPPORT_EMAIL = "siddarthakodithyala28@gmail.com";

const PROVIDER_LABEL: Record<Account["provider"], string> = {
  google: "Google",
  github: "GitHub",
  email: "Email",
};

export function SettingsScreen() {
  const router = useRouter();
  const { members, meId, live } = useRelay();

  // Read the client only session after mount so the server render stays stable.
  const [account, setAccount] = useState<Account | null>(null);
  useEffect(() => {
    setAccount(getAccount());
  }, []);

  const me = useMemo(() => (meId ? members.find((m) => m.id === meId) ?? null : null), [members, meId]);

  const name = account?.name ?? me?.name ?? "Your account";
  const email = account?.email ?? "";
  const role = me?.role ?? "Member";
  const provider = account ? PROVIDER_LABEL[account.provider] : "";

  function handleSignOut() {
    clearAccount();
    clearRelay();
    router.push("/");
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-7 sm:px-6 sm:py-9">
      <header className="anim-rise" style={{ animationDelay: "0ms" }}>
        <p className="eyebrow mb-3">Settings</p>
        <h1 className="font-serif text-[clamp(1.8rem,4vw,2.4rem)] font-medium leading-tight tracking-[-0.01em] text-ink">
          Your account
        </h1>
        <p className="mt-2.5 max-w-xl text-[15px] leading-relaxed text-muted">
          Your profile, your connection to the network, and where to reach us.
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-5">
        {/* profile */}
        <section
          aria-label="Profile"
          className="anim-rise card-grad rounded-2xl border border-line p-6 sm:p-7"
          style={{ animationDelay: "80ms" }}
        >
          <p className="eyebrow mb-5">Profile</p>
          <div className="flex items-center gap-4">
            <Avatar name={name} you size="lg" />
            <div className="min-w-0">
              <p className="truncate text-[16px] font-medium text-ink">{name}</p>
              <p className="truncate text-[13px] text-faint">{role}</p>
            </div>
          </div>

          <div className="rule-fade my-6" />

          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            <Detail label="Email" value={email || "Not set"} />
            <Detail label="Sign in method" value={provider || "Not set"} />
            <Detail label="Role" value={role} />
            <Detail label="Network status" value={live ? "Live data" : "Preview data"} />
          </dl>
        </section>

        {/* connection */}
        <section
          aria-label="Connection"
          className="anim-rise overflow-hidden rounded-2xl border border-line bg-card"
          style={{ animationDelay: "160ms" }}
        >
          <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-[1fr_0.7fr]">
            <div className="card-grad p-6 sm:p-7">
              <p className="eyebrow mb-5">Connected agent</p>
              {me ? (
                <div className="flex items-center gap-3">
                  <Avatar name={me.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium text-ink">{me.name}</p>
                    <p className="truncate text-[12px] text-faint">{me.role}</p>
                  </div>
                  <span className="flex items-center gap-1.5">
                    <SignalDot online={me.online} />
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
                      {me.online ? "live" : "away"}
                    </span>
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-3">
                  <p className="text-[13.5px] leading-relaxed text-muted">
                    No agent is connected in this preview session. Connect one to become a node
                    teammates can reach.
                  </p>
                  <Link
                    href="/connect"
                    className="group inline-flex items-center gap-1.5 rounded-full border border-line-strong px-4 py-2 text-[13px] text-ink transition-colors hover:border-signal hover:text-signal"
                  >
                    Connect your agent
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              )}
            </div>
            <div className="relative hidden items-center justify-center bg-panel/40 p-4 sm:flex">
              <NetworkGraph className="h-[150px] w-full opacity-90" />
            </div>
          </div>
        </section>

        {/* support */}
        <section
          aria-label="Support"
          className="anim-rise card-grad rounded-2xl border border-line p-6 sm:p-7"
          style={{ animationDelay: "240ms" }}
        >
          <p className="eyebrow mb-4">Support</p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[14px] leading-relaxed text-muted">
              Questions or something not working? Reach us directly.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-mono text-[13px] text-signal-dim underline-offset-4 transition-colors hover:text-signal hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>
        </section>

        {/* sign out */}
        <section
          aria-label="Session"
          className="anim-rise flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-card p-6 sm:p-7"
          style={{ animationDelay: "320ms" }}
        >
          <div>
            <p className="text-[14px] font-medium text-ink">Sign out</p>
            <p className="mt-1 text-[13px] text-faint">End this session on this device.</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-full border border-line-strong px-5 py-2.5 text-[13.5px] text-ink transition-colors hover:border-amber/60 hover:text-amber"
          >
            Sign out
          </button>
        </section>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">{label}</dt>
      <dd className="truncate text-[14px] text-ink">{value}</dd>
    </div>
  );
}
