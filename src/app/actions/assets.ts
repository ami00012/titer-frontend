"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmailEvent } from "@/lib/email";
import { validateAssetSubmission, type AssetTypeValue } from "@/lib/validation/asset";
import type { AssetStatus, Prisma } from "@prisma/client";

function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Math.random().toString(36).slice(2, 7)
  );
}

export async function createAsset(assetType: AssetTypeValue, formData: FormData) {
  const user = await requireUser();
  // Untouched optional <input>s still submit as "" -- drop those so zod's
  // .optional() actually treats them as absent instead of coercing "" to 0.
  const raw = Object.fromEntries(
    Array.from(formData.entries()).filter(([, value]) => value !== ""),
  );
  const { base, metadata } = validateAssetSubmission(assetType, raw);

  const asset = await prisma.asset.create({
    data: {
      slug: slugify(base.title),
      title: base.title,
      description: base.description,
      assetType,
      status: "PENDING_REVIEW",
      category: base.category,
      businessModel: base.businessModel,
      price: base.price,
      currency: base.currency,
      pricingType: base.pricingType,
      revenue: base.revenue,
      monthlyRevenue: base.monthlyRevenue,
      profit: base.profit,
      monthlyProfit: base.monthlyProfit,
      growthRate: base.growthRate,
      customers: base.customers,
      traffic: base.traffic,
      metadata: metadata as Prisma.InputJsonValue,
      sellerId: user.id,
    },
  });

  await sendEmailEvent("listing_submitted", user.email, { title: asset.title });
  revalidatePath("/dashboard");
  redirect(`/dashboard`);
}

export async function setAssetStatus(assetId: string, status: AssetStatus) {
  const admin = await requireAdmin();
  const asset = await prisma.asset.update({ where: { id: assetId }, data: { status }, include: { seller: true } });

  if (status === "PUBLISHED") {
    await sendEmailEvent("listing_approved", asset.seller.email, { title: asset.title });
  }

  revalidatePath("/admin/assets");
  revalidatePath(`/asset/${asset.slug}`);
  return { adminId: admin.id, assetId: asset.id };
}
