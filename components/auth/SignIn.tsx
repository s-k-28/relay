"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Spinner } from "../icons";
import { RelayMark, Wordmark } from "../brand";
import { NetworkGraph } from "../NetworkGraph";
import { setAccount, type Provider } from "./session";

type Mode = "login" | "signup";

const ROLES = [
  "Engineering",
  "Product",
  "Design",
  "Data and Analytics",
  "Sales",
  "Marketing",
  "Operations",
  "Customer Success",
  "Founder or Exec",
  "Other",
];

const COPY = {
  login: {
    eyebrow: "Sign in",
    title: "Welcome back to Relay",
    lead: "Sign in to reach your network. Your agent answers for you, and teammates only pull you in on the exception.",
    crossPrompt: "New to Relay?",
    crossLink: "Create an account",
    crossHref: "/signup",
    submit: "Continue with email",
  },
  signup: {
    eyebrow: "Create account",
    title: "Become a node on the network",
    lead: "Set up your account, then connect your Aicoo agent. From there teammates can ask you and get an answer in seconds.",
    crossPrompt: "Already have an account?",
    crossLink: "Sign in",
    crossHref: "/login",
    submit: "Continue with email",
  },
} as const;

export function SignIn({ mode }: { mode: Mode }) {
  const router = useRouter();
  const copy = COPY[mode];

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Land on the connect step once an account exists. router.push, not a full reload,
  // so the in memory state carries across the navigation.
  function finish(account: { provider: Provider; email: string; name?: string }) {
    setAccount(account);
    router.push("/connect");
  }

  function continueWithProvider(provider: "google" | "github") {
    if (pending) return;
    setError(null);
    setPending(provider);
    // HANDOFF: real OAuth lives in the backend lane and is out of scope here.
    // A real implementation would not write the session in the browser. It would
    // redirect to the provider entrypoint, e.g. window.location.href =
    // `/api/auth/${provider}`, and the callback would create the session server
    // side from the verified profile (email, name) it gets back. For now we record
    // a frontend session and move on. Provider secrets are never handled here.
    finish({
      provider,
      // The browser does not know the verified address yet, the OAuth callback would.
      email: "",
      // Carry a name the person may have typed on the signup form, if any.
      name: mode === "signup" && name.trim() ? name.trim() : undefined,
    });
  }

  function continueWithEmail(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Enter a valid email address to continue.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Add your name so teammates know who they reached.");
      return;
    }
    setError(null);
    setPending("email");
    // HANDOFF: a real implementation would POST these credentials to the backend
    // (e.g. /api/auth/email) for a magic link or password check, then set the
    // session server side. Here we record the frontend session directly.
    finish({
      provider: "email",
      email: cleanEmail,
      name: mode === "signup" && name.trim() ? name.trim() : undefined,
    });
  }

  return (
    <div className="relative flex min-h-screen flex-col lg:grid lg:grid-cols-[1fr_0.82fr]">
      {/* auth column */}
      <div className="relative flex flex-1 flex-col px-6 py-7 sm:px-10 lg:px-14">
        <header className="flex items-center justify-between">
          <Link href="/" className="transition-opacity hover:opacity-80" aria-label="Relay home">
            <Wordmark />
          </Link>
          <Link
            href={copy.crossHref}
            className="hidden text-[13px] text-muted transition-colors hover:text-ink sm:inline"
          >
            {copy.crossPrompt} <span className="text-signal-dim">{copy.crossLink}</span>
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center py-12">
          <div className="anim-rise w-full max-w-sm">
            <p className="eyebrow mb-4">{copy.eyebrow}</p>
            <h1 className="font-serif text-[2rem] font-medium leading-tight tracking-[-0.01em] text-ink">
              {copy.title}
            </h1>
            <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{copy.lead}</p>

            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => continueWithProvider("google")}
                disabled={pending !== null}
                className="group inline-flex items-center justify-center gap-3 rounded-full border border-line-strong bg-card px-5 py-3 text-[14.5px] font-medium text-ink transition-colors hover:border-faint hover:bg-raised disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending === "google" ? (
                  <Spinner className="h-4 w-4 text-muted" />
                ) : (
                  <GoogleMark className="h-[18px] w-[18px]" />
                )}
                Continue with Google
              </button>
              <button
                type="button"
                onClick={() => continueWithProvider("github")}
                disabled={pending !== null}
                className="group inline-flex items-center justify-center gap-3 rounded-full border border-line-strong bg-card px-5 py-3 text-[14.5px] font-medium text-ink transition-colors hover:border-faint hover:bg-raised disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending === "github" ? (
                  <Spinner className="h-4 w-4 text-muted" />
                ) : (
                  <GitHubMark className="h-[18px] w-[18px] text-ink" />
                )}
                Continue with GitHub
              </button>
            </div>

            <div className="my-6 flex items-center gap-4" aria-hidden="true">
              <span className="h-px flex-1 bg-line" />
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ghost">or</span>
              <span className="h-px flex-1 bg-line" />
            </div>

            <form onSubmit={continueWithEmail} className="flex flex-col gap-4" noValidate>
              {mode === "signup" && (
                <>
                  <Field
                    id="name"
                    label="Your name"
                    value={name}
                    onChange={setName}
                    placeholder="Avery Chen"
                    autoComplete="name"
                  />
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="role" className="text-[13px] font-medium text-muted">
                      Role
                      <span className="ml-2 font-mono text-[11px] text-ghost">optional</span>
                    </label>
                    <div className="relative">
                      <select
                        id="role"
                        name="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className={`w-full appearance-none rounded-lg border border-line-strong bg-bg/60 px-3.5 py-2.5 pr-9 text-[15px] transition-colors hover:border-faint focus:outline-none focus-visible:border-signal ${
                          role ? "text-ink" : "text-ghost"
                        }`}
                      >
                        <option value="" disabled>
                          What do you do?
                        </option>
                        {ROLES.map((r) => (
                          <option key={r} value={r} className="text-ink">
                            {r}
                          </option>
                        ))}
                      </select>
                      <Chevron className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                    </div>
                  </div>
                </>
              )}

              <Field
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@company.com"
                autoComplete="email"
                invalid={Boolean(error) && (!email.trim() || !email.includes("@"))}
              />

              {error && (
                <p role="alert" className="text-[12.5px] text-amber">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending !== null}
                className="shine group inline-flex items-center justify-center gap-2 rounded-full bg-signal px-6 py-3 text-[15px] font-semibold text-bg transition-transform enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending === "email" ? (
                  <>
                    <Spinner className="h-4 w-4 text-bg" />
                    Signing in
                  </>
                ) : (
                  <>
                    {copy.submit}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-5 text-[12px] leading-relaxed text-faint">
              By continuing you agree to Relay&apos;s{" "}
              <Link href="/legal/terms" className="text-muted underline underline-offset-2 hover:text-ink">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/legal/privacy" className="text-muted underline underline-offset-2 hover:text-ink">
                Privacy Policy
              </Link>
              .
            </p>

            <p className="mt-6 text-[13.5px] text-muted sm:hidden">
              {copy.crossPrompt}{" "}
              <Link href={copy.crossHref} className="text-signal-dim hover:text-signal">
                {copy.crossLink}
              </Link>
            </p>
          </div>
        </main>
      </div>

      {/* quiet brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-l border-line bg-panel/50 p-10 lg:flex">
        <div className="aurora" aria-hidden="true" />
        <div className="relative z-10">
          <p className="eyebrow mb-5">The network</p>
          <p className="max-w-xs font-serif text-[1.6rem] font-medium leading-snug tracking-[-0.01em] text-ink">
            One question, answered by a teammate&apos;s agent. No tap on the shoulder.
          </p>
        </div>
        <div className="relative z-10 overflow-hidden rounded-xl border border-line/70 bg-bg/40 p-3">
          <NetworkGraph className="w-full opacity-90" />
        </div>
        <div className="relative z-10 flex items-center gap-2.5 text-[12.5px] text-faint">
          <RelayMark className="h-4 w-4 text-signal-dim" />
          Your Aicoo key stays server side. It never appears in the browser.
        </div>
      </aside>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  invalid = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  invalid?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-muted">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={invalid}
        className={`w-full rounded-lg border bg-bg/60 px-3.5 py-2.5 text-[15px] text-ink transition-colors placeholder:text-ghost focus:outline-none focus-visible:border-signal ${
          invalid ? "border-amber/60" : "border-line-strong hover:border-faint"
        }`}
      />
    </div>
  );
}

// Provider marks, inlined so there is no asset dependency and they inherit sizing.
function GoogleMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18A10.98 10.98 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

function GitHubMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12c0 4.64 3.01 8.58 7.19 9.97.53.1.72-.23.72-.51l-.01-1.79c-2.93.64-3.55-1.41-3.55-1.41-.48-1.22-1.17-1.54-1.17-1.54-.96-.65.07-.64.07-.64 1.06.07 1.62 1.09 1.62 1.09.94 1.62 2.47 1.15 3.07.88.1-.68.37-1.15.67-1.41-2.34-.27-4.8-1.17-4.8-5.2 0-1.15.41-2.09 1.09-2.83-.11-.27-.47-1.34.1-2.79 0 0 .89-.29 2.91 1.08a10.1 10.1 0 0 1 5.3 0c2.02-1.37 2.9-1.08 2.9-1.08.58 1.45.22 2.52.11 2.79.68.74 1.09 1.68 1.09 2.83 0 4.04-2.47 4.93-4.82 5.19.38.33.71.97.71 1.96l-.01 2.9c0 .29.19.62.73.51A10.51 10.51 0 0 0 22.5 12c0-5.8-4.7-10.5-10.5-10.5Z"
      />
    </svg>
  );
}

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
