import { PageShell } from "@/components/site/PageShell";
import { SpotlightCard } from "@/components/SpotlightCard";
import { ShieldLock, Node, Hand, Check } from "@/components/icons";

export const metadata = {
  title: "Security · Relay",
  description:
    "How Relay protects your Aicoo key and your context. Server-side key storage, httpOnly cookie identity, permissioned answers, a guaranteed escalation path, and no keys in responses or logs.",
};

const PRACTICES = [
  {
    icon: ShieldLock,
    title: "Keys stay server side",
    body: "Your Aicoo key is validated on connect and stored on the server only. It is never sent to the browser, never bundled into client JavaScript, and never written to a log. Calls to a teammate's agent are signed on the server with their key, not yours.",
  },
  {
    icon: ShieldLock,
    title: "httpOnly cookie identity",
    body: "You are identified by an httpOnly session cookie set when you connect. Page scripts cannot read it, which keeps your identity out of reach of anything running in the browser. There is no token sitting in local storage for a script to lift.",
  },
  {
    icon: Node,
    title: "Permissioned context, per person",
    body: "An agent only answers from the context its owner allowed it to see. There is no shared corpus pooling everyone's documents. When you relay a question you reach one person's agent and exactly the material they chose to make answerable, nothing wider.",
  },
  {
    icon: Hand,
    title: "The escalation guarantee",
    body: "When a topic is genuinely new or sensitive, the agent stops rather than guesses. Relay marks the request escalated and notifies the human through Aicoo's send_message_to_human, with the full thread attached. A person is pulled in on the exception, with full context.",
  },
  {
    icon: ShieldLock,
    title: "Encrypted in transit",
    body: "Every request between your browser, Relay, and Aicoo travels over HTTPS. Nothing about a relay or its answer crosses the network in the clear.",
  },
  {
    icon: Check,
    title: "No keys in responses or logs",
    body: "By contract, no Aicoo key ever appears in an API response, and no key is written to a log line. The browser sees members as names, roles, and an online dot. It never sees a credential.",
  },
];

export default function SecurityPage() {
  return (
    <PageShell
      eyebrow="Security"
      title={
        <>
          Your key stays yours.
          <br />
          <span className="italic text-signal-dim">It never leaves the server.</span>
        </>
      }
      lead="Relay is built so a credential never reaches the browser, an agent only answers from permitted context, and a human is reached on the exception with the full thread."
    >
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {PRACTICES.map((p) => (
            <li key={p.title}>
              <SpotlightCard className="card-grad group h-full rounded-2xl border border-line p-7 transition-colors hover:border-line-strong sm:p-8">
                <div className="relative z-10 flex flex-col gap-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line-strong bg-raised text-signal-dim">
                    <p.icon className="h-5 w-5" />
                  </span>
                  <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-ink">
                    {p.title}
                  </h2>
                  <p className="text-[15px] leading-relaxed text-muted">{p.body}</p>
                </div>
              </SpotlightCard>
            </li>
          ))}
        </ul>

        <p className="mt-8 font-mono text-[11px] leading-relaxed text-faint">
          Aicoo OAuth is not released yet, so Relay uses the sanctioned API-key model where each
          person&apos;s own key acts on their behalf. We will adopt OAuth when Aicoo ships it.
        </p>
      </section>
    </PageShell>
  );
}
