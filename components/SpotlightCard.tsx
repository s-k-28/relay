"use client";

import { useRef, type ReactNode } from "react";

// A card that tracks the pointer and lifts a soft signal glow under the cursor.
// The glow lives in .spotlight::before (globals.css), positioned by --mx / --my.
export function SpotlightCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <div ref={ref} onMouseMove={onMove} className={`spotlight relative overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
