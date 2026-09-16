import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";

export default async function InquiriesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [received, sent] = await Promise.all([
    prisma.inquiry.findMany({ where: { asset: { sellerId: user.id } }, include: { asset: true, buyer: true }, orderBy: { createdAt: "desc" } }),
    prisma.inquiry.findMany({ where: { buyerId: user.id }, include: { asset: true }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold">Inquiries</h1>
      </div>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Received</h2>
        {received.length === 0 ? (
          <p className="text-sm text-secondary-foreground">No inquiries on your listings yet.</p>
        ) : (
          received.map((inquiry) => (
            <Card key={inquiry.id}>
              <CardContent className="flex flex-col gap-1">
                <Link href={`/asset/${inquiry.asset.slug}`} className="font-medium hover:underline">
                  {inquiry.asset.title}
                </Link>
                <p className="text-sm text-secondary-foreground">{inquiry.message || "No message included."}</p>
                <span className="text-xs text-muted-foreground">from {inquiry.buyer.email}</span>
              </CardContent>
            </Card>
          ))
        )}
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Sent</h2>
        {sent.length === 0 ? (
          <p className="text-sm text-secondary-foreground">You haven&apos;t requested information on anything yet.</p>
        ) : (
          sent.map((inquiry) => (
            <Card key={inquiry.id}>
              <CardContent className="flex flex-col gap-1">
                <Link href={`/asset/${inquiry.asset.slug}`} className="font-medium hover:underline">
                  {inquiry.asset.title}
                </Link>
                <p className="text-sm text-secondary-foreground">{inquiry.message || "No message included."}</p>
                <span className="text-xs text-muted-foreground">{inquiry.status}</span>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
