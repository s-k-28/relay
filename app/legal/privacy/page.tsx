import { PageShell } from "@/components/site/PageShell";

export const metadata = {
  title: "Privacy Policy · Relay",
  description:
    "What Relay collects, how it is used, and where it is stored. Your Aicoo key stays server side, your data lives in Upstash Redis, and we do not sell it.",
};

const SECTIONS = [
  {
    h: "1. What we collect",
    p: [
      "When you connect an agent, we collect the name and role you enter and the Aicoo key you provide. The key is stored server side and used only to act on your behalf. We also collect the questions you relay and the answers your agent returns, along with the message threads those exchanges create.",
    ],
  },
  {
    h: "2. How we use it",
    p: [
      "We use this information to route questions to the right person's agent and return grounded answers. With your member context, resolved questions and answers can be written back to your Aicoo context through accumulate, so a repeat of the same question is handled faster. We use thread data to show request history and to power the escalation path when a human is needed.",
    ],
  },
  {
    h: "3. Where it is stored",
    p: [
      "Member records, relay requests, and message threads are stored in Upstash Redis. Your Aicoo key is part of your member record on the server. It is never returned to a browser, never bundled into client code, and never written to a log.",
    ],
  },
  {
    h: "4. Retention",
    p: [
      "We keep your data while you use Relay so the network can reach you and your history stays intact. Because Relay is a hackathon build, data may be cleared when the demonstration environment is reset. If you want your member record and key removed, contact us and we will delete them.",
    ],
  },
  {
    h: "5. We do not sell your data",
    p: [
      "We do not sell your data and we do not share it with third parties for their own marketing. The one external system your data reaches is Aicoo, which Relay uses as its engine to answer and escalate on your behalf, subject to Aicoo's own privacy terms.",
    ],
  },
  {
    h: "6. Your choices",
    p: [
      "You choose what context your Aicoo agent can answer from, so you control what another member's question can reach. You can stop using Relay at any time, and you can ask us to delete your member record and key.",
    ],
  },
  {
    h: "7. Contact",
    p: [
      "Privacy questions and deletion requests can go to siddarthakodithyala28@gmail.com.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Privacy Policy"
      lead="What Relay collects, how it is used, and where it lives. Plain language, no surprises."
    >
      <section className="mx-auto w-full max-w-2xl px-6 py-16">
        <p className="font-mono text-[12px] text-faint">Last updated June 2026</p>
        <div className="mt-10 flex flex-col gap-10">
          {SECTIONS.map((s) => (
            <div key={s.h}>
              <h2 className="font-serif text-[1.5rem] font-medium tracking-[-0.01em] text-ink">
                {s.h}
              </h2>
              {s.p.map((para, i) => (
                <p key={i} className="mt-3 text-[15px] leading-[1.75] text-muted">
                  {para}
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
