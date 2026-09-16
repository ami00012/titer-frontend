"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateCommissionRule } from "@/app/actions/admin";
import type { AssetType } from "@prisma/client";

export function CommissionRateInput({ assetType, rate }: { assetType: AssetType; rate: number }) {
  const [value, setValue] = useState(String(rate));
  const [pending, startTransition] = useTransition();

  function save() {
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
      toast.error("Enter a rate between 0 and 100");
      return;
    }
    startTransition(async () => {
      await updateCommissionRule(assetType, parsed);
      toast.success("Commission rate updated");
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Input type="number" step="0.1" className="w-24" value={value} onChange={(e) => setValue(e.target.value)} />
      <span className="text-sm text-muted-foreground">%</span>
      <Button size="sm" variant="outline" disabled={pending} onClick={save}>
        Save
      </Button>
    </div>
  );
}
