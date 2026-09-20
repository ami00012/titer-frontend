import type { AssetType } from "@prisma/client";
import type { MedianRow } from "@/lib/index-medians";

export interface ValuationInput {
  assetType: AssetType;
  mrr: number;
  momGrowth?: number;
  churn?: number;
  inferenceCostPct?: number;
}

export interface ValuationResult {
  low: number;
  high: number;
  usedMedian: number | null;
  provisionalGrade: string;
}

const FALLBACK_MULTIPLE_RANGE: [number, number] = [1.5, 3];

/**
 * Deterministic, not a real Titer Score -- coarse heuristic over the same five
 * buckets, biased by growth/churn/inference-cost so the band is at least
 * directionally consistent with the real rubric published at /methodology.
 */
function provisionalGradeBand(input: ValuationInput): string {
  let score = 50;
  if (input.momGrowth) score += Math.min(input.momGrowth, 20);
  if (input.churn) score -= Math.min(input.churn * 2, 20);
  if (input.inferenceCostPct) score -= Math.min(input.inferenceCostPct / 2, 15);
  if (score >= 80) return "A band (provisional)";
  if (score >= 65) return "B band (provisional)";
  if (score >= 50) return "C band (provisional)";
  return "D band (provisional)";
}

/** Finds the median for this asset type closest in spirit -- V1 just uses the type's overall median across bands (a real size-band match happens once there's enough data to bucket). */
function findRelevantMedian(medians: MedianRow[], assetType: AssetType): number | null {
  const matches = medians.filter((m) => m.assetType === assetType);
  if (matches.length === 0) return null;
  const sum = matches.reduce((acc, m) => acc + m.median, 0);
  return sum / matches.length;
}

export function estimateValuation(input: ValuationInput, medians: MedianRow[]): ValuationResult {
  const arr = input.mrr * 12;
  const usedMedian = findRelevantMedian(medians, input.assetType);
  const [lowMultiple, highMultiple] = usedMedian
    ? [usedMedian * 0.8, usedMedian * 1.2]
    : FALLBACK_MULTIPLE_RANGE;

  return {
    low: Math.round(arr * lowMultiple),
    high: Math.round(arr * highMultiple),
    usedMedian,
    provisionalGrade: provisionalGradeBand(input),
  };
}
