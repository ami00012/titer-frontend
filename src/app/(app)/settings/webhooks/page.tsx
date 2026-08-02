"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiErrorMessage } from "@/lib/api/client";
import { WEBHOOK_EVENT_TYPES, deleteWebhook, listWebhooks, registerWebhook } from "@/lib/api/webhooks";

export default function WebhooksPage() {
  const queryClient = useQueryClient();
  const { data: endpoints, isLoading } = useQuery({ queryKey: ["webhooks"], queryFn: listWebhooks });

  const [url, setUrl] = useState("");
  const [eventTypes, setEventTypes] = useState<string[]>([...WEBHOOK_EVENT_TYPES]);
  const [justCreatedSecret, setJustCreatedSecret] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["webhooks"] });

  const register = useMutation({
    mutationFn: () => registerWebhook(url, eventTypes),
    onSuccess: (endpoint) => {
      setJustCreatedSecret(endpoint.secret);
      setUrl("");
      invalidate();
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Couldn't register webhook.")),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteWebhook(id),
    onSuccess: () => {
      toast.success("Webhook removed.");
      invalidate();
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Couldn't remove webhook.")),
  });

  function toggleEventType(value: string) {
    setEventTypes((prev) => (prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value]));
  }

  return (
    <div className="flex flex-col gap-6">
      {justCreatedSecret ? (
        <Card className="ring-primary/40">
          <CardHeader>
            <CardTitle>Copy your signing secret now</CardTitle>
            <CardDescription>Used to verify webhook payloads. This is the only time it will be shown.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-md bg-muted px-2.5 py-1.5 text-sm">{justCreatedSecret}</code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(justCreatedSecret);
                toast.success("Copied.");
              }}
            >
              Copy
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setJustCreatedSecret(null)}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Register a webhook</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              register.mutate();
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="webhook-url">URL</Label>
              <Input
                id="webhook-url"
                type="url"
                required
                placeholder="https://example.com/webhooks/titer"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Events</Label>
              <div className="flex flex-wrap gap-3">
                {WEBHOOK_EVENT_TYPES.map((eventType) => (
                  <label key={eventType} className="flex items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={eventTypes.includes(eventType)}
                      onChange={() => toggleEventType(eventType)}
                    />
                    {eventType}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Button type="submit" disabled={register.isPending || !url || eventTypes.length === 0}>
                {register.isPending ? "Registering…" : "Register webhook"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endpoints</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
          {endpoints?.map((endpoint) => (
            <div key={endpoint.id} className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">{endpoint.url}</span>
                <div className="flex flex-wrap gap-1">
                  {endpoint.eventTypes.map((e) => (
                    <Badge key={e} variant="outline">
                      {e}
                    </Badge>
                  ))}
                  {endpoint.enabled ? null : <Badge variant="destructive">Disabled</Badge>}
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/settings/webhooks/${endpoint.id}`}>
                  <Button size="sm" variant="outline">
                    Deliveries
                  </Button>
                </Link>
                <Button size="sm" variant="destructive" onClick={() => remove.mutate(endpoint.id)} disabled={remove.isPending}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {endpoints && endpoints.length === 0 ? (
            <p className="text-sm text-muted-foreground">No webhooks registered yet.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
