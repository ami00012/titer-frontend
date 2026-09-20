"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitWindDownLead } from "@/app/actions/wind-down";

export function WindDownForm() {
  const [pending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await submitWindDownLead(formData);
        setSubmitted(true);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Couldn't submit — try again");
      }
    });
  }

  if (submitted) {
    return (
      <p className="text-secondary-foreground">
        Got it. Someone from our team will reach out — even a project doing $0/month is worth a look before you
        shut it off.
      </p>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="url">URL</Label>
        <Input id="url" name="url" type="url" required placeholder="https://" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="monthlyRevenue">Monthly revenue (0 is fine)</Label>
        <Input id="monthlyRevenue" name="monthlyRevenue" type="number" min={0} placeholder="0" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Sending…" : "Get a read on it"}
      </Button>
    </form>
  );
}
