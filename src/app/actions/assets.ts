"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { requireUser, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmailEvent } from "@/lib/email";
import { validateAssetSubmission, type AssetTypeValue } from "@/lib/validation/asset";
import { ASSET_PRICE_CAP } from "@/lib/pricing";
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

  let base: ReturnType<typeof validateAssetSubmission>["base"];
  let metadata: ReturnType<typeof validateAssetSubmission>["metadata"];
  try {
    ({ base, metadata } = validateAssetSubmission(assetType, raw));
  } catch (err) {
    // Surface the specific zod issue (e.g. the price-cap message) rather
    // than the raw ZodError, which serializes to unreadable JSON in the
    // toast this throws into (see asset-form.tsx).
    if (err instanceof ZodError) {
      throw new Error(err.issues[0]?.message ?? "Check the listing details and try again.");
    }
    throw err;
  }

  // Belt-and-suspenders: the cap is also enforced by zod above and by a DB
  // CHECK constraint (prisma/migrations/20260925000000_asset_price_cap), but
  // a hard product rule like this gets its own explicit guard rather than
  // relying solely on validation library behavior staying correct forever.
  if (base.price !== undefined && base.price > ASSET_PRICE_CAP) {
    throw new Error("Titer is a micro-marketplace. Listings must be $1,000 or less.");
  }

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
      founderHoursPerWeek: base.founderHoursPerWeek,
      confidential: base.confidential,
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
