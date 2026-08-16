import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TiterDial, type TiterDirection } from "@/components/titer/titer-dial";
import { LocalizedPrice } from "@/components/marketing/localized-price";

interface FaqEntry {
  q: string;
  a: string;
}

export interface ToolPageTemplateProps {
  name: string;
  heroTagline: string;
  dial: { score: number; direction: TiterDirection };
  heroPrimary: ReactElement;
  heroSecondary: ReactElement;
  problem: string;
  howItWorksTitle: string;
  howItWorksVisual: ReactNode;
  reasons: string[];
  whoItsFor: string[];
  pricing: { price: { prefix?: string; amount: number; suffix?: string }; note?: string };
  faq: FaqEntry[];
  closingPrimary: ReactElement;
  closingSecondary: ReactElement;
}

// One template, three fills (score/quality/visibility) -- see src/app/product/*/page.tsx.
// Reuses TiterDial and Button; no new component shapes invented per the design authority.
export function ToolPageTemplate({
  name,
  heroTagline,
  dial,
  heroPrimary,
  heroSecondary,
  problem,
  howItWorksTitle,
  howItWorksVisual,
  reasons,
  whoItsFor,
  pricing,
  faq,
  closingPrimary,
  closingSecondary,
}: ToolPageTemplateProps) {
  return (
    <main className="mx-auto flex w-full max-w-[1180px] flex-1 flex-col px-6">
      {/* Hero */}
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--titer-ink)] sm:text-5xl">
          {name}
        </h1>
        <p className="max-w-xl text-lg text-[color:var(--titer-muted)]">{heroTagline}</p>
        <TiterDial score={dial.score} direction={dial.direction} size={120} className="my-4" />
        <div className="flex items-center gap-3 pt-2">
          {heroPrimary}
          {heroSecondary}
        </div>
      </div>

      {/* Problem */}
      <section className="w-full border-t border-[color:var(--titer-border)] py-24 text-left">
        <p
          className="mx-auto max-w-2xl text-xl text-[color:var(--titer-ink)]"
          style={{ lineHeight: 1.6 }}
        >
          {problem}
        </p>
      </section>

      {/* How it works */}
      <section className="w-full border-t border-[color:var(--titer-border)] py-24 text-left">
        <h2 className="text-2xl font-semibold text-[color:var(--titer-ink)]">{howItWorksTitle}</h2>
        <div className="mt-8">{howItWorksVisual}</div>
      </section>

      {/* Reasons + who it's for */}
      <section className="grid w-full gap-12 border-t border-[color:var(--titer-border)] py-24 text-left sm:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-[color:var(--titer-ink)]">Why teams use it</h2>
          <ul className="flex flex-col gap-3">
            {reasons.map((reason) => (
              <li key={reason} className="text-[color:var(--titer-muted)]" style={{ lineHeight: 1.6 }}>
                {reason}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-[color:var(--titer-ink)]">Who it&apos;s for</h2>
          <ul className="flex flex-col gap-3">
            {whoItsFor.map((who) => (
              <li key={who} className="text-[color:var(--titer-muted)]" style={{ lineHeight: 1.6 }}>
                {who}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pricing snippet */}
      <section className="w-full border-t border-[color:var(--titer-border)] py-24 text-left">
        <div className="flex flex-col gap-2 rounded-2xl border border-[color:var(--titer-border)] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-xl font-semibold text-[color:var(--titer-ink)]">
              <LocalizedPrice {...pricing.price} />
            </span>
            {pricing.note ? (
              <p className="mt-1 text-sm text-[color:var(--titer-muted)]">{pricing.note}</p>
            ) : null}
          </div>
          <Button nativeButton={false} render={<Link href="/pricing" />} className="rounded-full">
            See full pricing
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full border-t border-[color:var(--titer-border)] py-24 text-left">
        <h2 className="text-2xl font-semibold text-[color:var(--titer-ink)]">Questions</h2>
        <div className="mt-8 flex flex-col">
          {faq.map((entry) => (
            <div
              key={entry.q}
              className="flex flex-col gap-2 border-t border-[color:var(--titer-border)] py-6 first:border-t-0 first:pt-0"
            >
              <span className="font-semibold text-[color:var(--titer-ink)]">{entry.q}</span>
              <p className="max-w-2xl text-[color:var(--titer-muted)]" style={{ lineHeight: 1.6 }}>
                {entry.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="flex w-full flex-col items-center gap-4 border-t border-[color:var(--titer-border)] py-24 text-center">
        <div className="flex gap-3">
          {closingPrimary}
          {closingSecondary}
        </div>
      </section>
    </main>
  );
}
