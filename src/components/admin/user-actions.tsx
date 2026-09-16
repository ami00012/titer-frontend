"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { suspendUser, setUserRole } from "@/app/actions/admin";

export function UserActions({ userId, suspended, role }: { userId: string; suspended: boolean; role: "BUYER" | "SELLER" | "ADMIN" }) {
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<void>) {
    startTransition(async () => {
      try {
        await action();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update user");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm"
        defaultValue={role}
        disabled={pending}
        onChange={(e) => run(() => setUserRole(userId, e.target.value as "BUYER" | "SELLER" | "ADMIN"))}
      >
        <option value="BUYER">Buyer</option>
        <option value="SELLER">Seller</option>
        <option value="ADMIN">Admin</option>
      </select>
      <Button size="sm" variant={suspended ? "outline" : "ghost"} disabled={pending} onClick={() => run(() => suspendUser(userId, !suspended))}>
        {suspended ? "Unsuspend" : "Suspend"}
      </Button>
    </div>
  );
}
