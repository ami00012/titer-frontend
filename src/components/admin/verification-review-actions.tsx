"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { reviewVerification } from "@/app/actions/admin";

export function VerificationReviewActions({ verificationId }: { verificationId: string }) {
  const [pending, startTransition] = useTransition();

  function run(status: "APPROVED" | "REJECTED") {
    startTransition(async () => {
      try {
        await reviewVerification(verificationId, status);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update verification");
      }
    });
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" disabled={pending} onClick={() => run("APPROVED")}>
        Approve
      </Button>
      <Button size="sm" variant="ghost" disabled={pending} onClick={() => run("REJECTED")}>
        Reject
      </Button>
    </div>
  );
}
