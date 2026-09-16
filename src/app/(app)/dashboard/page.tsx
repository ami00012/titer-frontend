import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { formatMoney, ASSET_STATUS_LABELS } from "@/lib/format";
import { ASSET_TYPE_LABELS, type AssetTypeValue } from "@/lib/validation/asset";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const assets = user
    ? await prisma.asset.findMany({ where: { sellerId: user.id }, orderBy: { createdAt: "desc" } })
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Assets</h1>
        <Link href="/sell" className={buttonVariants({ size: "sm" })}>
          List a new asset
        </Link>
      </div>
      {assets.length === 0 ? (
        <p className="text-secondary-foreground">You haven&apos;t listed anything yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {assets.map((asset) => (
            <Card key={asset.id} className="transition-colors hover:ring-foreground/20">
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <Link href={`/dashboard/assets/${asset.id}`} className="min-w-0">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    {ASSET_TYPE_LABELS[asset.assetType as AssetTypeValue]}
                  </div>
                  <div className="font-medium hover:underline">{asset.title}</div>
                  {asset.price && <div className="text-sm text-secondary-foreground">{formatMoney(asset.price.toString(), asset.currency)}</div>}
                </Link>
                <div className="flex items-center gap-3">
                  {asset.status === "PUBLISHED" && (
                    <Link href={`/asset/${asset.slug}`} className="text-sm text-secondary-foreground hover:underline">
                      View listing
                    </Link>
                  )}
                  <Badge variant={asset.status === "PUBLISHED" ? "default" : "secondary"}>
                    {ASSET_STATUS_LABELS[asset.status]}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
