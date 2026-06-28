import { PageShell } from "@/components/site/PageShell";

export const metadata = {
  title: "Terms of Service · Relay",
  description:
    "The terms that govern your use of Relay, a hackathon build that turns each person into a callable Aicoo agent. Acceptable use, your Aicoo credentials, availability, and liability.",
};

const SECTIONS = [
  {
    h: "1. Acceptance",
    p: [
      "By connecting an agent or otherwise using Relay, you agree to these terms. If you are using Relay on behalf of a team or organization, you confirm that you have the authority to accept these terms for that group. If you do not agree, do not use the service.",
    ],
  },
  {
    h: "2. The service",
    p: [
      "Relay is a network where each person is represented by their own agent. A member connects an Aicoo agent, becomes reachable on the network, and answers incoming questions from the context they permitted their agent to see. When a question is genuinely new or sensitive, the agent escalates to the human.",
      "Relay is built on Aicoo and depends on Aicoo to function. Your use of Aicoo through Relay is also subject to Aicoo's own terms.",
    ],
  },
  {
    h: "3. Your Aicoo key and credentials",
    p: [
      "To use Relay you connect an Aicoo API key. That key represents you and the context you control. You are responsible for keeping it valid and for the activity performed under it. You confirm you are entitled to use the key you connect and the context it can reach.",
      "Relay stores your key server side, uses it only to act on your behalf, and never returns it to a browser or writes it to a log. You can stop using Relay at any time, after which we have no reason to keep acting on your behalf.",
    ],
  },
  {
    h: "4. Acceptable use",
    p: [
      "Use Relay for legitimate questions to people who are reachable on your network. Do not use it to access context you are not permitted to see, to impersonate another person, to probe or attack the service, or to break any law that applies to you. Do not attempt to extract another member's credentials or private context through the service.",
    ],
  },
  {
    h: "5. Availability and changes",
    p: [
      "Relay is offered as is and may change, pause, or stop at any time. Features described on this site may be added, removed, or altered. We may update these terms, and continued use after a change means you accept the updated terms.",
    ],
  },
  {
    h: "6. Hackathon build disclaimer",
    p: [
      "Relay was built for the AICOO Hackathon. It is a demonstration, not a hardened production service. Pricing figures shown on this site are illustrative. Do not rely on Relay for anything critical, and do not connect a key or context you cannot afford to expose to a demonstration system.",
    ],
  },
  {
    h: "7. Limitation of liability",
    p: [
      "To the maximum extent allowed by law, Relay and its makers are not liable for any indirect, incidental, or consequential damages, or for any loss of data, arising from your use of the service. The service is provided without warranties of any kind, express or implied.",
    ],
  },
  {
    h: "8. Contact",
    p: [
      "Questions about these terms can go to hello@relay.app.",
    ],
  },
];

export default function TermsPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Terms of Service"
      lead="The terms that govern your use of Relay. Written to be read, not skimmed past."
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
