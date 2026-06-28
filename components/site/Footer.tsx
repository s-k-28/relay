import Link from "next/link";
import { Wordmark } from "@/components/brand";

// The site footer, shared across the landing and content pages.
// A positioning line on the left, three columns of links, and a mono credit row.
const COLUMNS = [
  {
    heading: "Product",
    links: [
      { href: "/app", label: "Console" },
      { href: "/#how", label: "How it works" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/security", label: "Security" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms" },
      { href: "/legal/privacy", label: "Privacy" },
      { href: "/faq", label: "FAQ" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Wordmark />
            <p className="mt-3 max-w-sm font-serif text-[17px] italic leading-snug text-muted">
              The interruption layer for teams, replaced by agents.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading} className="flex flex-col gap-3">
              <h2 className="eyebrow">{col.heading}</h2>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[14px] text-muted transition-colors hover:text-ink"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="rule-fade mt-12 mb-6" />
        <p className="font-mono text-[11px] leading-relaxed text-faint">
          Built on Aicoo for the AICOO Hackathon. Person to person agent routing.
        </p>
      </div>
    </footer>
  );
}
