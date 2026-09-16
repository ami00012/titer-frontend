"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { requestInformation } from "@/app/actions/inquiries";
import { submitOffer } from "@/app/actions/offers";

export function AssetActions({
  assetId,
  slug,
  isAuthenticated,
  isOwnListing,
}: {
  assetId: string;
  slug: string;
  isAuthenticated: boolean;
  isOwnListing: boolean;
}) {
  if (isOwnListing) return null;

  if (!isAuthenticated) {
    return (
      <div className="flex flex-wrap gap-3">
        <Link href={`/login?next=/asset/${slug}`} className={buttonVariants()}>
          Make an Offer
        </Link>
        <Link href={`/login?next=/asset/${slug}`} className={buttonVariants({ variant: "outline" })}>
          Request Information
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <OfferDialog assetId={assetId} />
      <InformationDialog assetId={assetId} />
    </div>
  );
}

function OfferDialog({ assetId }: { assetId: string }) {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    const amount = Number(price);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid offer amount");
      return;
    }
    startTransition(async () => {
      await submitOffer(assetId, amount, message);
      toast.success("Offer submitted");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Make an Offer</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Make an offer</DialogTitle>
          <DialogDescription>Your offer goes to the seller through our broker workflow.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input type="number" placeholder="Offer amount" value={price} onChange={(e) => setPrice(e.target.value)} />
          <Textarea placeholder="Optional message to the seller" value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost">Cancel</Button>} />
          <Button onClick={handleSubmit} disabled={pending}>
            {pending ? "Submitting…" : "Submit offer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InformationDialog({ assetId }: { assetId: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    startTransition(async () => {
      await requestInformation(assetId, message);
      toast.success("Request sent to the seller");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline">Request Information</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request information</DialogTitle>
          <DialogDescription>We&apos;ll pass your question to the seller without sharing your contact details directly.</DialogDescription>
        </DialogHeader>
        <Textarea placeholder="What would you like to know?" value={message} onChange={(e) => setMessage(e.target.value)} />
        <DialogFooter>
          <DialogClose render={<Button variant="ghost">Cancel</Button>} />
          <Button onClick={handleSubmit} disabled={pending}>
            {pending ? "Sending…" : "Send request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
