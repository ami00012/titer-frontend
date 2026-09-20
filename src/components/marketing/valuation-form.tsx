"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { getValuationRange, unlockComparables, type ComparableSummary } from "@/app/actions/valuation";
import { ACTIVE_ASSET_TYPES, ASSET_TYPE_LABELS } from "@/lib/validation/asset";
import type { AssetType } from "@prisma/client";

export function ValuationForm() {
  const [pending, startTransition] = useTransition();
  const [range, setRange] = useState<{ low: number; high: number; provisionalGrade: string } | null>(null);
  const [comps, setComps] = useState<ComparableSummary[] | null>(null);
  const [email, setEmail] = useState("");
  const [lastInput, setLastInput] = useState<{
    assetType: AssetType;
    mrr: number;
    momGrowth?: number;
    churn?: number;
    inferenceCostPct?: number;
  } | null>(null);

  function handleEstimate(formData: FormData) {
    const input = {
      assetType: formData.get("assetType") as AssetType,
      mrr: Number(formData.get("mrr") ?? 0),
      momGrowth: formData.get("momGrowth") ? Number(formData.get("momGrowth")) : undefined,
      churn: formData.get("churn") ? Number(formData.get("churn")) : undefined,
      inferenceCostPct: formData.get("inferenceCostPct") ? Number(formData.get("inferenceCostPct")) : undefined,
    };
    if (!input.mrr) {
      toast.error("Enter a monthly revenue figure (0 is fine)");
      return;
    }
    startTransition(async () => {
      const result = await getValuationRange(input);
      setRange(result);
      setLastInput(input);
      setComps(null);
    });
  }

  function handleUnlock() {
    if (!lastInput) return;
    if (!email.includes("@")) {
      toast.error("Enter a valid email to see the comps behind this range");
      return;
    }
    startTransition(async () => {
      try {
        const result = await unlockComparables(lastInput, email);
        setComps(result);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Couldn't unlock comps");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <form action={handleEstimate} className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="assetType" className="text-xs">Category</Label>
            <select id="assetType" name="assetType" className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm" required>
              {ACTIVE_ASSET_TYPES.map((type) => (
                <option key={type} value={type}>{ASSET_TYPE_LABELS[type]}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="mrr" className="text-xs">MRR</Label>
            <Input id="mrr" name="mrr" type="number" required />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="momGrowth" className="text-xs">MoM growth (%)</Label>
            <Input id="momGrowth" name="momGrowth" type="number" step="0.1" />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="churn" className="text-xs">Churn (%)</Label>
            <Input id="churn" name="churn" type="number" step="0.1" />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <Label htmlFor="inferenceCostPct" className="text-xs">Inference cost (% of COGS, if applicable)</Label>
            <Input id="inferenceCostPct" name="inferenceCostPct" type="number" step="0.1" />
          </div>
        </div>
        <Button type="submit" disabled={pending} className="self-start">
          Get a range
        </Button>
      </form>

      {range && (
        <Card>
          <CardContent className="flex flex-col gap-3">
            <div>
              <div className="text-2xl font-semibold">
                ${range.low.toLocaleString()} – ${range.high.toLocaleString()}
              </div>
              <div className="text-sm text-secondary-foreground">{range.provisionalGrade} — not a scored Titer Score, illustrative only</div>
            </div>

            {comps === null ? (
              <div className="flex items-center gap-2">
                <Input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="max-w-xs" />
                <Button size="sm" variant="outline" disabled={pending} onClick={handleUnlock}>
                  See the comps behind this
                </Button>
              </div>
            ) : comps.length === 0 ? (
              <p className="text-sm text-secondary-foreground">No comps entered for this category yet.</p>
            ) : (
              <ul className="flex flex-col gap-1 text-sm">
                {comps.map((c, i) => (
                  <li key={i}>
                    {c.sizeBand} · {c.multiple}x · {c.source === "CLOSED_DEAL" ? "Closed deal" : "Public comp"}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
