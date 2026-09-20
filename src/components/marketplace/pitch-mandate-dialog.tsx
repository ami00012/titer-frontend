"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { pitchMandate } from "@/app/actions/mandates";

export function PitchMandateDialog({ mandateId, isAuthenticated }: { mandateId: string; isAuthenticated: boolean }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  if (!isAuthenticated) {
    return (
      <Link href={`/login?next=/mandates`} className={buttonVariants({ variant: "outline", size: "sm" })}>
        Pitch this buyer
      </Link>
    );
  }

  function handleSubmit() {
    if (!message.trim()) {
      toast.error("Say a little about what you're offering");
      return;
    }
    startTransition(async () => {
      try {
        await pitchMandate(mandateId, message);
        toast.success("Sent — we'll pass it along");
        setOpen(false);
        setMessage("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to send");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm">Pitch this buyer</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pitch this buyer</DialogTitle>
          <DialogDescription>
            We&apos;ll pass this to our team, who&apos;ll relay it to the buyer without exposing their contact
            details directly.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="What do you have that fits this mandate?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
        />
        <DialogFooter>
          <DialogClose render={<Button variant="ghost">Cancel</Button>} />
          <Button onClick={handleSubmit} disabled={pending}>
            {pending ? "Sending…" : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
