"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmailEvent } from "@/lib/email";

export async function requestInformation(assetId: string, message: string) {
  const buyer = await requireUser();
  const asset = await prisma.asset.findUniqueOrThrow({ where: { id: assetId }, include: { seller: true } });

  await prisma.inquiry.create({
    data: { assetId, buyerId: buyer.id, message: message || null },
  });

  await sendEmailEvent("buyer_inquiry", asset.seller.email, { title: asset.title });
  revalidatePath(`/asset/${asset.slug}`);
}
