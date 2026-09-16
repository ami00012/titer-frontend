"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { VerificationType } from "@prisma/client";

/**
 * Sellers submit a link/reference to evidence (bank statement export, GA
 * dashboard share link, WHOIS record, etc.) -- it sits PENDING until an
 * admin reviews it. There's no object-storage upload pipeline in this pass
 * (see ROADMAP.md); a URL is enough for the admin to review manually.
 */
export async function submitVerificationEvidence(assetId: string, type: VerificationType, evidence: string) {
  const user = await requireUser();
  const asset = await prisma.asset.findUniqueOrThrow({ where: { id: assetId } });
  if (asset.sellerId !== user.id) throw new Error("Not authorized");

  await prisma.verification.upsert({
    where: { assetId_type: { assetId, type } },
    update: { evidence, status: "PENDING", verifiedById: null, verifiedAt: null },
    create: { assetId, type, evidence, status: "PENDING" },
  });

  revalidatePath(`/dashboard/assets/${assetId}`);
  revalidatePath("/admin/verification");
}
