"use client";

import { QuotaMeter } from "@/components/titer/quota-meter";
import { useEntitlements } from "@/hooks/use-entitlements";

export function ScoreQuotaMeter() {
  const { entitlements, quotaRemaining, isLoading } = useEntitlements();

  if (isLoading || !entitlements) return null;

  const limit = entitlements.scoreScansMonthly;
  if (limit == null) {
    return <p className="text-sm text-muted-foreground">Unlimited score scans on your plan.</p>;
  }

  const remaining = quotaRemaining.score ?? limit;
  const used = Math.max(0, limit - remaining);

  return <QuotaMeter label="Score scans this month" used={used} limit={limit} />;
}
