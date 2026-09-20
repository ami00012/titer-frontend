import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { ASSET_TYPE_LABELS, type AssetTypeValue } from "@/lib/validation/asset";

export default async function AdminValuationLeadsPage() {
  const leads = await prisma.valuationLead.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Valuation leads</h1>
      {leads.length === 0 ? (
        <p className="text-secondary-foreground">None yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {leads.map((lead) => (
            <Card key={lead.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{lead.email}</div>
                  <div className="text-sm text-secondary-foreground">
                    {ASSET_TYPE_LABELS[lead.assetType as AssetTypeValue]} · ${Number(lead.mrr).toLocaleString()} MRR
                  </div>
                </div>
                <div className="text-sm text-secondary-foreground">
                  ${Number(lead.estimatedLow).toLocaleString()}–${Number(lead.estimatedHigh).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
