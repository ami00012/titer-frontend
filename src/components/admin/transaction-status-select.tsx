"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateTransactionStatus } from "@/app/actions/admin";
import type { TransactionStatus } from "@prisma/client";

const STATUSES: TransactionStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export function TransactionStatusSelect({ transactionId, status }: { transactionId: string; status: TransactionStatus }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm"
      defaultValue={status}
      disabled={pending}
      onChange={(e) =>
        startTransition(async () => {
          try {
            await updateTransactionStatus(transactionId, e.target.value as TransactionStatus);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update transaction");
          }
        })
      }
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
