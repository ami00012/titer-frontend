import type { Metadata } from "next";
import { ValuationForm } from "@/components/marketing/valuation-form";

export const metadata: Metadata = {
  title: "Free valuation",
  description: "Get a range for your digital business or AI agent, backed by real closed-deal and public comparables.",
};

export default function ValuatePage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8 px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold">What&apos;s it worth?</h1>
        <p className="text-secondary-foreground">
          A quick range, sourced from the same comparables published on the{" "}
          <a href="/titer-index" className="underline">Titer Index</a>. Free. The full comp list behind your number needs
          an email.
        </p>
      </div>
      <ValuationForm />
    </div>
  );
}
