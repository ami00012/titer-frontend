import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold">About {BRAND_NAME}</h1>
      <p className="text-secondary-foreground">
        {BRAND_NAME} is the exchange for the AI economy — a marketplace and brokerage for buying and selling digital
        businesses, domains, AI agents, datasets, APIs, and compute.
      </p>
      <p className="text-secondary-foreground">
        We&apos;re not trying to be a fully automated marketplace on day one. We optimize for getting real assets
        listed, getting the right buyers interested, matching the two, and facilitating the transaction — with a
        human reviewing every listing and every deal along the way.
      </p>
    </div>
  );
}
