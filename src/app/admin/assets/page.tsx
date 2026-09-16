import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AssetStatusActions } from "@/components/admin/asset-status-actions";
import { ASSET_STATUS_LABELS, formatMoney } from "@/lib/format";
import { ASSET_TYPE_LABELS, type AssetTypeValue } from "@/lib/validation/asset";

export default async function AdminAssetsPage() {
  const assets = await prisma.asset.findMany({
    include: { seller: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Assets</h1>
      <div className="flex flex-col gap-3">
        {assets.map((asset) => (
          <Card key={asset.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {ASSET_TYPE_LABELS[asset.assetType as AssetTypeValue]} · {asset.seller.email}
                </div>
                <Link href={`/asset/${asset.slug}`} className="font-medium hover:underline">
                  {asset.title}
                </Link>
                {asset.price && <div className="text-sm text-secondary-foreground">{formatMoney(asset.price.toString(), asset.currency)}</div>}
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={asset.status === "PUBLISHED" ? "default" : "secondary"}>{ASSET_STATUS_LABELS[asset.status]}</Badge>
                <AssetStatusActions assetId={asset.id} status={asset.status} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
