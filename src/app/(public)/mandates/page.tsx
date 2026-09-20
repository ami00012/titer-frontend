import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { PitchMandateDialog } from "@/components/marketplace/pitch-mandate-dialog";
import { formatMoney } from "@/lib/format";
import { ASSET_TYPE_LABELS, type AssetTypeValue } from "@/lib/validation/asset";

export const metadata: Metadata = {
  title: "Buyer mandates",
  description: "Named budgets, looking for a specific kind of asset. Pitch your listing directly to a buyer with money set aside.",
};

function daysAgo(date: Date): string {
  const days = Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export default async function MandatesPage() {
  const user = await getCurrentUser().catch(() => null);
  // Select, never include -- userId/user must never reach the client (§7 PII check).
  const mandates = await prisma.buyerRequest.findMany({
    where: { status: "OPEN" },
    select: {
      id: true,
      assetType: true,
      budgetMin: true,
      budgetMax: true,
      requirements: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Buyer mandates</h1>
        <p className="text-secondary-foreground">
          Real buyers, anonymized, with a budget set aside. If you&apos;re selling something that fits, pitch it
          directly instead of waiting for a match.
        </p>
      </div>

      {mandates.length === 0 ? (
        <p className="text-secondary-foreground">No open mandates right now — check back soon.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {mandates.map((mandate) => (
            <Card key={mandate.id}>
              <CardContent className="flex flex-col gap-2">
                <p className="font-medium">
                  Looking for:{" "}
                  {mandate.assetType ? ASSET_TYPE_LABELS[mandate.assetType as AssetTypeValue] : "Any asset type"}
                  {mandate.budgetMin || mandate.budgetMax ? (
                    <>
                      {" "}
                      · {formatMoney(mandate.budgetMin?.toString(), "USD") ?? "$0"}–
                      {formatMoney(mandate.budgetMax?.toString(), "USD") ?? "no cap"}
                    </>
                  ) : null}
                </p>
                {mandate.requirements && <p className="text-sm text-secondary-foreground">{mandate.requirements}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Posted {daysAgo(mandate.createdAt)}</span>
                  <PitchMandateDialog mandateId={mandate.id} isAuthenticated={!!user} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
