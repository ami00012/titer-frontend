"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setAssetStatus } from "@/app/actions/assets";
import type { AssetStatus } from "@prisma/client";

const TRANSITIONS: Record<AssetStatus, { label: string; next: AssetStatus }[]> = {
  DRAFT: [],
  PENDING_REVIEW: [
    { label: "Publish", next: "PUBLISHED" },
    { label: "Reject", next: "ARCHIVED" },
  ],
  PUBLISHED: [{ label: "Unpublish", next: "PENDING_REVIEW" }],
  RESERVED: [{ label: "Mark sold", next: "SOLD" }],
  UNDER_OFFER: [{ label: "Back to published", next: "PUBLISHED" }],
  SOLD: [],
  RENTED: [],
  ARCHIVED: [{ label: "Restore to review", next: "PENDING_REVIEW" }],
};

export function AssetStatusActions({ assetId, status }: { assetId: string; status: AssetStatus }) {
  const [pending, startTransition] = useTransition();
  const actions = TRANSITIONS[status];
  if (actions.length === 0) return null;

  return (
    <div className="flex gap-2">
      {actions.map((action) => (
        <Button
          key={action.next}
          size="sm"
          variant={action.next === "ARCHIVED" ? "ghost" : "outline"}
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              try {
                await setAssetStatus(assetId, action.next);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to update status");
              }
            })
          }
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
