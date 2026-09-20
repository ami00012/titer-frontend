"use server";

import { prisma } from "@/lib/db";
import { sendEmailEvent } from "@/lib/email";
import { TEAM_NOTIFICATION_EMAIL } from "@/lib/brand";
import { computeMedians } from "@/lib/index-medians";
import { estimateValuation, type ValuationInput } from "@/lib/valuation";

export interface ValuationRangeResult {
  low: number;
  high: number;
  provisionalGrade: string;
}

/** No email required -- the range itself is free. */
export async function getValuationRange(input: ValuationInput): Promise<ValuationRangeResult> {
  const comparables = await prisma.comparable.findMany();
  const medians = computeMedians(comparables);
  const { low, high, provisionalGrade } = estimateValuation(input, medians);
  return { low, high, provisionalGrade };
}

export interface ComparableSummary {
  sizeBand: string;
  multiple: number;
  source: string;
}

/** Email-gated -- creates the lead and unlocks the underlying comp rows for this category. */
export async function unlockComparables(input: ValuationInput, email: string): Promise<ComparableSummary[]> {
  if (!email.includes("@")) throw new Error("Enter a valid email");

  const comparables = await prisma.comparable.findMany({ where: { assetType: input.assetType } });
  const { low, high, provisionalGrade } = await getValuationRange(input);

  await prisma.valuationLead.create({
    data: {
      assetType: input.assetType,
      mrr: input.mrr,
      momGrowth: input.momGrowth,
      churn: input.churn,
      inferenceCostPct: input.inferenceCostPct,
      email,
      estimatedLow: low,
      estimatedHigh: high,
      provisionalGrade,
    },
  });

  await sendEmailEvent("valuation_lead", TEAM_NOTIFICATION_EMAIL, {
    email,
    assetType: input.assetType,
    mrr: String(input.mrr),
    estimatedLow: String(low),
    estimatedHigh: String(high),
  });

  return comparables.map((c) => ({ sizeBand: c.sizeBand, multiple: Number(c.multiple), source: c.source }));
}
