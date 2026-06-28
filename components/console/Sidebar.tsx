"use client";

// The persistent product navigation. Rendered as a static column on large screens
// and inside a slide-in drawer on small ones, so this component is just the inner
// content: a section label, the nav items, and a quiet connection footer. The active
// item is derived from the current path and marked with aria-current plus a signal
// bar that eases in.

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SVGProps } from "react";
import type { Member } from "@/components/types";
import { SignalDot } from "@/components/brand";
import { Node } from "@/components/icons";

const ICON = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function ThreadsIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...ICON} {...p}>
      <path d="M4 6.5A1.5 1.5 0 0 1 5.5 5h9A1.5 1.5 0 0 1 16 6.5v5A1.5 1.5 0 0 1 14.5 13H8l-4 3.5v-10Z" />
      <path d="M9 16.5a1.5 1.5 0 0 0 1.5 1.5H16l4 3v-9a1.5 1.5 0 0 0-1.5-1.5H18" />
    </svg>
  );
}

function InsightsIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...ICON} {...p}>
      <path d="M4 20h16" />
      <path d="M7 20v-6M12 20V8M17 20v-9" />
    </svg>
  );
}

function SettingsIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...ICON} {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2M12 18.5v2M5.5 12h-2M20.5 12h-2M7.05 7.05 5.6 5.6M18.4 18.4l-1.45-1.45M16.95 7.05 18.4 5.6M5.6 18.4l1.45-1.45" />
    </svg>
  );
}

const NAV = [
  { href: "/app", label: "Network", icon: <Node width={18} height={18} /> },
  { href: "/app/threads", label: "Threads", icon: <ThreadsIcon /> },
  { href: "/app/insights", label: "Insights", icon: <InsightsIcon /> },
  { href: "/app/settings", label: "Settings", icon: <SettingsIcon /> },
];

function isActive(pathname: string, href: string): boolean {
  // /app is a prefix of every child route, so it only matches exactly. The rest match
  // their own segment or anything nested beneath it.
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({
  me,
  live,
  onNavigate,
}: {
  me: Member | null;
  live: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname() ?? "/app";

  return (
    <nav aria-label="Product" className="flex h-full flex-col">
      <p className="eyebrow px-3 pb-3 pt-1">Workspace</p>

      <ul className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] transition-colors duration-200 ${
                  active ? "bg-raised text-ink" : "text-muted hover:bg-card hover:text-ink"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-signal transition-all duration-300 ease-out ${
                    active ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
                  }`}
                  style={{ transformOrigin: "center" }}
                />
                <span
                  className={`shrink-0 transition-colors duration-200 ${
                    active ? "text-signal" : "text-faint group-hover:text-muted"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* quiet connection footer */}
      <div className="mt-auto px-1 pt-6">
        <div className="rounded-xl border border-line bg-card/60 px-3.5 py-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
              {live ? "Live data" : "Preview data"}
            </span>
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: live ? "var(--online)" : "var(--ghost)" }}
            />
          </div>
          {me ? (
            <div className="mt-2 flex items-center gap-1.5">
              <SignalDot online={me.online} />
              <span className="truncate text-[12px] text-muted">{me.name}</span>
            </div>
          ) : (
            <p className="mt-2 text-[12px] text-faint">Network ready</p>
          )}
        </div>
      </div>
    </nav>
  );
}
