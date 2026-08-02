import type { Metadata } from "next";
import { SolutionPageTemplate } from "@/components/marketing/solution-page-template";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Titer for SEO agencies",
  description:
    "Audit every client page for generic, flat content and rank-risk before Google does, and hand clients a report that shows the findings.",
};

const TOOL_MAPPINGS = [
  {
    tool: "Titer Score, at scale",
    description: "Audit every client site in one pass, worst-first, so you see the risk before Google does.",
  },
  {
    tool: "Titer Score",
    description: "Check drafts before they go live, so a bad page never reaches a client site.",
  },
  {
    tool: "Titer Visibility",
    description: "Show clients what AI engines say about their brand — a new line item, not just rankings.",
  },
];

const WORKFLOW = [
  { step: "1", title: "Connect a sitemap or a list of URLs", body: "One client at a time, or your whole book of business." },
  { step: "2", title: "Titer scores every page, worst-first", body: "No page needs to be read by hand to know where the risk is." },
  { step: "3", title: "Export a client-ready report, or fix first", body: "Send the report as-is, or clean up the worst pages before the client sees the list." },
];

const REASONS = [
  "Catch generic, flat pages before a client's rankings drop, not after.",
  "Turn an audit into a report you can hand a client without editing it first.",
  "Track visibility as a new service line, not just a favor.",
];

export default function AgenciesSolutionPage() {
  return (
    <SolutionPageTemplate
      headline="Client sites, audited before Google notices"
      subhead="Run every client page through one score, worst-first, without reading each one by hand."
      problem="Agencies manage dozens of client sites, and AI-drafted content has made it into most of them. Nobody has time to read every page, and by the time a client's rankings drop, it's already a hard conversation. A missed page becomes a lost account."
      toolMappings={TOOL_MAPPINGS}
      workflow={WORKFLOW}
      reasons={REASONS}
      pricingTier={{ name: "Agency", price: "$349/mo", note: "Multiple client workspaces, higher audit volume." }}
    />
  );
}
