"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RequestDialog } from "@/components/marketing/request-dialog";
import { useCurrencySymbol } from "@/hooks/use-currency-symbol";

type CtaKind = "free" | "trial" | "demo";

interface Tier {
  name: string;
  monthly: number;
  /** Pro only -- a discounted first-50-customers rate, shown alongside the normal price rather than replacing it. */
  foundingMonthly?: number;
  mostPopular?: boolean;
  cta: CtaKind;
  features: string[];
}

// Every number here is read from titer-backend's PlanCatalog.java (the real
// source of truth) as of the margin-safe-quotas changeset -- not invented
// copy. See PRICING-PROFITABILITY-PLAN.md for how these were derived.
// "Audit up to N pages" figures are batchUrlsPerJob (the real, enforced cap
// on a single audit run) -- not a monthly aggregate, which nothing in the
// codebase actually tracks or enforces.
const TIERS: Tier[] = [
  {
    name: "Free",
    monthly: 0,
    cta: "free",
    features: ["Titer Score", "15 scans a month"],
  },
  {
    name: "Pro",
    monthly: 12,
    foundingMonthly: 9,
    cta: "trial",
    features: ["100 scans a day", "150 fixes a month", "Custom X dimensions"],
  },
  {
    name: "Studio",
    monthly: 99,
    mostPopular: true,
    cta: "trial",
    features: ["Everything in Pro", "Audit up to 100 pages per run", "Visibility: 1 brand"],
  },
  {
    name: "Agency",
    monthly: 349,
    cta: "demo",
    features: ["Everything in Studio", "Audit up to 500 pages per run", "Visibility: 5 brands, white-label reports"],
  },
  {
    name: "Business",
    monthly: 499,
    cta: "demo",
    features: ["Everything in Agency", "60,000 API calls a month", "Metered overage available"],
  },
];

const COMPARISON_ROWS: { feature: string; values: string[] }[] = [
  { feature: "Titer Score scans", values: ["15/mo", "100/day", "200/day", "1,200/day", "2,000/day"] },
  { feature: "Fixes", values: ["3/mo", "150/mo", "800/mo", "1,200/mo", "1,200/mo"] },
  { feature: "Custom X dimensions", values: ["—", "✓", "✓", "✓", "✓"] },
  { feature: "Pages per audit", values: ["—", "10", "100", "500", "100"] },
  { feature: "Client-ready reports", values: ["—", "✓", "✓", "✓", "✓"] },
  { feature: "Titer Visibility", values: ["—", "—", "1 brand", "5 brands", "2 brands"] },
  { feature: "Client workspaces", values: ["—", "—", "—", "10", "3"] },
  { feature: "API access", values: ["—", "—", "5,000/mo", "10,000/mo", "60,000/mo"] },
];

function TierCta({ cta }: { cta: CtaKind }) {
  if (cta === "free") {
    return (
      <Button nativeButton={false} render={<Link href="/measure" />} className="w-full rounded-full">
        Try it free
      </Button>
    );
  }
  if (cta === "trial") {
    return (
      <RequestDialog
        mode="trial"
        trigger={<Button className="w-full rounded-full">Request trial</Button>}
      />
    );
  }
  return (
    <RequestDialog
      mode="demo"
      trigger={
        <Button variant="outline" className="w-full rounded-full">
          Book a demo
        </Button>
      }
    />
  );
}

export function PricingTable() {
  const [showComparison, setShowComparison] = useState(false);
  const symbol = useCurrencySymbol();

  return (
    <div className="flex flex-col gap-12">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {TIERS.map((tier) => (
          <Card
            key={tier.name}
            className="flex flex-col gap-4 p-6 text-left"
            style={{
              borderColor: tier.mostPopular ? "var(--titer-ink)" : "var(--titer-border)",
              borderWidth: tier.mostPopular ? 2 : 1,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[color:var(--titer-ink)]">{tier.name}</span>
              {tier.mostPopular ? (
                <span className="rounded-full border border-[color:var(--titer-border)] px-2 py-0.5 text-xs text-[color:var(--titer-muted)]">
                  Most popular
                </span>
              ) : null}
            </div>

            <div>
              <span className="text-2xl font-semibold text-[color:var(--titer-ink)]">
                {tier.monthly === 0 ? "Free" : `${symbol}${tier.monthly}`}
              </span>
              {tier.monthly > 0 ? (
                <span className="text-sm text-[color:var(--titer-muted)]">/mo</span>
              ) : null}
              {tier.foundingMonthly ? (
                <p className="mt-1 text-xs text-[color:var(--titer-muted)]">
                  <span className="font-medium text-[color:var(--titer-ink)]">{symbol}{tier.foundingMonthly}/mo</span> founding
                  rate for the first 50 customers
                </p>
              ) : null}
            </div>

            <ul className="flex flex-col gap-2 text-sm text-[color:var(--titer-muted)]">
              {tier.features.map((feature) => (
                <li key={feature} style={{ lineHeight: 1.5 }}>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-2">
              <TierCta cta={tier.cta} />
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setShowComparison((v) => !v)}
          className="self-start text-sm text-[color:var(--titer-ink)] underline underline-offset-2"
        >
          {showComparison ? "Hide full comparison" : "Show full comparison"}
        </button>

        {showComparison ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[color:var(--titer-border)]">
                  <th className="py-3 pr-4 font-medium text-[color:var(--titer-muted)]">Feature</th>
                  {TIERS.map((tier) => (
                    <th key={tier.name} className="py-3 pr-4 font-medium text-[color:var(--titer-ink)]">
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature} className="border-b border-[color:var(--titer-border)]">
                    <td className="py-3 pr-4 text-[color:var(--titer-ink)]">{row.feature}</td>
                    {row.values.map((value, i) => (
                      <td key={`${row.feature}-${i}`} className="py-3 pr-4 text-[color:var(--titer-muted)]">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {/* Real numbers, read from titer-backend's CompliancePlanCatalog.java --
          a separate catalog from the consumer ladder above, since compliance
          is sold as an enterprise add-on (demo, not self-serve trial). */}
      <div className="flex flex-col gap-4">
        <div className="text-center">
          <span className="text-sm font-medium text-[color:var(--titer-muted)]">Titer Compliance</span>
          <p className="mt-1 text-[color:var(--titer-ink)]">
            Check every piece of regulated content against your policy, and keep the record.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="flex flex-col gap-4 p-6 text-left">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[color:var(--titer-ink)]">Compliance Starter</span>
            </div>
            <div>
              <span className="text-2xl font-semibold text-[color:var(--titer-ink)]">{symbol}299</span>
              <span className="text-sm text-[color:var(--titer-muted)]">/mo</span>
            </div>
            <ul className="flex flex-col gap-2 text-sm text-[color:var(--titer-muted)]">
              <li>3 seats, 3 policies</li>
              <li>500 checks a month</li>
              <li>All 3 policy packs (FTC, financial promotions, EU AI Act)</li>
              <li>10 custom rules</li>
              <li>Audit export, 24-month retention</li>
            </ul>
            <div className="mt-auto pt-2">
              <RequestDialog
                mode="demo"
                trigger={
                  <Button variant="outline" className="w-full rounded-full">
                    Book a demo
                  </Button>
                }
              />
            </div>
          </Card>
          <Card className="flex flex-col gap-4 p-6 text-left" style={{ borderColor: "var(--titer-ink)", borderWidth: 2 }}>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[color:var(--titer-ink)]">Compliance Pro</span>
            </div>
            <div>
              <span className="text-2xl font-semibold text-[color:var(--titer-ink)]">{symbol}899</span>
              <span className="text-sm text-[color:var(--titer-muted)]">/mo</span>
            </div>
            <ul className="flex flex-col gap-2 text-sm text-[color:var(--titer-muted)]">
              <li>10 seats, 20 policies</li>
              <li>5,000 checks a month</li>
              <li>All 3 policy packs, 50 custom rules</li>
              <li>Audit export, 36-month retention</li>
              <li>API access, webhooks</li>
            </ul>
            <div className="mt-auto pt-2">
              <RequestDialog
                mode="demo"
                trigger={
                  <Button className="w-full rounded-full">
                    Book a demo
                  </Button>
                }
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Not a fixed tier -- for buyers whose real ask is a negotiated
          commitment (volume, contract length, terms) rather than a plan pick.
          Routes to a real, distinct lead type (custom_plan_call) so these
          show up separately from generic demo requests. */}
      <div className="flex flex-col gap-4">
        <div className="text-center">
          <span className="text-sm font-medium text-[color:var(--titer-muted)]">Something more custom?</span>
          <p className="mt-1 text-[color:var(--titer-ink)]">
            Long-term commitments, higher volume, or terms outside our standard tiers — let&apos;s talk.
          </p>
        </div>
        <div className="mx-auto">
          <RequestDialog
            mode="call"
            trigger={
              <Button variant="outline" className="rounded-full">
                Schedule a call
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
}
