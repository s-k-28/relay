"use client";

// The signature visual. A small network of agents with light traveling the wires,
// signalling a question relayed from one node and answered without waking the human.
// Pure SVG and CSS, no canvas, no library. Deterministic layout, no hydration drift.

type Kind = "you" | "online" | "idle";

interface Node {
  x: number;
  y: number;
  label: string;
  kind: Kind;
}

const NODES: Node[] = [
  { x: 300, y: 218, label: "You", kind: "you" },
  { x: 116, y: 104, label: "Dara", kind: "online" },
  { x: 486, y: 92, label: "Lin", kind: "online" },
  { x: 532, y: 274, label: "Mara", kind: "idle" },
  { x: 330, y: 392, label: "Juno", kind: "online" },
  { x: 92, y: 300, label: "Sef", kind: "online" },
];

// center to each, plus a few perimeter ties so it reads as a network, not a fan
const EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [0, 5],
  [1, 2],
  [3, 4],
  [5, 1],
];

export function NetworkGraph({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 440"
      className={className}
      role="img"
      aria-label="A network of teammate agents. A question relays between nodes and is answered without interrupting a person."
      fill="none"
    >
      <defs>
        <radialGradient id="you-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.15" />
        </radialGradient>
        <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {/* faint console rings for depth */}
      {[150, 105, 60].map((r, i) => (
        <circle
          key={r}
          cx={300}
          cy={218}
          r={r}
          stroke="var(--line)"
          strokeWidth={1}
          opacity={0.5 - i * 0.06}
        />
      ))}

      {/* base wires */}
      {EDGES.map(([a, b], i) => (
        <line
          key={`base-${i}`}
          x1={NODES[a].x}
          y1={NODES[a].y}
          x2={NODES[b].x}
          y2={NODES[b].y}
          stroke="var(--line-strong)"
          strokeWidth={1}
          opacity={0.55}
        />
      ))}

      {/* signal packets traveling each wire, staggered */}
      {EDGES.map(([a, b], i) => (
        <line
          key={`pulse-${i}`}
          x1={NODES[a].x}
          y1={NODES[a].y}
          x2={NODES[b].x}
          y2={NODES[b].y}
          stroke="var(--signal)"
          strokeWidth={2}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="5 95"
          style={{
            animation: `edge-travel 3.4s linear ${i * 0.55}s infinite`,
          }}
        />
      ))}

      {/* nodes */}
      {NODES.map((n, i) => {
        const isYou = n.kind === "you";
        return (
          <g key={i} style={{ animation: `node-breathe 4.5s ease-in-out ${i * 0.4}s infinite` }}>
            {isYou && <circle cx={n.x} cy={n.y} r={26} fill="url(#you-core)" filter="url(#soft)" />}
            <circle
              cx={n.x}
              cy={n.y}
              r={isYou ? 9 : 6}
              fill={isYou ? "var(--signal)" : "var(--card)"}
              stroke={isYou ? "var(--signal)" : "var(--line-strong)"}
              strokeWidth={1.5}
            />
            {!isYou && (
              <circle
                cx={n.x}
                cy={n.y}
                r={2.5}
                fill={n.kind === "online" ? "var(--online)" : "var(--faint)"}
              />
            )}
            <text
              x={n.x}
              y={n.y + (n.y > 360 ? 24 : -16)}
              textAnchor="middle"
              className="font-mono"
              fontSize={11}
              letterSpacing="0.08em"
              fill={isYou ? "var(--signal-dim)" : "var(--faint)"}
            >
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
