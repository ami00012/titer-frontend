import type { Metadata } from "next";
import { PricingTable } from "@/components/marketing/pricing-table";
import { RequestDialog } from "@/components/marketing/request-dialog";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Titer pricing",
  description:
    "Free, Pro, Studio, Agency, and Business plans for Titer Score, Quality, and Visibility.",
};

const BILLING_FAQ = [
  {
    q: "What happens when I downgrade?",
    a: "Your data stays. Downgrading doesn't delete scans, reports, or workspace history — it just changes what you can do going forward.",
  },
  {
    q: "What counts as fair use?",
    a: "Unlimited means no monthly cap. To keep the service fast for everyone, plans have a daily fair-use ceiling (Pro 100, Studio 200, Agency 1,200, Business 2,000 scans). Hitting it pauses scans until tomorrow — it never charges you.",
  },
];

export default function PricingPage() {
  return (
    <main className="mx-auto flex w-full max-w-[1180px] flex-1 flex-col px-6">
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--titer-ink)] sm:text-5xl">
          Pricing
        </h1>
        <p className="max-w-xl text-lg text-[color:var(--titer-muted)]">
          Free scanning to start. Paid plans add Quality audits, Visibility tracking, and
          more seats.
        </p>
      </div>

      <section className="w-full border-t border-[color:var(--titer-border)] py-24">
        <PricingTable />
      </section>

      <section className="w-full border-t border-[color:var(--titer-border)] py-24 text-left">
        <h2 className="text-2xl font-semibold text-[color:var(--titer-ink)]">Billing</h2>
        <div className="mt-8 flex flex-col">
          {BILLING_FAQ.map((entry) => (
            <div
              key={entry.q}
              className="flex flex-col gap-2 border-t border-[color:var(--titer-border)] py-6 first:border-t-0 first:pt-0"
            >
              <span className="font-semibold text-[color:var(--titer-ink)]">{entry.q}</span>
              <p className="max-w-2xl text-[color:var(--titer-muted)]" style={{ lineHeight: 1.6 }}>
                {entry.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex w-full flex-col items-center gap-4 border-t border-[color:var(--titer-border)] py-24 text-center">
        <h2 className="text-xl font-semibold text-[color:var(--titer-ink)]">
          Need compliance, SSO, or custom terms?
        </h2>
        <RequestDialog
          mode="demo"
          trigger={
            <Button size="lg" className="rounded-full">
              Book a demo
            </Button>
          }
        />
      </section>
    </main>
  );
}
