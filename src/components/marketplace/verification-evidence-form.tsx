"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitVerificationEvidence } from "@/app/actions/verification";
import { VERIFICATION_LABELS } from "@/lib/format";
import type { VerificationType, VerificationStatus } from "@prisma/client";

export function VerificationEvidenceForm({
  assetId,
  type,
  status,
}: {
  assetId: string;
  type: VerificationType;
  status?: VerificationStatus;
}) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    const evidence = String(formData.get("evidence") ?? "").trim();
    if (!evidence) return;
    startTransition(async () => {
      try {
        await submitVerificationEvidence(assetId, type, evidence);
        toast.success("Evidence submitted for review");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to submit evidence");
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex items-center gap-2">
      <span className="w-44 shrink-0 text-sm">{VERIFICATION_LABELS[type]}</span>
      {status === "APPROVED" ? (
        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">✓ Verified</span>
      ) : (
        <>
          <Input name="evidence" placeholder="Link to evidence" className="max-w-xs" />
          <Button type="submit" size="sm" variant="outline" disabled={pending}>
            {status === "PENDING" ? "Resubmit" : "Submit"}
          </Button>
          {status === "PENDING" && <span className="text-xs text-muted-foreground">Pending review</span>}
          {status === "REJECTED" && <span className="text-xs text-destructive">Rejected — resubmit with better evidence</span>}
        </>
      )}
    </form>
  );
}
