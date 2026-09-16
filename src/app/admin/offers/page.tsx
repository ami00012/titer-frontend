import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format";

export default async function AdminOffersPage() {
  const offers = await prisma.offer.findMany({
    include: { asset: true, buyer: true, seller: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Offers</h1>
      <div className="flex flex-col gap-3">
        {offers.map((offer) => (
          <Card key={offer.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Link href={`/asset/${offer.asset.slug}`} className="font-medium hover:underline">
                  {offer.asset.title}
                </Link>
                <div className="text-sm text-secondary-foreground">
                  {formatMoney((offer.counterPrice ?? offer.offerPrice).toString(), offer.currency)} · {offer.buyer.email} → {offer.seller.email}
                </div>
              </div>
              <Badge variant={offer.status === "ACCEPTED" ? "default" : "secondary"}>{offer.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
