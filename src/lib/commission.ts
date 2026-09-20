import type { AssetType } from "@prisma/client";

/**
 * Hardcoded for V1 -- one admin, zero transactions, no config UI to build
 * (AGENTS spec §1, §3). DIGITAL_BUSINESS and AI_AGENT are the only active V1
 * categories; the rest keep a placeholder rate in case those types are ever
 * unhidden, but are not reachable from any picker today.
 */
export const DEFAULT_COMMISSION_RATES: Record<AssetType, number> = {
  DIGITAL_BUSINESS: 6,
  AI_AGENT: 8,
  DOMAIN: 10,
  DATASET: 10,
  API: 10,
  COMPUTE: 3,
};

export const MINIMUM_FEE_USD = 500;

export function getCommissionRate(assetType: AssetType): number {
  return DEFAULT_COMMISSION_RATES[assetType];
}

export interface CommissionBreakdown {
  agreedPrice: number;
  commissionRate: number;
  commissionAmount: number;
  sellerProceeds: number;
}

/** Pure calculation. Commission is rate-based but never less than MINIMUM_FEE_USD. */
export function computeCommission(agreedPrice: number, commissionRate: number): CommissionBreakdown {
  const rateAmount = Math.round(agreedPrice * (commissionRate / 100) * 100) / 100;
  const commissionAmount = Math.max(rateAmount, MINIMUM_FEE_USD);
  return {
    agreedPrice,
    commissionRate,
    commissionAmount,
    sellerProceeds: Math.round((agreedPrice - commissionAmount) * 100) / 100,
  };
}
