"use client";

import { useState } from "react";
import { ArrowRight, Check, ShieldLock, Spinner } from "../icons";
import { NetworkGraph } from "../NetworkGraph";

export function ConnectPanel({
  onConnect,
  submitting,
  error,
}: {
  onConnect: (name: string, role: string, aicooKey: string) => void;
  submitting: boolean;
  error: string | null;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [key, setKey] = useState("");
  const [touched, setTouched] = useState(false);

  const nameMissing = touched && !name.trim();
  const keyMissing = touched && !key.trim();
  const canSubmit = name.trim().length > 0 && key.trim().length > 0 && !submitting;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!name.trim() || !key.trim()) return;
    onConnect(name.trim(), role.trim(), key.trim());
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-[1fr_0.82fr]">
      {/* form */}
      <div className="card-grad p-8 sm:p-10">
        <p className="eyebrow mb-4">First run</p>
        <h1 className="font-serif text-[2rem] font-medium leading-tight tracking-[-0.01em] text-ink">
          Connect your agent
        </h1>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
          Add your details and your Aicoo key once. We validate it against Aicoo and you become a
          node teammates can reach. You answer through your agent, on your own context.
        </p>

        <form onSubmit={submit} className="mt-8 flex flex-col gap-5" noValidate>
          <Field
            id="name"
            label="Your name"
            value={name}
            onChange={setName}
            placeholder="Avery Chen"
            invalid={nameMissing}
            hint={nameMissing ? "Add your name so teammates know who they reached." : undefined}
            autoComplete="name"
          />
          <Field
            id="role"
            label="Role"
            optional
            value={role}
            onChange={setRole}
            placeholder="Staff Engineer, Platform"
            autoComplete="organization-title"
          />
          <Field
            id="aicooKey"
            label="Aicoo API key"
            value={key}
            onChange={setKey}
            placeholder="ak_live_..."
            type="password"
            mono
            invalid={keyMissing}
            hint={keyMissing ? "Paste the key from your Aicoo settings to connect." : undefined}
            autoComplete="off"
          />

          <p className="flex items-start gap-2 rounded-lg border border-line bg-bg/50 px-3.5 py-3 text-[12.5px] leading-relaxed text-faint">
            <ShieldLock className="mt-0.5 h-4 w-4 shrink-0 text-faint" />
            <span>
              The key is sent once to connect and stored server side. It never returns to the
              browser, never appears in a response, and is never written to a log.
            </span>
          </p>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-amber/40 bg-amber-deep/40 px-3.5 py-2.5 text-[13px] text-amber"
            >
              {error === "invalid_key"
                ? "Aicoo did not accept that key. Check it in your Aicoo settings and try again."
                : error === "missing_fields"
                  ? "Add your name and your Aicoo key to connect."
                  : "Something went wrong connecting. Try again in a moment."}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="group mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-signal px-6 py-3 text-[15px] font-semibold text-bg transition-transform enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? (
              <>
                <Spinner className="h-4 w-4 text-bg" />
                Validating with Aicoo
              </>
            ) : (
              <>
                Connect to the network
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* reassurance / preview */}
      <aside className="relative hidden flex-col justify-between gap-6 bg-panel/50 p-8 sm:p-10 lg:flex">
        <div>
          <p className="eyebrow mb-5">What connecting does</p>
          <ul className="flex flex-col gap-4">
            {[
              "Validates your key against Aicoo so the network knows it is real.",
              "Lists you as a callable agent, with your name and role only.",
              "Lets teammates ask you and get answers from your permitted context.",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-muted">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-signal-dim" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-line/70 bg-bg/40 p-3">
          <NetworkGraph className="w-full opacity-90" />
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
  optional = false,
  mono = false,
  invalid = false,
  hint,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  optional?: boolean;
  mono?: boolean;
  invalid?: boolean;
  hint?: string;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-center justify-between text-[13px] font-medium text-muted">
        {label}
        {optional && <span className="font-mono text-[11px] text-ghost">optional</span>}
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
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={`w-full rounded-lg border bg-bg/60 px-3.5 py-2.5 text-[15px] text-ink transition-colors placeholder:text-ghost focus:outline-none focus-visible:border-signal ${
          mono ? "font-mono text-[14px] tracking-tight" : ""
        } ${invalid ? "border-amber/60" : "border-line-strong hover:border-faint"}`}
      />
      {hint && (
        <span id={`${id}-hint`} className="text-[12px] text-amber">
          {hint}
        </span>
      )}
    </div>
  );
}
