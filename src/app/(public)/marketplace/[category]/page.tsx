import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AssetCard } from "@/components/marketplace/asset-card";
import { MarketplaceFilters } from "@/components/marketplace/marketplace-filters";
import { buildMarketplaceQuery, type MarketplaceSearchParams } from "@/lib/marketplace-query";
import { ASSET_TYPE_LABELS, ASSET_TYPES, type AssetTypeValue } from "@/lib/validation/asset";

function categoryToAssetType(category: string): AssetTypeValue | undefined {
  const upper = category.toUpperCase().replace(/-/g, "_");
  return ASSET_TYPES.find((type) => type === upper);
}

export async function generateStaticParams() {
  return ASSET_TYPES.map((type) => ({ category: type.toLowerCase().replace(/_/g, "-") }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const assetType = categoryToAssetType(category);
  if (!assetType) return {};
  const label = ASSET_TYPE_LABELS[assetType];
  return { title: label, description: `Browse ${label.toLowerCase()} listings for sale on the marketplace.` };
}

export default async function MarketplaceCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<MarketplaceSearchParams>;
}) {
  const { category } = await params;
  const assetType = categoryToAssetType(category);
  if (!assetType) notFound();

  const resolvedSearchParams = await searchParams;
  const { where, orderBy } = buildMarketplaceQuery(resolvedSearchParams, assetType);
  const assets = await prisma.asset.findMany({ where, orderBy, take: 60 });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold">{ASSET_TYPE_LABELS[assetType]}</h1>
        <p className="text-sm text-secondary-foreground">{assets.length} listing{assets.length === 1 ? "" : "s"}</p>
      </div>
      <MarketplaceFilters lockedAssetType={assetType} />
      {assets.length === 0 ? (
        <p className="py-16 text-center text-secondary-foreground">No listings in this category yet.</p>
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
