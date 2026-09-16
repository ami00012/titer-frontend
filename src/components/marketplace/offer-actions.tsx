"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { acceptOffer, rejectOffer, counterOffer } from "@/app/actions/offers";

export function OfferActions({ offerId, canAct }: { offerId: string; canAct: boolean }) {
  const [countering, setCountering] = useState(false);
  const [counterPrice, setCounterPrice] = useState("");
  const [pending, startTransition] = useTransition();

  if (!canAct) return null;

  function run(action: () => Promise<void>) {
    startTransition(async () => {
      try {
        await action();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  if (countering) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder="Counter amount"
          className="w-32"
          value={counterPrice}
          onChange={(e) => setCounterPrice(e.target.value)}
        />
        <Button
          size="sm"
          disabled={pending}
          onClick={() => run(() => counterOffer(offerId, Number(counterPrice)))}
        >
          Send
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setCountering(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" disabled={pending} onClick={() => run(() => acceptOffer(offerId))}>
        Accept
      </Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => setCountering(true)}>
        Counter
      </Button>
      <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => rejectOffer(offerId))}>
        Reject
      </Button>
    </div>
  );
}
