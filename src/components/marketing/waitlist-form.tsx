"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { track } from "@/lib/analytics";
import { submitLead } from "@/lib/api/leads";

type Status = "idle" | "submitting" | "success" | "error";

export function WaitlistForm() {
  const formId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      await submitLead({ type: "waitlist_signup", workEmail: email });
      setStatus("success");
      track("waitlist_signup", {});
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="text-sm text-[color:var(--titer-ink)]">
        You&apos;re on the list — we&apos;ll email you the moment Titer opens up.
      </p>
    );
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <form onSubmit={onSubmit} className="flex w-full flex-col gap-2 sm:flex-row">
        <label htmlFor={`${formId}-email`} className="sr-only">
          Work email
        </label>
        <Input
          id={`${formId}-email`}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="sm:flex-1"
        />
        <Button type="submit" disabled={status === "submitting"} className="rounded-full">
          {status === "submitting" ? "Joining…" : "Notify me"}
        </Button>
      </form>
      {status === "error" ? (
        <p className="text-sm text-[color:var(--titer-ink)]">Something went wrong. Try again in a moment.</p>
      ) : null}
    </div>
  );
}
