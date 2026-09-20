import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AssetCard } from "@/components/marketplace/asset-card";
import { MarketplaceFilters } from "@/components/marketplace/marketplace-filters";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
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
  const assets = await prisma.asset.findMany({ where, orderBy, take: 60, include: { titerScore: true } });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold">{ASSET_TYPE_LABELS[assetType]}</h1>
        {assets.length > 0 && (
          <p className="text-sm text-secondary-foreground">{assets.length} listing{assets.length === 1 ? "" : "s"}</p>
        )}
      </div>
      <MarketplaceFilters lockedAssetType={assetType} />
      {assets.length === 0 ? (
        <EmptyCategoryState assetType={assetType} category={category} />
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

/** Never a bare "0 listings" -- surface matching mandates and the wind-down funnel instead (§4.2). */
async function EmptyCategoryState({ assetType, category }: { assetType: AssetTypeValue; category: string }) {
  const mandates = await prisma.buyerRequest.findMany({
    where: { status: "OPEN", assetType },
    select: { id: true, budgetMax: true, requirements: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div className="flex flex-col gap-8 py-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-secondary-foreground">No {ASSET_TYPE_LABELS[assetType].toLowerCase()} listings yet — be the first.</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href={`/sell/${category}`} className={buttonVariants()}>
            Sell a {ASSET_TYPE_LABELS[assetType]}
          </Link>
          <Link href="/wind-down" className={buttonVariants({ variant: "outline" })}>
            Shutting one down? Sell it instead
          </Link>
        </div>
      </div>

      {mandates.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Buyers are already waiting for this category
          </h2>
          {mandates.map((m) => (
            <Card key={m.id}>
              <CardContent className="flex flex-col gap-1">
                <p className="font-medium">
                  {m.budgetMax ? <>Up to ${Number(m.budgetMax).toLocaleString()}</> : "Budget not disclosed"}
                </p>
                {m.requirements && <p className="text-sm text-secondary-foreground">{m.requirements}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
