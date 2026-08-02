import type { Metadata } from "next";
import { SolutionPageTemplate } from "@/components/marketing/solution-page-template";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Titer for brand & marketing",
  description:
    "See what ChatGPT, Perplexity, Google AI Overviews, and Gemini say about your brand, and catch it when they get a fact wrong.",
};

const TOOL_MAPPINGS = [
  {
    tool: "Titer Visibility",
    description: "Ask each engine about your brand on a schedule, and see exactly what comes back.",
  },
  {
    tool: "Accuracy alerts",
    description: "Get flagged the moment an engine states a wrong price, feature, or claim.",
  },
  {
    tool: "Titer Score",
    description: "Check the pages you publish so the source material AI engines pull from is accurate to begin with.",
  },
];

const WORKFLOW = [
  { step: "1", title: "Give Titer the facts", body: "Pricing, features, positioning — the facts to check answers against." },
  { step: "2", title: "Titer asks each engine", body: "ChatGPT, Perplexity, Google AI Overviews, and Gemini, on a schedule." },
  { step: "3", title: "Review what's wrong, engine by engine", body: "See flagged answers and exactly where they're wrong." },
];

const REASONS = [
  "Know what ChatGPT and Google are telling buyers before a buyer tells you.",
  "Catch a wrong price or dead feature before it costs a deal.",
  "See how your brand's presence compares to named competitors.",
];

export default function BrandMarketingSolutionPage() {
  return (
    <SolutionPageTemplate
      headline="What AI engines say about your brand — and where they're wrong"
      subhead="Track mentions across ChatGPT, Perplexity, Google AI Overviews, and Gemini, and catch it when they get a fact wrong."
      problem="Buyers ask AI engines about a brand before they visit its site, and those answers can be outdated or simply wrong — a discontinued feature, an old price, a competitor's claim repeated as fact. Marketing teams have no visibility into what's being said, and no way to correct it once they find out."
      toolMappings={TOOL_MAPPINGS}
      workflow={WORKFLOW}
      reasons={REASONS}
      pricingTier={{ name: "Business", price: "$499/mo", note: "Includes Titer Visibility." }}
    />
  );
}
