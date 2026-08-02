"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiErrorMessage } from "@/lib/api/client";
import { getWebhookDeliveries, replayWebhookDelivery } from "@/lib/api/webhooks";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  SUCCESS: "secondary",
  FAILED: "destructive",
  DEAD_LETTER: "destructive",
  PENDING: "outline",
};

export default function WebhookDeliveriesPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: deliveries, isLoading } = useQuery({
    queryKey: ["webhooks", id, "deliveries"],
    queryFn: () => getWebhookDeliveries(id),
  });

  const replay = useMutation({
    mutationFn: (deliveryId: string) => replayWebhookDelivery(id, deliveryId),
    onSuccess: () => {
      toast.success("Delivery replayed.");
      queryClient.invalidateQueries({ queryKey: ["webhooks", id, "deliveries"] });
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Couldn't replay delivery.")),
  });

  return (
    <div className="flex flex-col gap-6">
      <Link href="/settings/webhooks" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to webhooks
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Delivery log</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
          {deliveries?.map((delivery) => (
            <div
              key={delivery.id}
              className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{delivery.eventType}</span>
                  <Badge variant={STATUS_VARIANT[delivery.status] ?? "outline"}>{delivery.status}</Badge>
                  {delivery.responseStatus != null ? (
                    <span className="text-xs text-muted-foreground">HTTP {delivery.responseStatus}</span>
                  ) : null}
                </div>
                <span className="text-xs text-muted-foreground">
                  Attempt {delivery.attemptCount} · {new Date(delivery.createdAt).toLocaleString()}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => replay.mutate(delivery.id)}
                disabled={replay.isPending}
              >
                Replay
              </Button>
            </div>
          ))}
          {deliveries && deliveries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No deliveries yet.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
