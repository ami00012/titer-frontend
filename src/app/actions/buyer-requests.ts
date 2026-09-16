"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { AssetType } from "@prisma/client";

export async function createBuyerRequest(formData: FormData) {
  const user = await requireUser();
  const description = String(formData.get("description") ?? "").trim();
  if (description.length < 10) throw new Error("Tell us a bit more about what you're looking for");

  const assetType = formData.get("assetType");
  const budgetMin = formData.get("budgetMin");
  const budgetMax = formData.get("budgetMax");

  const request = await prisma.buyerRequest.create({
    data: {
      userId: user.id,
      description,
      requirements: description,
      assetType: assetType ? (assetType as AssetType) : undefined,
      budgetMin: budgetMin ? Number(budgetMin) : undefined,
      budgetMax: budgetMax ? Number(budgetMax) : undefined,
    },
  });

  redirect(`/buy/${request.id}`);
}
