import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";

export default async function AdminWindDownLeadsPage() {
  const leads = await prisma.windDownLead.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Wind-down leads</h1>
      {leads.length === 0 ? (
        <p className="text-secondary-foreground">None yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {leads.map((lead) => (
            <Card key={lead.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <a href={lead.url} target="_blank" rel="noreferrer" className="font-medium hover:underline">
                    {lead.url}
                  </a>
                  <div className="text-sm text-secondary-foreground">{lead.email}</div>
                </div>
                <div className="text-sm text-secondary-foreground">
                  {lead.monthlyRevenue !== null ? `${formatMoney(lead.monthlyRevenue.toString())}/mo` : "No revenue given"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
