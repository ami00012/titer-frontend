import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AssetCard } from "@/components/marketplace/asset-card";
import { ListingAnimation, VerifyMatchAnimation, BrokerDealAnimation } from "@/components/marketing/how-it-works-animation";
import { prisma } from "@/lib/db";
import { BRAND_TAGLINE } from "@/lib/brand";
import { computeMedians } from "@/lib/index-medians";
import { ASSET_TYPE_LABELS, type AssetTypeValue } from "@/lib/validation/asset";

const HOW_IT_WORKS = [
  { title: "List or describe what you want", body: "Sellers list a digital business or AI agent. Buyers describe what they're after.", Animation: ListingAnimation },
  { title: "We score and verify", body: "Every listing gets a published Titer Score against a public rubric before it goes live — a person pairs buyer mandates against listings by hand.", Animation: VerifyMatchAnimation },
  { title: "We broker the deal", body: "Offers, counters, and acceptance happen on-platform. We facilitate the transaction and take a commission only on close.", Animation: BrokerDealAnimation },
];

export const metadata: Metadata = {
  openGraph: { images: ["/api/og"] },
};

export default async function HomePage() {
  const [featured, recent, comparables, mandates, openBidWindow] = await Promise.all([
    prisma.asset.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { verificationSummary: "desc" },
      take: 6,
      include: { titerScore: true },
    }),
    prisma.asset.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { titerScore: true },
    }),
    prisma.comparable.findMany(),
    prisma.buyerRequest.findMany({
      where: { status: "OPEN" },
      select: { id: true, assetType: true, budgetMin: true, budgetMax: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.bidWindow.findFirst({
      where: { status: "OPEN" },
      orderBy: { closesAt: "asc" },
      select: {
        closesAt: true,
        asset: { select: { slug: true, title: true, confidential: true, assetType: true } },
        bids: { select: { amount: true }, orderBy: { amount: "desc" }, take: 1 },
        _count: { select: { bids: true } },
      },
    }),
  ]);

  const indexSnapshot = computeMedians(comparables).slice(0, 3);

  return (
    <div className="flex flex-col gap-24 pb-24">
      <section className="flex flex-col items-center gap-6 px-4 pt-20 pb-12 text-center sm:px-6">
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          {BRAND_TAGLINE}
        </h1>
        <p className="max-w-xl text-lg text-secondary-foreground">
          Every listing carries a published Titer Score. Agents are proven in a sandbox before they&apos;re sold. We
          take a commission only when the asset trades.
        </p>
        <p className="text-sm text-muted-foreground">Every listing and every deal here is reviewed by a person before it goes live.</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/marketplace" className={buttonVariants({ size: "lg" })}>
            Explore Assets
          </Link>
          <Link href="/sell" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Sell an Asset
          </Link>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 sm:px-6 md:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Titer Index</h3>
              <Link href="/index" className="text-xs font-medium hover:underline">
                View all →
              </Link>
            </div>
            {indexSnapshot.length === 0 ? (
              <p className="text-sm text-secondary-foreground">No comparables yet — check back after the first deals close.</p>
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {indexSnapshot.map((row) => (
                  <li key={`${row.assetType}-${row.sizeBand}`} className="flex items-center justify-between">
                    <span>
                      {ASSET_TYPE_LABELS[row.assetType as AssetTypeValue]} · {row.sizeBand}
                    </span>
                    <span className="font-medium">{row.median.toFixed(1)}x</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Latest mandates</h3>
              <Link href="/mandates" className="text-xs font-medium hover:underline">
                View all →
              </Link>
            </div>
            {mandates.length === 0 ? (
              <p className="text-sm text-secondary-foreground">No open mandates yet.</p>
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {mandates.map((m) => (
                  <li key={m.id}>
                    {m.assetType ? ASSET_TYPE_LABELS[m.assetType as AssetTypeValue] : "Any type"}
                    {m.budgetMax && <> · up to ${Number(m.budgetMax).toLocaleString()}</>}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Open Bid</h3>
            {openBidWindow ? (
              <>
                <div className="text-lg font-semibold">
                  {openBidWindow.bids[0]?.amount ? `$${Number(openBidWindow.bids[0].amount).toLocaleString()}` : "No bids yet"}
                </div>
                <div className="text-sm text-secondary-foreground">
                  {openBidWindow._count.bids} bid{openBidWindow._count.bids === 1 ? "" : "s"} on{" "}
                  {openBidWindow.asset.confidential
                    ? `${ASSET_TYPE_LABELS[openBidWindow.asset.assetType as AssetTypeValue]} — Confidential Listing`
                    : openBidWindow.asset.title}
                </div>
                <Link href={`/asset/${openBidWindow.asset.slug}`} className="text-xs font-medium hover:underline">
                  View & bid →
                </Link>
              </>
            ) : (
              <p className="text-sm text-secondary-foreground">No live Open Bid this week.</p>
            )}
          </CardContent>
        </Card>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold">Featured listings</h2>
            <Link href="/marketplace" className="text-sm font-medium hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <h2 className="mb-6 text-2xl font-semibold">Recently listed</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <h2 className="mb-6 text-2xl font-semibold">How it works</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {HOW_IT_WORKS.map((step, i) => (
            <Card key={step.title} className="overflow-hidden">
              <step.Animation />
              <CardContent className="flex flex-col gap-2 border-t border-border pt-4">
                <span className="text-sm font-medium text-muted-foreground">Step {i + 1}</span>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-secondary-foreground">{step.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 sm:grid-cols-2 sm:px-6">
        <Card>
          <CardContent className="flex flex-col items-start gap-3">
            <h3 className="text-xl font-semibold">Selling an asset?</h3>
            <p className="text-sm text-secondary-foreground">
              List your digital business or AI agent, get it scored against a public rubric, and reach buyers with
              named budgets.
            </p>
            <Link href="/sell" className={buttonVariants()}>
              Sell an Asset
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-start gap-3">
            <h3 className="text-xl font-semibold">Looking to buy?</h3>
            <p className="text-sm text-secondary-foreground">
              Browse the marketplace, or tell us what you&apos;re looking for and we&apos;ll match you.
            </p>
            <Link href="/buy" className={buttonVariants({ variant: "outline" })}>
              Describe What You Want
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
