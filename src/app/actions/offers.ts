"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmailEvent } from "@/lib/email";
import { getCommissionRate, computeCommission } from "@/lib/commission";

export async function submitOffer(assetId: string, offerPrice: number, message: string) {
  const buyer = await requireUser();
  const asset = await prisma.asset.findUniqueOrThrow({ where: { id: assetId }, include: { seller: true } });

  if (asset.sellerId === buyer.id) throw new Error("You can't make an offer on your own listing");

  const offer = await prisma.offer.create({
    data: {
      assetId,
      buyerId: buyer.id,
      sellerId: asset.sellerId,
      offerPrice,
      currency: asset.currency,
      message: message || null,
      status: "SUBMITTED",
    },
  });

  await prisma.asset.update({ where: { id: assetId }, data: { status: "UNDER_OFFER" } });
  await sendEmailEvent("new_offer", asset.seller.email, { title: asset.title, amount: `${asset.currency} ${offerPrice}` });

  revalidatePath(`/asset/${asset.slug}`);
  revalidatePath("/dashboard/offers");
  return offer.id;
}

async function requireOfferParty(offerId: string) {
  const user = await requireUser();
  const offer = await prisma.offer.findUniqueOrThrow({ where: { id: offerId }, include: { asset: true, buyer: true, seller: true } });
  if (user.id !== offer.buyerId && user.id !== offer.sellerId) throw new Error("Not authorized");
  return { user, offer };
}

export async function counterOffer(offerId: string, counterPrice: number) {
  const { user, offer } = await requireOfferParty(offerId);
  await prisma.offer.update({ where: { id: offerId }, data: { status: "COUNTERED", counterPrice } });
  const recipient = user.id === offer.sellerId ? offer.buyer : offer.seller;
  await sendEmailEvent("counteroffer", recipient.email, { title: offer.asset.title, amount: `${offer.currency} ${counterPrice}` });
  revalidatePath("/dashboard/offers");
}

export async function rejectOffer(offerId: string) {
  const { offer } = await requireOfferParty(offerId);
  await prisma.offer.update({ where: { id: offerId }, data: { status: "REJECTED" } });
  await prisma.asset.update({ where: { id: offer.assetId }, data: { status: "PUBLISHED" } });
  await sendEmailEvent("offer_rejected", offer.buyer.email, { title: offer.asset.title });
  revalidatePath("/dashboard/offers");
}

export async function acceptOffer(offerId: string) {
  const { user, offer } = await requireOfferParty(offerId);
  if (user.id !== offer.sellerId) throw new Error("Only the seller can accept an offer");

  const agreedPrice = Number(offer.counterPrice ?? offer.offerPrice);
  const commissionRate = await getCommissionRate(offer.asset.assetType);
  const { commissionAmount, sellerProceeds } = computeCommission(agreedPrice, commissionRate);

  await prisma.$transaction([
    prisma.offer.update({ where: { id: offerId }, data: { status: "ACCEPTED" } }),
    prisma.asset.update({ where: { id: offer.assetId }, data: { status: "RESERVED" } }),
    prisma.transaction.create({
      data: {
        assetId: offer.assetId,
        offerId: offer.id,
        buyerId: offer.buyerId,
        sellerId: offer.sellerId,
        agreedPrice,
        commissionRate,
        commissionAmount,
        sellerProceeds,
        status: "PENDING",
      },
    }),
  ]);

  await sendEmailEvent("offer_accepted", offer.buyer.email, { title: offer.asset.title, amount: `${offer.currency} ${agreedPrice}` });
  revalidatePath("/dashboard/offers");
  revalidatePath("/dashboard/transactions");
}
