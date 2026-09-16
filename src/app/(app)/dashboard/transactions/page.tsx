import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format";

export default async function TransactionsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const transactions = await prisma.transaction.findMany({
    where: { OR: [{ buyerId: user.id }, { sellerId: user.id }] },
    include: { asset: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Transactions</h1>
      {transactions.length === 0 ? (
        <p className="text-secondary-foreground">No transactions yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {transactions.map((tx) => {
            const isSeller = tx.sellerId === user.id;
            return (
              <Card key={tx.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Link href={`/asset/${tx.asset.slug}`} className="font-medium hover:underline">
                      {tx.asset.title}
                    </Link>
                    <div className="text-sm text-secondary-foreground">
                      {formatMoney(tx.agreedPrice.toString())} agreed
                      {isSeller && ` · ${formatMoney(tx.sellerProceeds.toString())} to you after ${tx.commissionRate}% commission`}
                    </div>
                  </div>
                  <Badge variant={tx.status === "COMPLETED" ? "default" : "secondary"}>{tx.status}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
