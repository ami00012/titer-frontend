import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RequestDialog } from "@/components/marketing/request-dialog";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "How Titer actually works",
  description:
    "The judge behind every Titer score, how it's calibrated against the specific failure mode of vocabulary without substance, and what the tool honestly can't do.",
};

const NOT_LIST = [
  { title: "An AI detector", body: "Titer doesn't try to guess whether text was written by a model — it scores emotional tone, which any writer or model can hit or miss." },
  { title: "A plagiarism checker", body: "It doesn't compare your text against a database of other text." },
  { title: "A fact-checker", body: "It doesn't check whether claims in the text are true." },
  { title: "A grammar or style checker", body: "It scores whether the writing connects emotionally, not whether it's grammatically clean." },
];

const JUDGE_COMPONENTS = ["Joy", "Trust", "Urgency", "Confidence", "Warmth"];

const LIMITS = [
  "Titer measures the current draft, not intent. A genuinely caring message that's badly worded can score low; a well-worded one with nothing behind it can score higher than it deserves before you catch the pattern in the findings.",
  "The judge is an LLM call, not a fixed lookup table — the same text can score a few points differently between two runs. Treat the score as a range, not a single fixed number.",
  "Calibration today runs on a 24-sample starter corpus (8 samples across 3 categories), not yet a published, full-scale corpus. See the real numbers below — we're publishing what we actually have, not placeholder numbers.",
];

export default function HowItWorksPage() {
  return (
    <main className="mx-auto flex w-full max-w-[1180px] flex-1 flex-col px-6">
      {/* Hero */}
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-[color:var(--titer-ink)] sm:text-5xl">
          How Titer actually works
        </h1>
        <p className="max-w-xl text-lg text-[color:var(--titer-muted)]">
          One judge reads your text against five components, and the score comes back with the
          exact breakdown behind it — not a black box.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <Button size="lg" nativeButton={false} render={<Link href="/measure" />}>
            Check your Titer Score — free
          </Button>
          <RequestDialog
            mode="demo"
            trigger={
              <Button size="lg" variant="ghost" className="text-[color:var(--titer-muted)]">
                Book a demo
              </Button>
            }
          />
        </div>
      </div>

      {/* What it isn't */}
      <section className="w-full border-t border-[color:var(--titer-border)] py-24 text-left">
        <h2 className="text-2xl font-semibold text-[color:var(--titer-ink)]">What Titer Score isn&apos;t</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          {NOT_LIST.map((item) => (
            <div key={item.title} className="flex flex-col gap-1">
              <span className="font-semibold text-[color:var(--titer-ink)]">{item.title}</span>
              <p className="text-[color:var(--titer-muted)]" style={{ lineHeight: 1.6 }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why this changed */}
      <section className="w-full border-t border-[color:var(--titer-border)] py-24 text-left">
        <h2 className="text-2xl font-semibold text-[color:var(--titer-ink)]">Why this changed</h2>
        <p className="mt-4 max-w-2xl text-[color:var(--titer-muted)]" style={{ lineHeight: 1.7 }}>
          We started by trying to measure whether text was AI-written. We learned two
          things: measuring authorship reliably is genuinely hard — so we stopped
          claiming it — and measuring authorship isn&apos;t what anyone actually needed.
          What they needed was to measure whether their content was right: on-tone,
          on-policy, on-brand, visible. So we built the instrument for that.
          AI-detection is now just one signal it can flag — honestly, as something for
          a human to review, never a verdict.
        </p>
      </section>

      {/* The judge */}
      <section className="w-full border-t border-[color:var(--titer-border)] py-24 text-left">
        <h2 className="text-2xl font-semibold text-[color:var(--titer-ink)]">One judge, five components</h2>
        <div className="mt-8 flex flex-col gap-4">
          <p className="max-w-2xl text-[color:var(--titer-muted)]" style={{ lineHeight: 1.6 }}>
            A model reads the full text and scores each of five components independently, 0–100:
          </p>
          <div className="flex flex-wrap gap-2">
            {JUDGE_COMPONENTS.map((dim) => (
              <span
                key={dim}
                className="rounded-full border border-[color:var(--titer-border)] px-3 py-1 text-sm text-[color:var(--titer-ink)]"
              >
                {dim}
              </span>
            ))}
          </div>
          <p className="max-w-2xl text-[color:var(--titer-muted)]" style={{ lineHeight: 1.6 }}>
            The specific instruction that does the most work: the judge is told explicitly to
            score warmth and trust low when the text uses caring or trustworthy-sounding
            vocabulary with no concrete stakes behind it — a named person, a specific promise, a
            detail that couldn&apos;t apply to just any company. Sounding warm and being warm
            aren&apos;t the same thing, and the rubric treats them as different.
          </p>
        </div>
      </section>

      {/* Calibration */}
      <section className="w-full border-t border-[color:var(--titer-border)] py-24 text-left">
        <h2 className="text-2xl font-semibold text-[color:var(--titer-ink)]">
          Calibrated against the specific failure mode
        </h2>
        <p className="mt-4 max-w-2xl text-[color:var(--titer-muted)]" style={{ lineHeight: 1.6 }}>
          The corpus is built around three categories, not a simple good/bad split: genuinely
          resonant writing with real specificity, corporate boilerplate that deploys warmth
          vocabulary with nothing behind it, and correctly flat, informational text where a low
          score isn&apos;t a defect.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <div className="flex flex-col gap-1 rounded-lg border border-[color:var(--titer-border)] p-4">
            <span className="text-sm text-[color:var(--titer-muted)]">Genuinely resonant</span>
            <span className="text-2xl font-semibold text-[color:var(--titer-ink)]">66.9</span>
            <span className="text-xs text-[color:var(--titer-muted)]">mean score, 8 samples</span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg border border-[color:var(--titer-border)] p-4">
            <span className="text-sm text-[color:var(--titer-muted)]">Correctly flat</span>
            <span className="text-2xl font-semibold text-[color:var(--titer-ink)]">37.5</span>
            <span className="text-xs text-[color:var(--titer-muted)]">mean score, 8 samples</span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg border border-[color:var(--titer-border)] p-4">
            <span className="text-sm text-[color:var(--titer-muted)]">Warmth vocabulary, no substance</span>
            <span className="text-2xl font-semibold text-[color:var(--titer-ink)]">25.5</span>
            <span className="text-xs text-[color:var(--titer-muted)]">mean score, 8 samples</span>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-sm text-[color:var(--titer-muted)]" style={{ lineHeight: 1.6 }}>
          Zero of the 8 corporate-boilerplate samples scored in the top band. Correctly flat text
          scores higher on average than insincere warmth language, not lower — the judge
          penalizes empty vocabulary more than honest plainness.
        </p>
      </section>

      {/* Honest limits */}
      <section className="w-full border-t border-[color:var(--titer-border)] py-24 text-left">
        <h2 className="text-2xl font-semibold text-[color:var(--titer-ink)]">Honest limits</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {LIMITS.map((limit) => (
            <li key={limit} className="max-w-2xl text-[color:var(--titer-muted)]" style={{ lineHeight: 1.6 }}>
              {limit}
            </li>
          ))}
        </ul>
      </section>

      {/* Closing CTA */}
      <section className="flex w-full flex-col items-center gap-4 border-t border-[color:var(--titer-border)] py-24 text-center">
        <div className="flex gap-3">
          <Button size="lg" nativeButton={false} render={<Link href="/measure" />}>
            Check your Titer Score — free
          </Button>
          <RequestDialog
            mode="demo"
            trigger={
              <Button size="lg" variant="outline" className="rounded-full">
                Book a demo
              </Button>
            }
          />
        </div>
      </section>
    </main>
  );
}
