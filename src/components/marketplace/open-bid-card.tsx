"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { placeBid } from "@/app/actions/bids";

export interface PublicBidWindow {
  id: string;
  opensAt: Date;
  closesAt: Date;
  status: string;
  /** Only ever the single highest bid's amount -- reserve price and bidder identity never travel with this shape. */
  bids: { amount: unknown }[];
  _count: { bids: number };
}

function timeRemaining(closesAt: Date): string {
  const ms = closesAt.getTime() - Date.now();
  if (ms <= 0) return "Closed";
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  return days > 0 ? `${days}d ${hours}h remaining` : `${hours}h remaining`;
}

export function OpenBidCard({ bidWindow }: { bidWindow: PublicBidWindow }) {
  const [pending, startTransition] = useTransition();
  const [amount, setAmount] = useState("");
  const highBid = bidWindow.bids[0]?.amount ? Number(bidWindow.bids[0].amount) : null;

  function handleSubmit() {
    const value = Number(amount);
    if (!value || value <= 0) return;
    startTransition(async () => {
      try {
        await placeBid(bidWindow.id, value);
        toast.success("Bid placed");
        setAmount("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to place bid");
      }
    });
  }

  return (
    <Card className="border-primary/40">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold uppercase tracking-wide">Open Bid</span>
          <span className="text-sm text-secondary-foreground">{timeRemaining(bidWindow.closesAt)}</span>
        </div>
        <div className="flex items-baseline gap-4">
          <div>
            <div className="text-2xl font-semibold">{highBid ? `$${highBid.toLocaleString()}` : "No bids yet"}</div>
            <div className="text-xs text-muted-foreground">current high bid</div>
          </div>
          <div className="text-sm text-secondary-foreground">
            {bidWindow._count.bids} bid{bidWindow._count.bids === 1 ? "" : "s"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Your bid"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="max-w-[160px]"
          />
          <Button size="sm" disabled={pending} onClick={handleSubmit}>
            Place bid
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
