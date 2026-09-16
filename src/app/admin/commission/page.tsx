import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { CommissionRateInput } from "@/components/admin/commission-rate-input";
import { DEFAULT_COMMISSION_RATES } from "@/lib/commission";
import { ASSET_TYPE_LABELS, ASSET_TYPES } from "@/lib/validation/asset";
import type { AssetType } from "@prisma/client";

export default async function AdminCommissionPage() {
  const rules = await prisma.commissionRule.findMany();
  const ratesByType = new Map(rules.map((r) => [r.assetType, Number(r.ratePercent)]));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Commission rates</h1>
      <p className="max-w-xl text-sm text-secondary-foreground">
        Applied automatically when an offer is accepted. Changing a rate here doesn&apos;t affect transactions already created.
      </p>
      <div className="flex flex-col gap-3">
        {ASSET_TYPES.map((type) => (
          <Card key={type}>
            <CardContent className="flex items-center justify-between gap-3">
              <span className="font-medium">{ASSET_TYPE_LABELS[type]}</span>
              <CommissionRateInput
                assetType={type as AssetType}
                rate={ratesByType.get(type as AssetType) ?? DEFAULT_COMMISSION_RATES[type as AssetType]}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
