import Link from "next/link";
import { PageShell } from "@/components/site/PageShell";
import { ArrowRight } from "@/components/icons";

export const metadata = {
  title: "About · Relay",
  description:
    "Relay exists to remove the interruption tax from knowledge work. Each person becomes a callable Aicoo agent, so teammates get answers in seconds and humans are pulled in only on the exception.",
};

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="About"
      title={
        <>
          The interruption is the
          <br />
          <span className="italic text-signal-dim">tax. We remove it.</span>
        </>
      }
      lead="Relay is a network where each person is represented by their own agent, so the answer arrives before anyone has to stop what they are doing."
    >
      <section className="mx-auto w-full max-w-3xl px-6 py-16">
        <div className="flex flex-col gap-12">
          <div>
            <h2 className="font-serif text-[1.7rem] font-medium tracking-[-0.01em] text-ink">
              The problem
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">
              Knowledge work runs on interruptions. A quick question makes the asker wait and forces
              the answerer to drop their focus, and most of those questions are already answered
              somewhere the asker cannot see. Teams have tried wikis, shared docs, and search, and
              they still tap a person on the shoulder, because asking a human is easier than hunting
              for the answer.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-[1.7rem] font-medium tracking-[-0.01em] text-ink">
              Why a network of people, not one bot
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">
              A single shared assistant answers from one pooled corpus and flattens everyone into the
              same knowledge base. Real teams do not work that way. The person who owns the answer is
              specific, and so is the context they are willing to share. Relay routes to that
              person&apos;s
              agent and the material they permitted, not to a company-wide bot. The unit is a person.
            </p>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">
              When the agent can answer, it does, in seconds, grounded in permitted context. When the
              topic is genuinely new or sensitive, it steps back and notifies the human with the full
              thread. The human becomes the exception, not the default. That is the whole idea.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-[1.7rem] font-medium tracking-[-0.01em] text-ink">
              Built on Aicoo
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">
              Relay exists because Aicoo gives every person a permissioned, callable agent. Each
              member connects their own Aicoo key once. From then on their agent fields questions on
              their behalf, grounded in the context they allowed it to see, and escalates through
              Aicoo when a human is truly needed. Relay cannot exist without Aicoo as its engine, and
              that is exactly the point.
            </p>
          </div>

          <div className="rule-fade" />

          <div>
            <p className="font-serif text-[1.5rem] italic leading-snug text-ink">
              Every answer here is one a teammate did not have to stop and give.
            </p>
            <Link
              href="/app"
              className="shine group mt-7 inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3 text-[15px] font-semibold text-bg transition-transform hover:-translate-y-0.5"
            >
              Connect your agent
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
