import type { AssetType } from "@prisma/client";
import { prisma } from "@/lib/db";

/** Fallback rates if an admin hasn't (yet) overridden CommissionRule for a type -- Phase 11 defaults. */
export const DEFAULT_COMMISSION_RATES: Record<AssetType, number> = {
  DIGITAL_BUSINESS: 7.5,
  DOMAIN: 10,
  AI_AGENT: 10,
  DATASET: 10,
  API: 10,
  COMPUTE: 5,
};

export async function getCommissionRate(assetType: AssetType): Promise<number> {
  const rule = await prisma.commissionRule.findUnique({ where: { assetType } });
  return rule ? Number(rule.ratePercent) : DEFAULT_COMMISSION_RATES[assetType];
}

export interface CommissionBreakdown {
  agreedPrice: number;
  commissionRate: number;
  commissionAmount: number;
  sellerProceeds: number;
}

/** Pure calculation, unit-testable independent of the DB call that supplies `commissionRate`. */
export function computeCommission(agreedPrice: number, commissionRate: number): CommissionBreakdown {
  const commissionAmount = Math.round(agreedPrice * (commissionRate / 100) * 100) / 100;
  return {
    agreedPrice,
    commissionRate,
    commissionAmount,
    sellerProceeds: Math.round((agreedPrice - commissionAmount) * 100) / 100,
  };
}
