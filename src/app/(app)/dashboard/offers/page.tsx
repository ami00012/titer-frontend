import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OfferActions } from "@/components/marketplace/offer-actions";
import { formatMoney } from "@/lib/format";

export default async function OffersPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const offers = await prisma.offer.findMany({
    where: { OR: [{ buyerId: user.id }, { sellerId: user.id }] },
    include: { asset: true, buyer: true, seller: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Offers</h1>
      {offers.length === 0 ? (
        <p className="text-secondary-foreground">No offers yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {offers.map((offer) => {
            const isSeller = offer.sellerId === user.id;
            const price = formatMoney((offer.counterPrice ?? offer.offerPrice).toString(), offer.currency);
            const canAct = isSeller && (offer.status === "SUBMITTED" || offer.status === "SELLER_REVIEW");
            return (
              <Card key={offer.id}>
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Link href={`/asset/${offer.asset.slug}`} className="font-medium hover:underline">
                      {offer.asset.title}
                    </Link>
                    <div className="text-sm text-secondary-foreground">
                      {price} · {isSeller ? `from ${offer.buyer.email}` : "your offer"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={offer.status === "ACCEPTED" ? "default" : "secondary"}>{offer.status}</Badge>
                    <OfferActions offerId={offer.id} canAct={canAct} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
