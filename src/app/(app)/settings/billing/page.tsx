"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEntitlements } from "@/hooks/use-entitlements";
import { apiErrorMessage } from "@/lib/api/client";
import { addSeat, openBillingPortal } from "@/lib/api/billing";
import { useUpgradeModalStore } from "@/lib/stores/upgrade-modal-store";

export default function BillingPage() {
  const { workspacePlan, entitlements, isLoading, refetch } = useEntitlements();
  const openUpgradeModal = useUpgradeModalStore((s) => s.openModal);

  const portal = useMutation({
    mutationFn: openBillingPortal,
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Couldn't open billing portal.")),
  });

  const seat = useMutation({
    mutationFn: addSeat,
    onSuccess: () => {
      toast.success("Seat added.");
      refetch();
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Couldn't add a seat.")),
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
            {entitlements.priceMonthlyUsd > 0 ? ` · $${entitlements.priceMonthlyUsd}/mo` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => openUpgradeModal({ reason: "Compare plans and upgrade." })}>
            Change plan
          </Button>
          <Button variant="outline" onClick={() => portal.mutate()} disabled={portal.isPending}>
            {portal.isPending ? "Opening…" : "Manage billing"}
          </Button>
          {entitlements.extraSeatPriceId ? (
            <Button variant="outline" onClick={() => seat.mutate()} disabled={seat.isPending}>
              {seat.isPending ? "Adding…" : "Add a seat"}
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
