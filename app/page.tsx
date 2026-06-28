import Link from "next/link";
import { NetworkGraph } from "@/components/NetworkGraph";
import { Wordmark, RelayMark } from "@/components/brand";
import { ArrowRight, Bolt, Hand, Node, ShieldLock } from "@/components/icons";

const STEPS = [
  {
    n: "01",
    title: "Connect your agent",
    body: "Add your name, role, and Aicoo key once. We validate it against Aicoo and you become a node the network can reach. The key is stored server side and never returns to the browser.",
    icon: ShieldLock,
  },
  {
    n: "02",
    title: "Browse the network",
    body: "Every teammate shows up as a callable agent. A name, a role, an online dot. You see who you can ask, never a single credential.",
    icon: Node,
  },
  {
    n: "03",
    title: "Relay a question",
    body: "Ask a person's agent directly. It answers from the context that person allowed it to see, grounded and specific, usually inside a couple of seconds.",
    icon: Bolt,
  },
  {
    n: "04",
    title: "Escalate the exception",
    body: "When the topic is genuinely new or sensitive, the agent steps back and notifies the human with the full thread attached. The person becomes the exception, not the default.",
    icon: Hand,
  },
];

const CONTRASTS = [
  {
    label: "Against chat",
    body: "Slack and Teams assume a person reads every message. Relay answers before anyone is interrupted, and reaches a human only on the exception.",
  },
  {
    label: "Against Q&A bots",
    body: "Glean and Notion AI answer from one shared corpus. Relay routes to a specific person's permitted context. The unit is a person, not a knowledge base.",
  },
  {
    label: "Against scheduling",
    body: "Calendly books a human's time. Relay reaches a human's knowledge first, and asks for their time only when the agent truly cannot help.",
  },
];

export default function Landing() {
  return (
    <div className="relative flex min-h-full flex-col">
      {/* top bar */}
      <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <Wordmark />
          <nav className="flex items-center gap-7 text-sm text-muted">
            <a href="#how" className="hidden transition-colors hover:text-ink sm:inline">
              How it works
            </a>
            <a href="#why" className="hidden transition-colors hover:text-ink sm:inline">
              Why Relay
            </a>
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

      <main className="flex-1">
        {/* hero */}
        <section className="relative overflow-hidden">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24">
            <div className="anim-rise">
              <p className="eyebrow mb-6 flex items-center gap-2.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal" />
                Agent network, built on Aicoo
              </p>
              <h1 className="font-serif text-[clamp(2.6rem,6vw,4.6rem)] font-medium leading-[1.02] tracking-[-0.02em] text-ink">
                Your team, answered
                <br />
                by agents. Humans,
                <br />
                <span className="italic text-signal-dim">only when it counts.</span>
              </h1>
              <p className="mt-7 max-w-xl text-[17px] leading-relaxed text-muted">
                Knowledge work runs on interruptions, and most of them are questions already
                answered somewhere the asker cannot see. Relay connects each person's Aicoo agent to
                the network. A teammate asks, the agent answers in seconds from permitted context,
                and the human is pulled in only for the genuinely new or sensitive.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  href="/app"
                  className="group inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3 text-[15px] font-semibold text-bg transition-transform hover:-translate-y-0.5"
                >
                  Connect your agent
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="#how"
                  className="inline-flex items-center gap-2 rounded-full border border-line-strong px-6 py-3 text-[15px] text-ink transition-colors hover:border-faint hover:bg-card"
                >
                  See the flow
                </a>
              </div>
              <p className="mt-6 flex items-center gap-2 text-[13px] text-faint">
                <ShieldLock className="h-4 w-4 text-faint" />
                Your Aicoo key stays server side. It never appears in the browser or any log.
              </p>
            </div>

            {/* network centerpiece */}
            <div className="anim-fade relative">
              <div className="grain relative overflow-hidden rounded-2xl border border-line bg-panel/60 p-2 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)]">
                <div className="relative z-10 rounded-xl border border-line/60 bg-bg/40 p-4">
                  <div className="mb-1 flex items-center justify-between px-2">
                    <span className="eyebrow">Live network</span>
                    <span className="font-mono text-[11px] text-faint">6 agents · 5 online</span>
                  </div>
                  <NetworkGraph className="w-full" />
                  <div className="rule-fade mx-2 mb-3" />
                  <p className="px-2 pb-1 font-mono text-[11px] leading-relaxed text-faint">
                    A question relays from your node, lands on a teammate&apos;s agent, and returns
                    an answer. No tap on the shoulder.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="rule-fade mx-auto max-w-6xl" />
        </section>

        {/* how it works */}
        <section id="how" className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-20">
          <div className="mb-12 max-w-2xl">
            <p className="eyebrow mb-4">How it works</p>
            <h2 className="font-serif text-[clamp(1.9rem,4vw,2.9rem)] font-medium leading-tight tracking-[-0.01em] text-ink">
              Four steps. Then the interruptions stop.
            </h2>
          </div>
          <ol className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {STEPS.map((s) => (
              <li key={s.n} className="card-grad group flex flex-col gap-4 p-7 sm:p-8">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[13px] text-signal-dim">{s.n}</span>
                  <s.icon className="h-5 w-5 text-faint transition-colors group-hover:text-ink" />
                </div>
                <h3 className="text-[19px] font-semibold tracking-[-0.01em] text-ink">{s.title}</h3>
                <p className="text-[15px] leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* why different */}
        <section id="why" className="scroll-mt-20 border-y border-line bg-panel/40">
          <div className="mx-auto w-full max-w-6xl px-6 py-20">
            <div className="mb-12 max-w-2xl">
              <p className="eyebrow mb-4">Why Relay is different</p>
              <h2 className="font-serif text-[clamp(1.9rem,4vw,2.9rem)] font-medium leading-tight tracking-[-0.01em] text-ink">
                A network of people&apos;s agents, not one shared bot.
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {CONTRASTS.map((c) => (
                <div key={c.label} className="flex flex-col gap-3 border-t border-line-strong pt-5">
                  <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-signal-dim">
                    {c.label}
                  </span>
                  <p className="text-[15px] leading-relaxed text-muted">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* closing impact */}
        <section className="mx-auto w-full max-w-6xl px-6 py-24">
          <div className="grain relative overflow-hidden rounded-3xl border border-line bg-card p-10 text-center sm:p-16">
            <div className="relative z-10">
              <RelayMark className="mx-auto mb-7 h-9 w-9 text-signal" />
              <h2 className="mx-auto max-w-3xl font-serif text-[clamp(1.8rem,4vw,3rem)] font-medium leading-[1.1] tracking-[-0.01em] text-ink">
                Every answer here is one a teammate did not have to stop and give.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-muted">
                Connect your agent, browse the network, and relay your first question. The whole
                loop takes under a minute.
              </p>
              <Link
                href="/app"
                className="group mt-9 inline-flex items-center gap-2 rounded-full bg-signal px-7 py-3 text-[15px] font-semibold text-bg transition-transform hover:-translate-y-0.5"
              >
                Connect your agent
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* footer */}
      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center">
          <div>
            <Wordmark />
            <p className="mt-3 max-w-sm font-serif text-[17px] italic leading-snug text-muted">
              The interruption layer for teams, replaced by agents.
            </p>
          </div>
          <p className="font-mono text-[11px] leading-relaxed text-faint sm:text-right">
            Built on Aicoo for the AICOO Hackathon.
            <br />
            Person to person agent routing.
          </p>
        </div>
      </footer>
    </div>
  );
}
