import { apiFetch } from "@/lib/api/client";

export interface WebhookEndpoint {
  id: string;
  url: string;
  eventTypes: string[];
  enabled: boolean;
  createdAt: string;
  /** Only present on the response from register() -- shown once, never returned again. */
  secret: string | null;
}

export interface WebhookDelivery {
  id: string;
  eventType: string;
  status: string;
  attemptCount: number;
  lastAttemptedAt: string | null;
  nextRetryAt: string | null;
  responseStatus: number | null;
  createdAt: string;
}

/** Only "scan.completed" has a real producer today -- see WebhookService. */
export const WEBHOOK_EVENT_TYPES = ["scan.completed"] as const;

export function listWebhooks() {
  return apiFetch<WebhookEndpoint[]>("/v1/webhooks");
}

export function registerWebhook(url: string, eventTypes: string[]) {
  return apiFetch<WebhookEndpoint>("/v1/webhooks", {
    method: "POST",
    body: JSON.stringify({ url, eventTypes }),
  });
}

export function deleteWebhook(id: string) {
  return apiFetch<void>(`/v1/webhooks/${id}`, { method: "DELETE" });
}

export function getWebhookDeliveries(id: string) {
  return apiFetch<WebhookDelivery[]>(`/v1/webhooks/${id}/deliveries`);
}

export function replayWebhookDelivery(id: string, deliveryId: string) {
  return apiFetch<WebhookDelivery>(`/v1/webhooks/${id}/deliveries/${deliveryId}/replay`, {
    method: "POST",
  });
}
