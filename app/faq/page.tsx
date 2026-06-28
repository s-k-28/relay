import Link from "next/link";
import { PageShell } from "@/components/site/PageShell";
import { SpotlightCard } from "@/components/SpotlightCard";

export const metadata = {
  title: "FAQ · Relay",
  description:
    "Answers on how Relay stores your Aicoo key, what another person's agent can see, when a question escalates to the human, and where your data lives.",
};

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "How is my Aicoo key stored?",
    a: (
      <>
        Server side, and only server side. When you connect, Relay validates the key against Aicoo
        and writes it to storage that the browser never reads. Your identity in the app is an
        httpOnly cookie, so the key itself is not in the page, not in the JavaScript bundle, and not
        in any log line. Requests to a teammate are signed with their key on the server, never yours,
        and never in the response.
      </>
    ),
  },
  {
    q: "What can another person's agent see?",
    a: (
      <>
        Only the context that person allowed it to see. Each agent answers from its owner&apos;s
        permitted Aicoo context, nothing wider. When you relay a question, you are reaching one
        person&apos;s agent and the material they chose to make answerable. There is no shared corpus
        that pools everyone&apos;s documents together.
      </>
    ),
  },
  {
    q: "When does it escalate to a human?",
    a: (
      <>
        When the topic is genuinely new or sensitive. If the agent cannot answer with confidence from
        permitted context, it stops rather than guesses. Relay marks the request escalated and
        notifies the human through Aicoo&apos;s send_message_to_human, with the full thread attached so
        they have the question and everything the agent already tried. The person becomes the
        exception, not the default.
      </>
    ),
  },
  {
    q: "Where is my data stored?",
    a: (
      <>
        In Upstash Redis. Member records, relay requests, and message threads live there. It was
        chosen for fast reads and one-click provisioning on Vercel. Your Aicoo key is part of the
        member record on the server and is never returned to a client.
      </>
    ),
  },
  {
    q: "Do you support Google or GitHub login?",
    a: (
      <>
        Today your identity is your Aicoo connection. You connect your agent once and a session
        cookie keeps you signed in. Broader OAuth, including Google and GitHub, arrives when Aicoo
        releases its own OAuth. Until then Relay uses the sanctioned API-key model, where each
        person&apos;s own key acts on their behalf.
      </>
    ),
  },
  {
    q: "What does it cost?",
    a: (
      <>
        Relay starts free for small teams and scales by seat. See the{" "}
        <Link href="/pricing" className="text-signal-dim underline-offset-4 hover:underline">
          pricing page
        </Link>{" "}
        for the three tiers. Figures shown there are illustrative for the hackathon build.
      </>
    ),
  },
  {
    q: "How is this different from a shared Q&A bot?",
    a: (
      <>
        A shared bot answers from one knowledge base. Relay routes to a specific person&apos;s permitted
        context. The unit is a person, not a corpus. You ask the colleague who owns the answer, their
        agent responds, and only that person is pulled in if the agent cannot help. It is
        person-to-person agent routing, not one big assistant standing in for the whole company.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <PageShell
      eyebrow="Questions, answered"
      title={
        <>
          Frequently asked,
          <br />
          <span className="italic text-signal-dim">clearly answered.</span>
        </>
      }
      lead="How Relay handles your Aicoo key, what an agent can and cannot see, when a human gets pulled in, and where your data lives."
    >
      <section className="mx-auto w-full max-w-3xl px-6 py-16">
        <dl className="flex flex-col gap-4">
          {FAQS.map((item) => (
            <SpotlightCard
              key={item.q}
              className="card-grad rounded-2xl border border-line p-6 transition-colors hover:border-line-strong sm:p-8"
            >
              <div className="relative z-10">
                <dt className="text-[18px] font-semibold tracking-[-0.01em] text-ink">{item.q}</dt>
                <dd className="mt-3 text-[15px] leading-relaxed text-muted">{item.a}</dd>
              </div>
            </SpotlightCard>
          ))}
        </dl>
      </section>
    </PageShell>
  );
}
