"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEntitlements } from "@/hooks/use-entitlements";
import { startCheckout } from "@/lib/api/billing";
import { useUpgradeModalStore } from "@/lib/stores/upgrade-modal-store";

const PLAN_ORDER = ["free", "pro", "studio", "agency", "business"] as const;
const PLAN_LABEL: Record<string, string> = {
  pro: "Pro",
  studio: "Studio",
  agency: "Agency",
  business: "Business",
};

/**
 * The one upgrade modal in the app -- Locked and any other gated affordance
 * open it via useUpgradeModalStore instead of rendering their own checkout
 * flow. Rendered once at the app root (see (app)/layout.tsx).
 */
export function UpgradeModal() {
  const { open, reason, suggestedPlan, close } = useUpgradeModalStore();
  const { workspacePlan } = useEntitlements();
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);

  const currentIndex = workspacePlan ? PLAN_ORDER.indexOf(workspacePlan as (typeof PLAN_ORDER)[number]) : 0;
  const upgradeTargets = PLAN_ORDER.filter((_, i) => i > Math.max(currentIndex, 0));

  async function choosePlan(plan: string) {
    setPendingPlan(plan);
    try {
      const { url } = await startCheckout(plan);
      window.location.href = url;
    } catch {
      toast.error("Couldn't start checkout. Please try again.");
      setPendingPlan(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade your plan</DialogTitle>
          {reason ? <DialogDescription>{reason}</DialogDescription> : null}
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {upgradeTargets.map((plan) => (
            <Button
              key={plan}
              variant={plan === suggestedPlan ? "default" : "outline"}
              className="justify-between"
              disabled={pendingPlan !== null}
              onClick={() => choosePlan(plan)}
            >
              {PLAN_LABEL[plan]}
              {pendingPlan === plan ? "Redirecting…" : plan === suggestedPlan ? "Recommended" : ""}
            </Button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={close}>
            Not now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
