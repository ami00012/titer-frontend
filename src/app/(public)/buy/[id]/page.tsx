import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { matchAssetsForBuyerRequest } from "@/lib/matching";
import { AssetCard } from "@/components/marketplace/asset-card";

export default async function BuyerRequestResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/buy/${id}`);

  const request = await prisma.buyerRequest.findUnique({ where: { id } });
  if (!request || request.userId !== user.id) notFound();

  const assets = await prisma.asset.findMany({ where: { status: "PUBLISHED" } });
  const matches = matchAssetsForBuyerRequest(assets, request).filter((m) => m.score > 0).slice(0, 12);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold">Matches for your request</h1>
        <p className="max-w-2xl text-secondary-foreground">&ldquo;{request.description}&rdquo;</p>
      </div>
      {matches.length === 0 ? (
        <p className="text-secondary-foreground">No published listings match yet — we&apos;ll keep this on file as new assets are listed.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map(({ asset, score, reasons }) => (
            <div key={asset.id} className="flex flex-col gap-2">
              <AssetCard asset={asset} />
              <div className="rounded-lg border border-border p-3 text-sm">
                <div className="font-semibold">{score}% match</div>
                <ul className="mt-1 flex flex-col gap-0.5 text-secondary-foreground">
                  {reasons.map((reason) => (
                    <li key={reason}>✓ {reason}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
