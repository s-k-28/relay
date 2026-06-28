import Link from "next/link";
import { Wordmark } from "@/components/brand";
import { ArrowRight } from "@/components/icons";

// The sticky site header, shared by the landing and every content page.
// Wordmark links home, primary links sit on the right, and the pill opens the console.
const LINKS = [
  { href: "/#how", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/security", label: "Security" },
  { href: "/faq", label: "FAQ" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="rounded-md" aria-label="Relay home">
          <Wordmark />
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-7 text-sm text-muted">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hidden transition-colors hover:text-ink sm:inline"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/app"
            className="group inline-flex items-center gap-1.5 rounded-full border border-line-strong px-4 py-1.5 text-ink transition-colors hover:border-signal hover:text-signal"
          >
            Open console
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
