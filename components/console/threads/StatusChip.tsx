// Status pill for a relay: lime signal when an agent answered, amber when it
// escalated to a human. The escalated dot breathes to pull the eye to the exception.

export function StatusChip({
  status,
  className = "",
}: {
  status: "answered" | "escalated";
  className?: string;
}) {
  const answered = status === "answered";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] ${
        answered
          ? "border-signal/30 bg-signal-deep/60 text-signal-dim"
          : "border-amber/35 bg-amber-deep/50 text-amber"
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${answered ? "bg-signal" : "bg-amber"}`}
        style={answered ? undefined : { animation: "thr-chip-pulse 2.4s ease-in-out infinite" }}
      />
      {answered ? "answered" : "escalated"}
    </span>
  );
}
