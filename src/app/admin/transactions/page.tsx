import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { TransactionStatusSelect } from "@/components/admin/transaction-status-select";
import { formatMoney } from "@/lib/format";

export default async function AdminTransactionsPage() {
  const transactions = await prisma.transaction.findMany({
    include: { asset: true, buyer: true, seller: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const gmv = transactions.reduce((sum, tx) => sum + Number(tx.agreedPrice), 0);
  const commission = transactions.reduce((sum, tx) => sum + Number(tx.commissionAmount), 0);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Transactions</h1>
      <div className="flex gap-6 text-sm text-secondary-foreground">
        <span>GMV: <strong className="text-foreground">{formatMoney(gmv)}</strong></span>
        <span>Marketplace revenue: <strong className="text-foreground">{formatMoney(commission)}</strong></span>
      </div>
      <div className="flex flex-col gap-3">
        {transactions.map((tx) => (
          <Card key={tx.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Link href={`/asset/${tx.asset.slug}`} className="font-medium hover:underline">
                  {tx.asset.title}
                </Link>
                <div className="text-sm text-secondary-foreground">
                  {formatMoney(tx.agreedPrice.toString())} · commission {formatMoney(tx.commissionAmount.toString())} ({tx.commissionRate.toString()}%) · seller gets{" "}
                  {formatMoney(tx.sellerProceeds.toString())}
                </div>
                <div className="text-xs text-muted-foreground">{tx.buyer.email} → {tx.seller.email}</div>
              </div>
              <TransactionStatusSelect transactionId={tx.id} status={tx.status} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
