import type { Metadata } from "next";
import { SolutionPageTemplate } from "@/components/marketing/solution-page-template";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Titer for content teams",
  description:
    "Set a house standard and block publish when a draft crosses your line — emotional tone, brand voice, or both.",
};

const TOOL_MAPPINGS = [
  {
    tool: "Titer Score",
    description: "Score every draft the same way, before it goes to an editor.",
  },
  {
    tool: "Custom dimensions",
    description: "Measure brand voice, not just emotional tone — name the dimension that matters to your team.",
  },
  {
    tool: "Titer Score, at scale",
    description: "Batch-check published pages against the same standard search engines use, worst-first.",
  },
];

const WORKFLOW = [
  { step: "1", title: "Set a threshold", body: "A score a draft has to clear before it publishes." },
  { step: "2", title: "Writers see the score while editing", body: "The score and the findings, not just a pass/fail at the end." },
  { step: "3", title: "Nothing crosses the line unnoticed", body: "A flagged draft still publishes if someone decides to let it through." },
];

const REASONS = [
  "Give writers a standard to write to, not just feedback after the fact.",
  "Catch flat, generic tone and off-brand voice in the same pass.",
  "Make 'sounds like us' a score, not a vibe.",
];

export default function ContentTeamsSolutionPage() {
  return (
    <SolutionPageTemplate
      headline="A house standard every draft has to clear"
      subhead="Set a score threshold and block publish when a draft crosses your line — emotional tone, brand voice, or both."
      problem="Every writer and every AI tool on a team produces something slightly different, and by the time an editor catches a problem it's often already scheduled. Without a shared standard, 'does this sound like us' comes down to whoever happens to read it that day."
      toolMappings={TOOL_MAPPINGS}
      workflow={WORKFLOW}
      reasons={REASONS}
      pricingTier={{ name: "Studio", price: "$99/mo", note: "Custom dimensions plus site-wide audits." }}
    />
  );
}
