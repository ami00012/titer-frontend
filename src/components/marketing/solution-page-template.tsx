import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RequestDialog } from "@/components/marketing/request-dialog";
import { LocalizedPrice } from "@/components/marketing/localized-price";

interface ToolMapping {
  tool: string;
  description: string;
}

interface WorkflowStep {
  step: string;
  title: string;
  body: string;
}

export interface SolutionPageTemplateProps {
  headline: string;
  subhead: string;
  problem: string;
  toolMappings: ToolMapping[];
  workflow: WorkflowStep[];
  reasons: string[];
  pricingTier: { name: string; price: { prefix?: string; amount: number; suffix?: string }; note?: string };
  /** Compliance's audit-trail / honesty callout; omitted on other segments. */
  extraSection?: ReactNode;
}

// One template for all five segments (/solutions/*). These buyers don't
// self-serve, so -- unlike the rest of the site -- Book a demo is the
// primary CTA here, with the free scanner as the self-serve fallback.
export function SolutionPageTemplate({
  headline,
  subhead,
  problem,
  toolMappings,
  workflow,
  reasons,
  pricingTier,
  extraSection,
}: SolutionPageTemplateProps) {
  return (
    <main className="mx-auto flex w-full max-w-[1180px] flex-1 flex-col px-6">
      {/* Hero */}
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-[color:var(--titer-ink)] sm:text-5xl">
          {headline}
        </h1>
        <p className="max-w-xl text-lg text-[color:var(--titer-muted)]">{subhead}</p>
        <div className="flex items-center gap-3 pt-2">
          <RequestDialog mode="demo" trigger={<Button size="lg">Book a demo</Button>} />
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/measure" />}
            className="rounded-full"
          >
            Try the free scanner
          </Button>
        </div>
      </div>

      {/* Problem today */}
      <section className="w-full border-t border-[color:var(--titer-border)] py-24 text-left">
        <h2 className="text-lg font-semibold text-[color:var(--titer-ink)]">The problem today</h2>
        <p
          className="mt-4 max-w-2xl text-xl text-[color:var(--titer-ink)]"
          style={{ lineHeight: 1.6 }}
        >
          {problem}
        </p>
      </section>

      {/* What Titer does for you */}
      <section className="w-full border-t border-[color:var(--titer-border)] py-24 text-left">
        <h2 className="text-2xl font-semibold text-[color:var(--titer-ink)]">
          What Titer does for you
        </h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {toolMappings.map((mapping) => (
            <div key={mapping.tool} className="flex flex-col gap-2">
              <span className="font-semibold text-[color:var(--titer-ink)]">{mapping.tool}</span>
              <p className="text-[color:var(--titer-muted)]" style={{ lineHeight: 1.6 }}>
                {mapping.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow walkthrough */}
      <section className="w-full border-t border-[color:var(--titer-border)] py-24 text-left">
        <h2 className="text-2xl font-semibold text-[color:var(--titer-ink)]">How it works</h2>
        <div className="mt-8 flex flex-col gap-8">
          {workflow.map((item) => (
            <div key={item.step} className="flex gap-4">
              <span className="text-sm text-[color:var(--titer-muted)]">{item.step}</span>
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-[color:var(--titer-ink)]">{item.title}</span>
                <p className="text-[color:var(--titer-muted)]" style={{ lineHeight: 1.6 }}>
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {extraSection}

      {/* Reasons / outcomes */}
      <section className="w-full border-t border-[color:var(--titer-border)] py-24 text-left">
        <h2 className="text-lg font-semibold text-[color:var(--titer-ink)]">Outcomes</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {reasons.map((reason) => (
            <li key={reason} className="max-w-2xl text-[color:var(--titer-muted)]" style={{ lineHeight: 1.6 }}>
              {reason}
            </li>
          ))}
        </ul>
      </section>

      {/* Pricing tier */}
      <section className="w-full border-t border-[color:var(--titer-border)] py-24 text-left">
        <div className="flex flex-col gap-2 rounded-2xl border border-[color:var(--titer-border)] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-sm text-[color:var(--titer-muted)]">Built for this</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-semibold text-[color:var(--titer-ink)]">
                {pricingTier.name}
              </span>
              <span className="text-[color:var(--titer-muted)]">
                <LocalizedPrice {...pricingTier.price} />
              </span>
            </div>
            {pricingTier.note ? (
              <p className="mt-1 text-sm text-[color:var(--titer-muted)]">{pricingTier.note}</p>
            ) : null}
          </div>
          <Button nativeButton={false} render={<Link href="/pricing" />} className="rounded-full">
            See full pricing
          </Button>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="flex w-full flex-col items-center gap-4 border-t border-[color:var(--titer-border)] py-24 text-center">
        <div className="flex gap-3">
          <RequestDialog mode="demo" trigger={<Button size="lg">Book a demo</Button>} />
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/measure" />}
            className="rounded-full"
          >
            Try the free scanner
          </Button>
        </div>
      </section>
    </main>
  );
}
