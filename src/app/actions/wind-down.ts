"use server";

import { prisma } from "@/lib/db";
import { sendEmailEvent } from "@/lib/email";
import { TEAM_NOTIFICATION_EMAIL } from "@/lib/brand";

export async function submitWindDownLead(formData: FormData) {
  const url = String(formData.get("url") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const monthlyRevenueRaw = formData.get("monthlyRevenue");

  if (!url) throw new Error("URL is required");
  if (!email) throw new Error("Email is required");

  const monthlyRevenue = monthlyRevenueRaw !== null && monthlyRevenueRaw !== "" ? Number(monthlyRevenueRaw) : null;

  await prisma.windDownLead.create({ data: { url, email, monthlyRevenue } });
  await sendEmailEvent("wind_down_lead", TEAM_NOTIFICATION_EMAIL, {
    url,
    email,
    monthlyRevenue: monthlyRevenue !== null ? String(monthlyRevenue) : "not given",
  });
}
