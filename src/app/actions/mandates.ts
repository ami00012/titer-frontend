"use server";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmailEvent } from "@/lib/email";
import { TEAM_NOTIFICATION_EMAIL } from "@/lib/brand";

/** Notifies the team, not the buyer directly -- the buyer's identity never reaches the pitching seller. */
export async function pitchMandate(mandateId: string, message: string) {
  const seller = await requireUser();
  if (!message.trim()) throw new Error("Say a little about what you're offering");

  const mandate = await prisma.buyerRequest.findUniqueOrThrow({ where: { id: mandateId } });
  if (mandate.status !== "OPEN") throw new Error("This mandate is no longer open");

  await sendEmailEvent("mandate_pitch", TEAM_NOTIFICATION_EMAIL, {
    mandateId,
    fromEmail: seller.email,
    message,
  });
}
