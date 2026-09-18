import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { AssetCard } from "@/components/marketplace/asset-card";
import { MarketplaceFilters } from "@/components/marketplace/marketplace-filters";
import { buttonVariants } from "@/components/ui/button";
import { buildMarketplaceQuery, type MarketplaceSearchParams } from "@/lib/marketplace-query";

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Browse digital businesses, domains, AI agents, datasets, APIs, and compute for sale.",
};

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<MarketplaceSearchParams>;
}) {
  const params = await searchParams;
  const { where, orderBy } = buildMarketplaceQuery(params);
  const hasFilters = Object.keys(params).length > 0;
  const [assets, totalPublished] = await Promise.all([
    prisma.asset.findMany({ where, orderBy, take: 60 }),
    prisma.asset.count({ where: { status: "PUBLISHED" } }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold">Marketplace</h1>
        <p className="text-sm text-secondary-foreground">{assets.length} listing{assets.length === 1 ? "" : "s"}</p>
      </div>
      <MarketplaceFilters />
      {assets.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          {totalPublished === 0 && !hasFilters ? (
            <>
              <p className="text-secondary-foreground">No assets have been listed yet — be the first.</p>
              <Link href="/sell" className={buttonVariants()}>
                Sell an Asset
              </Link>
            </>
          ) : (
            <p className="text-secondary-foreground">No listings match your filters.</p>
          )}
        </div>
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
