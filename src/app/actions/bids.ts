"use server";

import { revalidatePath } from "next/cache";
import { requireUser, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

const OPEN_BID_MAX_PRICE = 25000;
const OPEN_BID_WINDOW_DAYS = 7;

export async function openBidWindow(assetId: string, reservePrice: number) {
  await requireAdmin();
  const asset = await prisma.asset.findUniqueOrThrow({ where: { id: assetId } });
  if (!asset.price || Number(asset.price) >= OPEN_BID_MAX_PRICE) {
    throw new Error(`Open Bid is only for assets under $${OPEN_BID_MAX_PRICE.toLocaleString()}`);
  }

  const opensAt = new Date();
  const closesAt = new Date(opensAt.getTime() + OPEN_BID_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  await prisma.bidWindow.upsert({
    where: { assetId },
    update: { opensAt, closesAt, reservePrice, status: "OPEN" },
    create: { assetId, opensAt, closesAt, reservePrice, status: "OPEN" },
  });

  revalidatePath(`/asset/${asset.slug}`);
  revalidatePath("/");
}

export async function placeBid(bidWindowId: string, amount: number) {
  const buyer = await requireUser();
  const bidWindow = await prisma.bidWindow.findUniqueOrThrow({
    where: { id: bidWindowId },
    include: { asset: true, bids: { orderBy: { amount: "desc" }, take: 1 } },
  });

  if (bidWindow.status !== "OPEN" || bidWindow.closesAt < new Date()) {
    throw new Error("This bid window is closed");
  }
  const currentHigh = bidWindow.bids[0]?.amount ? Number(bidWindow.bids[0].amount) : 0;
  if (amount <= currentHigh) {
    throw new Error(`Bid must exceed the current high bid of $${currentHigh.toLocaleString()}`);
  }

  await prisma.bid.create({ data: { bidWindowId, buyerId: buyer.id, amount } });
  revalidatePath(`/asset/${bidWindow.asset.slug}`);
}
