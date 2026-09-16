import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = { title: "How It Works" };

const STEPS = [
  {
    title: "1. List or search",
    body: "Sellers pick an asset type — digital business, domain, AI agent, dataset, API, or compute — and fill out a short form. Buyers browse the marketplace with no account, or describe what they want in plain language.",
  },
  {
    title: "2. We review and verify",
    body: "Every listing is reviewed before it goes live. Revenue, traffic, ownership, customer, technology, and identity claims only get a \"✓ verified\" badge once our team has checked the evidence — never automatically, never from a seller's self-attestation alone.",
  },
  {
    title: "3. We match buyers to assets",
    body: "Buyer requests are scored against published listings on budget, category, and the specific numbers in your request, with the reasons shown alongside the score.",
  },
  {
    title: "4. Offers happen on-platform",
    body: "A buyer makes an offer; the seller can accept, reject, or counter. There's no cold outreach — every conversation about a deal happens through the platform.",
  },
  {
    title: "5. We broker the close",
    body: `Once an offer is accepted, ${BRAND_NAME} facilitates the transaction and takes a commission (rate varies by asset type). Payment and transfer are currently coordinated manually by our team, not automated escrow.`,
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-16 sm:px-6">
      <div>
        <h1 className="text-3xl font-semibold">How it works</h1>
        <p className="mt-2 text-secondary-foreground">
          {BRAND_NAME} is a brokerage, not a fully automated marketplace — a human reviews every listing and facilitates every deal.
        </p>
      </div>
      <div className="flex flex-col gap-8">
        {STEPS.map((step) => (
          <div key={step.title} className="border-t border-border pt-6">
            <h2 className="text-lg font-semibold">{step.title}</h2>
            <p className="mt-2 text-secondary-foreground">{step.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
