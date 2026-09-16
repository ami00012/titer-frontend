import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { VerificationReviewActions } from "@/components/admin/verification-review-actions";
import { VERIFICATION_LABELS } from "@/lib/format";

export default async function AdminVerificationPage() {
  const pending = await prisma.verification.findMany({
    where: { status: "PENDING" },
    include: { asset: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Verification queue</h1>
      {pending.length === 0 ? (
        <p className="text-secondary-foreground">Nothing pending review.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {pending.map((v) => (
            <Card key={v.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Link href={`/asset/${v.asset.slug}`} className="font-medium hover:underline">
                    {v.asset.title}
                  </Link>
                  <div className="text-sm text-secondary-foreground">{VERIFICATION_LABELS[v.type]}</div>
                  {v.evidence && (
                    <a href={v.evidence} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
                      View evidence
                    </a>
                  )}
                </div>
                <VerificationReviewActions verificationId={v.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
