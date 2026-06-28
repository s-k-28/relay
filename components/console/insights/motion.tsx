import type { CSSProperties } from "react";

// A style object that also accepts the --ins-* custom properties the keyframes
// below read. React's CSSProperties does not allow custom keys on its own.
export type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

// Local keyframes for the Insights screen. Prefixed ins- so they never collide
// with the names already defined in globals.css (which this lane cannot edit).
// Ease-out only, no overshoot. The global prefers-reduced-motion rule targets
// every element, so these clamp to a final frame automatically when motion is off.
//
// Progressive enhancement note: the donut arcs and the leaderboard bars set their
// final value as the base inline style and use these animations only to reveal it.
// With no script or no animation support, the final state still renders.
export function InsightsKeyframes() {
  return (
    <style>{`
      @keyframes ins-rise {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes ins-fade {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes ins-draw {
        from { stroke-dasharray: 0 100; }
        to   { stroke-dasharray: var(--ins-arc) 100; }
      }
      @keyframes ins-grow {
        from { width: 0; }
        to   { width: var(--ins-w); }
      }
      .ins-rise { animation: ins-rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
      .ins-fade { animation: ins-fade 0.55s ease-out both; }
      .ins-draw { animation: ins-draw 1.1s ease-out both; }
      .ins-grow { animation: ins-grow 0.95s cubic-bezier(0.22, 1, 0.36, 1) both; }
    `}</style>
  );
}
