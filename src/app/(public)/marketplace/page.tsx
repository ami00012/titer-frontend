import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { AssetCard } from "@/components/marketplace/asset-card";
import { MarketplaceFilters } from "@/components/marketplace/marketplace-filters";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { buildMarketplaceQuery, type MarketplaceSearchParams } from "@/lib/marketplace-query";
import { ASSET_TYPE_LABELS, type AssetTypeValue } from "@/lib/validation/asset";

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Browse digital businesses and AI agents for sale, each scored against a public rubric.",
};

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<MarketplaceSearchParams>;
}) {
  const params = await searchParams;
  const { where, orderBy } = buildMarketplaceQuery(params);
  const assets = await prisma.asset.findMany({ where, orderBy, take: 60, include: { titerScore: true } });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold">Marketplace</h1>
        {assets.length > 0 && (
          <p className="text-sm text-secondary-foreground">{assets.length} listing{assets.length === 1 ? "" : "s"}</p>
        )}
      </div>
      <MarketplaceFilters />
      {assets.length === 0 ? (
        <EmptyMarketplaceState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Never a bare "0 listings" -- surface the mandate board and the wind-down funnel instead (§4.2). */
async function EmptyMarketplaceState() {
  const mandates = await prisma.buyerRequest.findMany({
    where: { status: "OPEN" },
    select: { id: true, assetType: true, budgetMax: true, requirements: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div className="flex flex-col gap-8 py-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-secondary-foreground">No listings match right now.</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/sell" className={buttonVariants()}>
            List an asset
          </Link>
          <Link href="/wind-down" className={buttonVariants({ variant: "outline" })}>
            Shutting something down? Sell it instead
          </Link>
        </div>
      </div>

      {mandates.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Buyers are already waiting
          </h2>
          {mandates.map((m) => (
            <Card key={m.id}>
              <CardContent className="flex flex-col gap-1">
                <p className="font-medium">
                  Looking for: {m.assetType ? ASSET_TYPE_LABELS[m.assetType as AssetTypeValue] : "Any asset type"}
                  {m.budgetMax && <> · up to ${Number(m.budgetMax).toLocaleString()}</>}
                </p>
                {m.requirements && <p className="text-sm text-secondary-foreground">{m.requirements}</p>}
              </CardContent>
            </Card>
          ))}
          <Link href="/mandates" className="self-center text-sm font-medium hover:underline">
            View all mandates →
          </Link>
        </div>
      )}
    </div>
  );
}
