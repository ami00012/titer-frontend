import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { VerificationEvidenceForm } from "@/components/marketplace/verification-evidence-form";
import { ASSET_STATUS_LABELS } from "@/lib/format";
import type { VerificationType } from "@prisma/client";

const VERIFICATION_TYPES: VerificationType[] = [
  "REVENUE_VERIFIED",
  "TRAFFIC_VERIFIED",
  "OWNERSHIP_VERIFIED",
  "CUSTOMERS_VERIFIED",
  "TECHNOLOGY_VERIFIED",
  "IDENTITY_VERIFIED",
];

export default async function ManageAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/dashboard/assets/${id}`);

  const asset = await prisma.asset.findUnique({ where: { id }, include: { verifications: true } });
  if (!asset || asset.sellerId !== user.id) notFound();

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">{asset.title}</h1>
        <p className="text-sm text-secondary-foreground">Status: {ASSET_STATUS_LABELS[asset.status]}</p>
      </div>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Verification</h2>
        <p className="text-sm text-secondary-foreground">
          Submit evidence for any claim you&apos;d like verified. Our team reviews it before the badge appears publicly.
        </p>
        <div className="flex flex-col gap-3">
          {VERIFICATION_TYPES.map((type) => {
            const existing = asset.verifications.find((v) => v.type === type);
            return <VerificationEvidenceForm key={type} assetId={asset.id} type={type} status={existing?.status} />;
          })}
        </div>
      </section>
    </div>
  );
}
