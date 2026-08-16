import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { SolutionPageTemplate } from "@/components/marketing/solution-page-template";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Titer for compliance",
  description:
    "Turn policy into measurable dimensions, with an audit trail for every score, flag, and override. Titer measures and flags — people decide.",
};

const TOOL_MAPPINGS = [
  {
    tool: "Policy as dimensions",
    description: "Each policy line becomes a measurable dimension — disclosure language, brand voice, tone — scored the same way emotional tone is.",
  },
  {
    tool: "Audit trail",
    description: "Every score, finding, and override is logged with a timestamp, so a decision can be reconstructed later.",
  },
  {
    tool: "Human review, not a verdict",
    description: "A flagged score doesn't block or auto-reject anything. It's a signal for a person to review.",
  },
];

const WORKFLOW = [
  { step: "1", title: "Define the dimensions", body: "Turn your existing policy into dimensions Titer can measure — disclosure language, brand voice, tone." },
  { step: "2", title: "Content is measured, flagged, reviewed", body: "A score triggers a flag. A person makes the call. Titer doesn't make it for them." },
  { step: "3", title: "Every step is logged", body: "The measurement, the flag, and the override — all timestamped, all auditable." },
];

const REASONS = [
  "Show what was checked, not just what was decided.",
  "Give reviewers a specific reason to look, instead of a blanket policy to re-read.",
  "Keep a record that holds up when someone asks why a piece was approved.",
];

function HonestyCallout() {
  return (
    <section className="w-full border-t border-[color:var(--titer-border)] py-24 text-left">
      <Card
        className="max-w-2xl p-6"
        style={{ borderLeft: "3px solid var(--titer-ink)" }}
      >
        <span className="text-sm font-semibold text-[color:var(--titer-ink)]">Not a determination</span>
        <p className="mt-2 text-[color:var(--titer-muted)]" style={{ lineHeight: 1.6 }}>
          Titer measures patterns and flags them for review. It does not determine compliance,
          and a score is never a verdict — the record shows what was measured and who reviewed
          it, not an automated ruling.
        </p>
      </Card>
    </section>
  );
}

export default function ComplianceSolutionPage() {
  return (
    <SolutionPageTemplate
      headline="A record of what was measured, flagged, and reviewed"
      subhead="Turn your content policy into dimensions Titer checks automatically — with an audit trail for every score."
      problem="Content policy usually lives in a doc nobody rereads. When something slips through — a tone-deaf press release, an off-brand support reply — there's no record of what was checked, only who gets blamed after. Compliance and legal end up reconstructing decisions after the fact instead of before."
      toolMappings={TOOL_MAPPINGS}
      workflow={WORKFLOW}
      reasons={REASONS}
      pricingTier={{ name: "Compliance Starter", price: { amount: 299, suffix: "/mo" }, note: "3 seats, 3 policies, 500 checks a month, all 3 policy packs." }}
      extraSection={<HonestyCallout />}
    />
  );
}
