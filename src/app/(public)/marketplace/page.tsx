import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { AssetCard } from "@/components/marketplace/asset-card";
import { MarketplaceFilters } from "@/components/marketplace/marketplace-filters";
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
  const assets = await prisma.asset.findMany({ where, orderBy, take: 60 });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold">Marketplace</h1>
        <p className="text-sm text-secondary-foreground">{assets.length} listing{assets.length === 1 ? "" : "s"}</p>
      </div>
      <MarketplaceFilters />
      {assets.length === 0 ? (
        <p className="py-16 text-center text-secondary-foreground">No listings match your filters yet.</p>
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
