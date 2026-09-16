"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { VerificationStatus, AssetType } from "@prisma/client";

async function recomputeVerificationSummary(assetId: string) {
  const verifications = await prisma.verification.findMany({ where: { assetId } });
  const approved = verifications.filter((v) => v.status === "APPROVED").length;
  const summary = approved === 0 ? "UNVERIFIED" : approved < verifications.length ? "PARTIAL" : "VERIFIED";
  await prisma.asset.update({ where: { id: assetId }, data: { verificationSummary: summary } });
}

export async function reviewVerification(verificationId: string, status: VerificationStatus) {
  const admin = await requireAdmin();
  const verification = await prisma.verification.update({
    where: { id: verificationId },
    data: { status, verifiedById: admin.id, verifiedAt: new Date() },
  });
  await recomputeVerificationSummary(verification.assetId);
  revalidatePath("/admin/verification");
}

export async function suspendUser(userId: string, suspended: boolean) {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { suspended } });
  revalidatePath("/admin/users");
}

export async function setUserRole(userId: string, role: "BUYER" | "SELLER" | "ADMIN") {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
}

export async function updateCommissionRule(assetType: AssetType, ratePercent: number) {
  await requireAdmin();
  await prisma.commissionRule.upsert({
    where: { assetType },
    update: { ratePercent },
    create: { assetType, ratePercent },
  });
  revalidatePath("/admin/commission");
}

export async function updateTransactionStatus(transactionId: string, status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED") {
  await requireAdmin();
  const transaction = await prisma.transaction.update({ where: { id: transactionId }, data: { status }, include: { asset: true } });
  if (status === "COMPLETED") {
    await prisma.asset.update({ where: { id: transaction.assetId }, data: { status: "SOLD" } });
  }
  revalidatePath("/admin/transactions");
}
