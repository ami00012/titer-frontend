"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEntitlements } from "@/hooks/use-entitlements";
import { useLocalizedCurrency } from "@/hooks/use-currency-symbol";
import { apiErrorMessage } from "@/lib/api/client";
import { openBillingPortal } from "@/lib/api/billing";
import { useUpgradeModalStore } from "@/lib/stores/upgrade-modal-store";

/** Extra seats are request-only, not self-serve (founder decision 2026-08-15 -- see PlanCatalog.java). */
const REQUEST_SEATS_MAILTO = "mailto:support@titer.dev?subject=Requesting%20more%20seats";

export default function BillingPage() {
  const { workspacePlan, entitlements, isLoading } = useEntitlements();
  const openUpgradeModal = useUpgradeModalStore((s) => s.openModal);
  const { symbol, convert } = useLocalizedCurrency();

  const portal = useMutation({
    mutationFn: openBillingPortal,
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Couldn't open billing portal.")),
  });

  if (isLoading || !entitlements) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Current plan
            <Badge>{workspacePlan}</Badge>
          </CardTitle>
          <CardDescription>
            {entitlements.seatsIncluded} seat{entitlements.seatsIncluded === 1 ? "" : "s"} included
            {entitlements.priceMonthlyUsd > 0 ? ` · ${symbol}${convert(entitlements.priceMonthlyUsd)}/mo` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => openUpgradeModal({ reason: "Compare plans and upgrade." })}>
            Change plan
          </Button>
          <Button variant="outline" onClick={() => portal.mutate()} disabled={portal.isPending}>
            {portal.isPending ? "Opening…" : "Manage billing"}
          </Button>
          <a href={REQUEST_SEATS_MAILTO} className={buttonVariants({ variant: "outline" })}>
            Request more seats
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
