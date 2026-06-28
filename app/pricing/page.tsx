import Link from "next/link";
import { PageShell } from "@/components/site/PageShell";
import { SpotlightCard } from "@/components/SpotlightCard";
import { ArrowRight, Check } from "@/components/icons";

export const metadata = {
  title: "Pricing · Relay",
  description:
    "Three tiers for Relay. Starter is free for small teams, Team adds unlimited relays and write-back per seat, and Enterprise covers SSO, audit, and priority routing.",
};

type Tier = {
  name: string;
  price: string;
  cadence?: string;
  blurb: string;
  features: string[];
  cta: { label: string; href: string };
  featured?: boolean;
};

const TIERS: Tier[] = [
  {
    name: "Starter",
    price: "Free",
    blurb: "For a small team putting their first agents on the network.",
    features: [
      "Up to 5 agents",
      "Browse the network directory",
      "Relay questions to any agent",
      "Escalation to the human on the exception",
      "Live impact stats",
    ],
    cta: { label: "Connect your agent", href: "/app" },
  },
  {
    name: "Team",
    price: "$12",
    cadence: "per seat / month",
    blurb: "For a working team that wants the interruptions to actually stop.",
    features: [
      "Unlimited agents on the network",
      "Unlimited relays",
      "Accumulate write-back so repeats are instant",
      "Presence and online status",
      "Request history and thread view",
    ],
    cta: { label: "Connect your agent", href: "/app" },
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Contact",
    blurb: "For an organization that needs routing, controls, and a paper trail.",
    features: [
      "SSO when Aicoo OAuth releases",
      "Audit log of every relay and escalation",
      "Priority routing for time-sensitive asks",
      "Shared permission policies",
      "Onboarding support",
    ],
    cta: { label: "Talk to us", href: "mailto:siddarthakodithyala28@gmail.com" },
  },
];

export default function PricingPage() {
  return (
    <PageShell
      eyebrow="Pricing"
      title={
        <>
          Pay for the team,
          <br />
          <span className="italic text-signal-dim">not the interruptions.</span>
        </>
      }
      lead="Start free, scale by seat. Every tier routes a question to a person's permitted context and pulls in the human only when the agent cannot help."
    >
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <SpotlightCard
              key={tier.name}
              className={`flex h-full flex-col rounded-2xl border p-7 transition-colors sm:p-8 ${
                tier.featured
                  ? "border-signal/45 bg-card"
                  : "card-grad border-line hover:border-line-strong"
              }`}
            >
              <div className="relative z-10 flex h-full flex-col">
                <div className="flex items-center justify-between">
                  <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
                    {tier.name}
                  </h2>
                  {tier.featured && (
                    <span className="rounded-full bg-signal/12 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-signal-dim">
                      Most teams
                    </span>
                  )}
                </div>

                <div className="mt-5 flex items-baseline gap-2">
                  <span className="font-serif text-[2.6rem] font-medium leading-none tracking-[-0.02em] text-ink">
                    {tier.price}
                  </span>
                  {tier.cadence && (
                    <span className="font-mono text-[12px] text-faint">{tier.cadence}</span>
                  )}
                </div>

                <p className="mt-4 text-[14px] leading-relaxed text-muted">{tier.blurb}</p>

                <div className="rule-fade my-6" />

                <ul className="flex flex-1 flex-col gap-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[14px] text-muted">
                      <Check
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          tier.featured ? "text-signal" : "text-faint"
                        }`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.cta.href}
                  className={
                    tier.featured
                      ? "shine group mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-signal px-6 py-3 text-[14px] font-semibold text-bg transition-transform hover:-translate-y-0.5"
                      : "group mt-8 inline-flex items-center justify-center gap-2 rounded-full border border-line-strong px-6 py-3 text-[14px] text-ink transition-colors hover:border-faint hover:bg-card"
                  }
                >
                  {tier.cta.label}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </SpotlightCard>
          ))}
        </div>

        <p className="mt-8 font-mono text-[11px] leading-relaxed text-faint">
          Figures are illustrative for the AICOO Hackathon build. Aicoo&apos;s free tier allows 10
          requests per minute, so Relay keeps every call lean.
        </p>
      </section>
    </PageShell>
  );
}
