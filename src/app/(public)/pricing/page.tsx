import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_COMMISSION_RATES, MINIMUM_FEE_USD } from "@/lib/commission";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Free for buyers, no listing fee for sellers, commission only when a deal closes.",
};

const DIFFERENTIATORS = [
  "No buyer subscription.",
  "No listing fee.",
  "No hidden listings — everything is public and indexed by default.",
];

export default function PricingPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold">Pricing</h1>
        <p className="text-xl font-medium">We are paid only when you get paid.</p>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="flex items-center justify-between">
            <span className="font-medium">Buyers</span>
            <span className="text-secondary-foreground">Free — no subscription, no NDA wall, no gated listings</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between">
            <span className="font-medium">Sellers</span>
            <span className="text-secondary-foreground">No listing fee</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-2">
            <span className="font-medium">Commission on close</span>
            <div className="flex items-center justify-between text-sm text-secondary-foreground">
              <span>Digital business</span>
              <span>{DEFAULT_COMMISSION_RATES.DIGITAL_BUSINESS}%</span>
            </div>
            <div className="flex items-center justify-between text-sm text-secondary-foreground">
              <span>AI agent</span>
              <span>{DEFAULT_COMMISSION_RATES.AI_AGENT}%</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2 text-sm text-secondary-foreground">
              <span>Minimum fee</span>
              <span>${MINIMUM_FEE_USD}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">What we don&apos;t do</h2>
        <ul className="flex flex-col gap-1 text-secondary-foreground">
          {DIFFERENTIATORS.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
