export default function Loading() {
  return (
    <main
      role="status"
      aria-live="polite"
      className="relative flex min-h-full flex-1 flex-col items-center justify-center px-6 py-24"
    >
      <div className="anim-fade flex flex-col items-center gap-5">
        <span className="relative grid h-3 w-3 place-items-center">
          <span
            aria-hidden="true"
            className="absolute inline-block h-3 w-3 rounded-full bg-signal"
            style={{ animation: "node-ping 2.4s cubic-bezier(0.4,0,0.2,1) infinite" }}
          />
          <span aria-hidden="true" className="relative inline-block h-2 w-2 rounded-full bg-signal" />
        </span>
        <span className="font-mono text-[12px] uppercase tracking-[0.22em] text-faint">Loading</span>
        <span className="sr-only">Loading, please wait.</span>
      </div>
    </main>
  );
}
