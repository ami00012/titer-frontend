import type { Metadata } from "next";
import { SolutionPageTemplate } from "@/components/marketing/solution-page-template";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Titer for brand & marketing",
  description:
    "See what AI says about your brand, and catch it when it gets a fact wrong.",
};

const TOOL_MAPPINGS = [
  {
    tool: "Titer Visibility",
    description: "Ask AI your customers' real questions on demand, and see exactly what comes back.",
  },
  {
    tool: "Accuracy alerts",
    description: "Get flagged when an answer states a wrong price, feature, or claim about your brand.",
  },
  {
    tool: "Titer Score",
    description: "Check the pages you publish so the source material AI engines pull from is accurate to begin with.",
  },
];

const WORKFLOW = [
  { step: "1", title: "Give Titer the facts", body: "Your brand, domain, and named competitors — the facts to check answers against." },
  { step: "2", title: "Titer asks AI", body: "The real questions your customers would ask, run on demand." },
  { step: "3", title: "Review what's wrong", body: "See flagged answers and exactly where they're wrong." },
];

const REASONS = [
  "Know what AI is telling buyers before a buyer tells you.",
  "Catch a wrong price or dead feature before it costs a deal.",
  "See how your brand's presence compares to named competitors.",
];

export default function BrandMarketingSolutionPage() {
  return (
    <SolutionPageTemplate
      headline="What AI says about your brand — and where it's wrong"
      subhead="Track mentions from AI, and catch it when it gets a fact wrong."
      problem="Buyers ask AI engines about a brand before they visit its site, and those answers can be outdated or simply wrong — a discontinued feature, an old price, a competitor's claim repeated as fact. Marketing teams have no visibility into what's being said, and no way to correct it once they find out."
      toolMappings={TOOL_MAPPINGS}
      workflow={WORKFLOW}
      reasons={REASONS}
      pricingTier={{ name: "Business", price: { amount: 499, suffix: "/mo" }, note: "Includes Titer Visibility." }}
    />
  );
}
