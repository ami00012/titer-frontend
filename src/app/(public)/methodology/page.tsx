import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { TITER_SCORE_COMPONENTS, CURRENT_RUBRIC_VERSION } from "@/lib/titer-score";

export const metadata: Metadata = {
  title: "Methodology",
  description: "How the Titer Score is calculated and how Proof of Function runs are measured.",
};

export default function MethodologyPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold">Methodology</h1>
        <p className="text-secondary-foreground">
          Titer measures the asset before it brokers the deal. Every listing carries a published Titer Score and,
          where applicable, a Proof of Function run — both computed the same way every time, described here in full.
        </p>
      </div>

      <section id="titer-score" className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">The Titer Score (rubric {CURRENT_RUBRIC_VERSION})</h2>
        <p className="text-secondary-foreground">
          An integer from 0–100 across five weighted components. It is computed by a person against this rubric and
          stored with a short justification — never inferred, never estimated, and never shown as a full score when
          only partial information is available. A listing with no score renders <strong>Unscored</strong>, in grey.
        </p>
        <div className="flex flex-col gap-3">
          {TITER_SCORE_COMPONENTS.map((c) => (
            <Card key={c.key}>
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium">{c.label}</div>
                  <div className="text-sm text-secondary-foreground">{COMPONENT_DESCRIPTIONS[c.key]}</div>
                </div>
                <div className="shrink-0 text-sm font-medium text-muted-foreground">0–{c.max}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-secondary-foreground">
          Grades: <strong>A</strong> ≥80 · <strong>B</strong> 65–79 · <strong>C</strong> 50–64 · <strong>D</strong> &lt;50.
        </p>
      </section>

      <section id="proof-of-function" className="flex flex-col gap-4 border-t border-border pt-8">
        <h2 className="text-xl font-semibold">Proof of Function</h2>
        <p className="text-secondary-foreground">
          For AI agents and APIs, we run the asset against a fixed request set in a sandbox and publish the result:
          success rate, p50/p95 latency, and cost per task at the listing&apos;s current prices, plus an error
          taxonomy. The run is timestamped and versioned by harness — we link to this page, not to raw logs, because
          the harness and request set are what make the number comparable across listings.
        </p>
      </section>

      <section id="model-risk" className="flex flex-col gap-4 border-t border-border pt-8">
        <h2 className="text-xl font-semibold">The Model Risk block</h2>
        <p className="text-secondary-foreground">
          Every AI agent listing, and any digital business with inference in its cost of goods sold, discloses its
          primary and fallback model provider, inference cost as a percentage of revenue, gross margin if token
          prices doubled, and what the moat actually is — a prompt, proprietary data, a workflow, distribution, or an
          integration. No incumbent marketplace prices this risk; it&apos;s the thing every AI-asset buyer is
          actually afraid of, so we make the seller answer it in plain English before a buyer has to ask.
        </p>
      </section>
    </div>
  );
}

const COMPONENT_DESCRIPTIONS: Record<string, string> = {
  revenueDurability: "Months of revenue history, MoM churn, top-customer concentration, contract vs. self-serve.",
  modelDependencyRisk:
    "Inference as % of COGS, single vs. multi provider, whether the moat is a prompt or data/workflow/distribution, gross margin at 2x token price.",
  transferComplexity: "Count of third-party accounts to move, personal-brand dependency, whether a runbook is documented.",
  operationalLoad: "Founder hours/week, manual steps, on-call surface.",
  evidenceStrength: "What was actually verified, not claimed.",
};
