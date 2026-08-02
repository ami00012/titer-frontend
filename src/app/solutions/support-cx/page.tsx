import type { Metadata } from "next";
import { SolutionPageTemplate } from "@/components/marketing/solution-page-template";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Titer for support & CX",
  description:
    "Score every AI-drafted reply for tone before it sends, via API — no separate tool for agents to open.",
};

const TOOL_MAPPINGS = [
  {
    tool: "Titer Score",
    description: "Score tone on every drafted reply, via API.",
  },
  {
    tool: "Custom dimensions",
    description: "Measure empathy or urgency, the things that actually matter in a support reply.",
  },
  {
    tool: "API",
    description: "Score replies inline, wherever they're drafted — no separate tool for agents to open.",
  },
];

const WORKFLOW = [
  { step: "1", title: "Send a drafted reply to the API", body: "Before it sends, not after a customer sees it." },
  { step: "2", title: "Get a score and findings back", body: "In the same request — no extra step for the agent." },
  { step: "3", title: "Flag low scores for a human read", body: "Let the rest go through." },
];

const REASONS = [
  "Catch a cold or off-brand reply before a customer sees it.",
  "Measure empathy alongside tone, not just one score.",
  "Add a check without adding a step for agents.",
];

export default function SupportCxSolutionPage() {
  return (
    <SolutionPageTemplate
      headline="Catch a bad reply before it sends"
      subhead="Score every AI-drafted reply for tone at the point it's written, not after a customer complains."
      problem="Support teams increasingly draft replies with AI assistance, and tone mistakes slip through at volume — a reply that reads cold, scripted, or off-brand goes out before anyone reviews it by hand. Nobody has time to read every ticket, and the ones that go wrong are the ones that get screenshotted."
      toolMappings={TOOL_MAPPINGS}
      workflow={WORKFLOW}
      reasons={REASONS}
      pricingTier={{ name: "Business", price: "$499/mo", note: "Includes API access." }}
    />
  );
}
