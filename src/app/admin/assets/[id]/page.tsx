import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { TiterScoreForm, ModelRiskForm, ProofRunForm, OpenBidForm } from "@/components/admin/asset-scoring-form";
import { formatMoney } from "@/lib/format";
import { ASSET_TYPE_LABELS, type AssetTypeValue } from "@/lib/validation/asset";

export default async function AdminAssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: { titerScore: true, proofRuns: { orderBy: { ranAt: "desc" }, take: 5 }, seller: true, bidWindow: true },
  });
  if (!asset) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/admin/assets" className="text-sm text-secondary-foreground hover:underline">
          ← Assets
        </Link>
        <h1 className="text-2xl font-semibold">{asset.title}</h1>
        <p className="text-sm text-secondary-foreground">
          {ASSET_TYPE_LABELS[asset.assetType as AssetTypeValue]} · {asset.seller.email}
          {asset.price && <> · {formatMoney(asset.price.toString(), asset.currency)}</>}
        </p>
        <Link href={`/asset/${asset.slug}`} className="text-sm hover:underline">
          View public listing →
        </Link>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Titer Score</h2>
          <TiterScoreForm assetId={asset.id} existing={asset.titerScore} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Model Risk block</h2>
          <ModelRiskForm assetId={asset.id} asset={asset} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Proof of Function</h2>
          {asset.proofRuns.length > 0 && (
            <ul className="flex flex-col gap-1 text-sm text-secondary-foreground">
              {asset.proofRuns.map((run) => (
                <li key={run.id}>
                  {run.ranAt.toDateString()} · {run.requestCount} requests · {Number(run.successRate)}% success · p95{" "}
                  {run.p95Ms}ms · ${Number(run.costPerTaskUsd)}/task
                </li>
              ))}
            </ul>
          )}
          <ProofRunForm assetId={asset.id} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Open Bid</h2>
          <OpenBidForm assetId={asset.id} bidWindow={asset.bidWindow} />
        </CardContent>
      </Card>
    </div>
  );
}
