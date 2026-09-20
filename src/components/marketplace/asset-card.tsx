import Link from "next/link";
import type { Asset, TiterScore, VerificationSummary } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TiterScoreBadge } from "@/components/marketplace/titer-score-badge";
import { formatMoney } from "@/lib/format";
import { ASSET_TYPE_LABELS, type AssetTypeValue } from "@/lib/validation/asset";

const VERIFICATION_BADGE_LABEL: Record<VerificationSummary, string | null> = {
  UNVERIFIED: null,
  PARTIAL: "Partially verified",
  VERIFIED: "Verified",
};

export function AssetCard({ asset }: { asset: Asset & { titerScore?: TiterScore | null } }) {
  const price = formatMoney(asset.price?.toString(), asset.currency);
  const mrr = formatMoney(asset.monthlyRevenue?.toString(), asset.currency);
  const monthlyProfit = formatMoney(asset.monthlyProfit?.toString(), asset.currency);
  const growth = asset.growthRate ? Number(asset.growthRate) : null;
  const verifiedLabel = VERIFICATION_BADGE_LABEL[asset.verificationSummary];
  const title = asset.confidential ? `${ASSET_TYPE_LABELS[asset.assetType as AssetTypeValue]} — Confidential Listing` : asset.title;

  const annualRevenue = asset.revenue ? Number(asset.revenue) : asset.monthlyRevenue ? Number(asset.monthlyRevenue) * 12 : null;
  const multiple = asset.price && annualRevenue ? Number(asset.price) / annualRevenue : null;

  return (
    <Link href={`/asset/${asset.slug}`} className="block h-full">
      <Card className="h-full transition-colors hover:ring-foreground/20">
        <CardContent className="flex h-full flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {ASSET_TYPE_LABELS[asset.assetType as AssetTypeValue]}
            </span>
            <div className="flex items-center gap-1">
              <TiterScoreBadge total={asset.titerScore?.total} />
              {asset.isSeedData && (
                <Badge variant="secondary" className="text-[10px]">
                  Demo
                </Badge>
              )}
            </div>
          </div>
          <h3 className="text-lg font-semibold text-balance">{title}</h3>
          {price && <div className="text-xl font-semibold">{price}</div>}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-secondary-foreground">
            {mrr && <span>{mrr} MRR</span>}
            {monthlyProfit && <span>{monthlyProfit} monthly profit</span>}
            {growth !== null && <span>{growth > 0 ? "+" : ""}{growth}% MoM</span>}
            {multiple !== null && <span>{multiple.toFixed(1)}x revenue</span>}
            {asset.founderHoursPerWeek !== null && <span>{asset.founderHoursPerWeek} hrs/week</span>}
            {asset.primaryModelProvider && <span>{asset.primaryModelProvider}</span>}
          </div>
          <p className="line-clamp-2 flex-1 text-sm text-secondary-foreground">{asset.description}</p>
          {verifiedLabel && (
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              ✓ {verifiedLabel}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
