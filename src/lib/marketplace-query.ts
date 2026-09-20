import type { Prisma, AssetType, MoatType } from "@prisma/client";

export type MarketplaceSearchParams = Record<string, string | string[] | undefined>;

const GRADE_BAND_RANGES: Record<string, { gte: number; lte: number }> = {
  A: { gte: 80, lte: 100 },
  B: { gte: 65, lte: 79 },
  C: { gte: 50, lte: 64 },
  D: { gte: 0, lte: 49 },
};

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

  const gradeBand = get("grade");
  if (gradeBand && GRADE_BAND_RANGES[gradeBand]) {
    where.titerScore = { total: GRADE_BAND_RANGES[gradeBand] };
  }

  const moatType = get("moat");
  if (moatType) where.moatType = moatType as MoatType;

  const maxHoursPerWeek = get("maxHoursPerWeek");
  if (maxHoursPerWeek) {
    where.founderHoursPerWeek = { lte: Number(maxHoursPerWeek) };
  }

  const sort = get("sort") ?? "newest";
  const orderBy = SORT_MAP[sort] ?? SORT_MAP.newest;

  return { where, orderBy };
}
