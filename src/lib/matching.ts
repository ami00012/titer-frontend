import type { Asset, BuyerRequest } from "@prisma/client";

export interface MatchResult {
  asset: Asset;
  score: number;
  reasons: string[];
}

const num = (v: unknown): number | null => (v === null || v === undefined ? null : Number(v));

/**
 * Deliberately simple rule-based scoring (spec: "Do NOT build complicated AI
 * infrastructure" for V1 matching) -- budget fit, type match, and any
 * MRR/profit/growth thresholds it can pull out of the free-text
 * `requirements` field. Replace with LLM-based matching later without
 * changing the caller's contract (asset in, {score, reasons} out).
 */
export function scoreAssetForBuyerRequest(asset: Asset, request: BuyerRequest): MatchResult {
  const reasons: string[] = [];
  let score = 0;
  const weight = 100 / 5; // 5 signals considered below, scaled to a 0-100 score

  const price = num(asset.price);
  const budgetMin = num(request.budgetMin);
  const budgetMax = num(request.budgetMax);
  if (price !== null && (budgetMin === null || price >= budgetMin) && (budgetMax === null || price <= budgetMax)) {
    score += weight;
    reasons.push("Within budget");
  }

  if (!request.assetType || request.assetType === asset.assetType) {
    score += weight;
    reasons.push(`${formatAssetType(asset.assetType)} match`);
  }

  const requirements = (request.requirements ?? "").toLowerCase();

  if (asset.businessModel && requirements.includes(asset.businessModel.toLowerCase())) {
    score += weight;
    reasons.push(`${asset.businessModel} model`);
  }

  const mrr = num(asset.monthlyRevenue);
  const mrrFloor = extractDollarFloor(requirements, ["mrr", "monthly recurring revenue"]);
  if (mrr !== null && (mrrFloor === null || mrr >= mrrFloor)) {
    score += weight;
    if (mrr > 0) reasons.push(`$${mrr.toLocaleString()} MRR`);
  }

  const growth = num(asset.growthRate);
  const wantsLowMaintenance = requirements.includes("low maintenance");
  if (growth !== null && growth > 0) {
    score += weight;
    reasons.push(`${growth}% growth`);
  } else if (wantsLowMaintenance) {
    score += weight;
    reasons.push("Low maintenance");
  }

  return { asset, score: Math.round(score), reasons };
}

export function matchAssetsForBuyerRequest(assets: Asset[], request: BuyerRequest): MatchResult[] {
  return assets
    .map((asset) => scoreAssetForBuyerRequest(asset, request))
    .sort((a, b) => b.score - a.score);
}

function extractDollarFloor(text: string, keywords: string[]): number | null {
  for (const keyword of keywords) {
    const match = text.match(new RegExp(`\\$?([\\d,]+)\\s*(?:k)?\\s*(?:-|to)?\\s*\\$?[\\d,]*\\s*(?:k)?\\s*${keyword}`));
    if (match) return Number(match[1].replace(/,/g, ""));
  }
  return null;
}

function formatAssetType(type: string): string {
  return type
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
