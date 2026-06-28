import type { ReactNode } from "react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

// Shared layout for every content page. Renders the site chrome plus a
// consistent hero band, then the page body. Keeps marketing and legal pages
// cohesive with the landing without each one re-stating the header pattern.
export function PageShell({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-full flex-col">
      <Nav />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="aurora" aria-hidden="true" />
          <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-12 pt-16 lg:pt-20">
            <div className="anim-rise max-w-3xl">
              <p className="eyebrow mb-5 flex items-center gap-2.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal" />
                {eyebrow}
              </p>
              <h1 className="font-serif text-[clamp(2.2rem,5vw,3.6rem)] font-medium leading-[1.04] tracking-[-0.02em] text-ink">
                {title}
              </h1>
              {lead && (
                <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-muted">{lead}</p>
              )}
            </div>
          </div>
          <div className="rule-fade mx-auto max-w-6xl" />
        </section>

        {children}
      </main>
      <Footer />
    </div>
  );
}
