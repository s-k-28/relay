// Shared brand marks, reused by the landing, the console header, and the footer.

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <RelayMark className="h-[18px] w-[18px] text-signal" />
      <span className="font-mono text-[15px] font-medium tracking-[0.16em] text-ink">RELAY</span>
    </span>
  );
}

// A compact node-and-wire glyph: one bright node relaying to two others.
export function RelayMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M7 6.5 12 12l5-5.5M7 17.5 12 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" />
      <circle cx="6.5" cy="6" r="1.7" fill="currentColor" opacity="0.55" />
      <circle cx="17.5" cy="6" r="1.7" fill="currentColor" opacity="0.55" />
      <circle cx="6.5" cy="18" r="1.7" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

export function SignalDot({ online, className = "" }: { online: boolean; className?: string }) {
  return (
    <span
      className={`relative inline-block h-2 w-2 rounded-full ${className}`}
      style={{ background: online ? "var(--online)" : "var(--ghost)" }}
    >
      {online && <span className="pulse-dot absolute inset-0 rounded-full" />}
    </span>
  );
}
