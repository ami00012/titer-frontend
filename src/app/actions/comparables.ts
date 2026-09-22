"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { AssetType, ComparableSource } from "@prisma/client";

export async function createComparable(formData: FormData) {
  await requireAdmin();
  const assetType = formData.get("assetType") as AssetType;
  const sizeBand = String(formData.get("sizeBand") ?? "").trim();
  const multiple = Number(formData.get("multiple") ?? 0);
  const source = formData.get("source") as ComparableSource;
  const notes = String(formData.get("notes") ?? "").trim();
  const dealDateRaw = String(formData.get("dealDate") ?? "").trim();

  if (!sizeBand || !multiple) throw new Error("Size band and multiple are required");

  await prisma.comparable.create({
    data: {
      assetType,
      sizeBand,
      multiple,
      source,
      notes: notes || null,
      dealDate: dealDateRaw ? new Date(dealDateRaw) : null,
    },
  });

  revalidatePath("/admin/comparables");
  revalidatePath("/titer-index");
  revalidatePath("/valuate");
}

export async function deleteComparable(id: string) {
  await requireAdmin();
  await prisma.comparable.delete({ where: { id } });
  revalidatePath("/admin/comparables");
  revalidatePath("/titer-index");
  revalidatePath("/valuate");
}
