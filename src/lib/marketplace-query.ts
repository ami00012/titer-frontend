import type { Prisma, AssetType } from "@prisma/client";

export type MarketplaceSearchParams = Record<string, string | string[] | undefined>;

const SORT_MAP: Record<string, Prisma.AssetOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  price: { price: "asc" },
  revenue: { revenue: "desc" },
  growth: { growthRate: "desc" },
};

export function buildMarketplaceQuery(
  params: MarketplaceSearchParams,
  lockedAssetType?: AssetType,
): { where: Prisma.AssetWhereInput; orderBy: Prisma.AssetOrderByWithRelationInput } {
  const get = (key: string) => (Array.isArray(params[key]) ? params[key]?.[0] : params[key]);

  const where: Prisma.AssetWhereInput = { status: "PUBLISHED" };

  const type = lockedAssetType ?? (get("type") as AssetType | undefined);
  if (type) where.assetType = type;

  const q = get("q");
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const verified = get("verified");
  if (verified === "VERIFIED" || verified === "PARTIAL") where.verificationSummary = verified;

  const priceMin = get("priceMin");
  const priceMax = get("priceMax");
  if (priceMin || priceMax) {
    where.price = {
      ...(priceMin ? { gte: Number(priceMin) } : {}),
      ...(priceMax ? { lte: Number(priceMax) } : {}),
    };
  }

  const category = get("category");
  if (category) where.category = category;

  const businessModel = get("businessModel");
  if (businessModel) where.businessModel = businessModel;

  const sort = get("sort") ?? "newest";
  const orderBy = SORT_MAP[sort] ?? SORT_MAP.newest;

  return { where, orderBy };
}
