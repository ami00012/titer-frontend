"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteComparable } from "@/app/actions/comparables";

export function ComparableDeleteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          try {
            await deleteComparable(id);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete");
          }
        })
      }
    >
      Delete
    </Button>
  );
}
