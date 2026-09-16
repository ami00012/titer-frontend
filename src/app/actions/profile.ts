"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  const field = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" && value.trim() ? value.trim() : null;
  };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: field("name"),
      company: field("company"),
      bio: field("bio"),
      country: field("country"),
      website: field("website"),
    },
  });

  revalidatePath("/dashboard/profile");
}
