import Link from "next/link";
import type { Asset, VerificationSummary } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format";
import { ASSET_TYPE_LABELS, type AssetTypeValue } from "@/lib/validation/asset";

const VERIFICATION_BADGE_LABEL: Record<VerificationSummary, string | null> = {
  UNVERIFIED: null,
  PARTIAL: "Partially verified",
  VERIFIED: "Verified",
};

export function AssetCard({ asset }: { asset: Asset }) {
  const price = formatMoney(asset.price?.toString(), asset.currency);
  const mrr = formatMoney(asset.monthlyRevenue?.toString(), asset.currency);
  const monthlyProfit = formatMoney(asset.monthlyProfit?.toString(), asset.currency);
  const growth = asset.growthRate ? Number(asset.growthRate) : null;
  const verifiedLabel = VERIFICATION_BADGE_LABEL[asset.verificationSummary];

  return (
    <Link href={`/asset/${asset.slug}`} className="block h-full">
      <Card className="h-full transition-colors hover:ring-foreground/20">
        <CardContent className="flex h-full flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {ASSET_TYPE_LABELS[asset.assetType as AssetTypeValue]}
            </span>
            {asset.isSeedData && (
              <Badge variant="secondary" className="text-[10px]">
                Demo
              </Badge>
            )}
          </div>
          <h3 className="text-lg font-semibold text-balance">{asset.title}</h3>
          {price && <div className="text-xl font-semibold">{price}</div>}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-secondary-foreground">
            {mrr && <span>{mrr} MRR</span>}
            {monthlyProfit && <span>{monthlyProfit} monthly profit</span>}
            {growth !== null && <span>{growth > 0 ? "+" : ""}{growth}% MoM</span>}
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
