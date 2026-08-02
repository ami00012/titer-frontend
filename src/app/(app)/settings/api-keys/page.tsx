"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiErrorMessage } from "@/lib/api/client";
import { API_SCOPES, createApiKey, listApiKeys, revokeApiKey, rotateApiKey } from "@/lib/api/api-keys";

export default function ApiKeysPage() {
  const queryClient = useQueryClient();
  const { data: keys, isLoading } = useQuery({ queryKey: ["api-keys"], queryFn: listApiKeys });

  const [label, setLabel] = useState("");
  const [scopes, setScopes] = useState<string[]>(["score:read"]);
  const [justCreatedKey, setJustCreatedKey] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["api-keys"] });

  const create = useMutation({
    mutationFn: () => createApiKey(label, scopes),
    onSuccess: (created) => {
      setJustCreatedKey(created.rawKey);
      setLabel("");
      invalidate();
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Couldn't create key.")),
  });

  const revoke = useMutation({
    mutationFn: (id: string) => revokeApiKey(id),
    onSuccess: () => {
      toast.success("Key revoked.");
      invalidate();
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Couldn't revoke key.")),
  });

  const rotate = useMutation({
    mutationFn: (id: string) => rotateApiKey(id),
    onSuccess: (rotated) => {
      setJustCreatedKey(rotated.rawKey);
      invalidate();
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Couldn't rotate key.")),
  });

  function toggleScope(value: string) {
    setScopes((prev) => (prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]));
  }

  return (
    <div className="flex flex-col gap-6">
      {justCreatedKey ? (
        <Card className="ring-primary/40">
          <CardHeader>
            <CardTitle>Copy your key now</CardTitle>
            <CardDescription>This is the only time it will be shown.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-md bg-muted px-2.5 py-1.5 text-sm">{justCreatedKey}</code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(justCreatedKey);
                toast.success("Copied.");
              }}
            >
              Copy
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setJustCreatedKey(null)}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Create an API key</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate();
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="key-label">Label</Label>
              <Input id="key-label" required value={label} onChange={(e) => setLabel(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Scopes</Label>
              <div className="flex flex-wrap gap-3">
                {API_SCOPES.map((scope) => (
                  <label key={scope.value} className="flex items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={scopes.includes(scope.value)}
                      onChange={() => toggleScope(scope.value)}
                    />
                    {scope.label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Button type="submit" disabled={create.isPending || !label || scopes.length === 0}>
                {create.isPending ? "Creating…" : "Create key"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Keys</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
          {keys?.map((key) => (
            <div key={key.id} className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{key.label}</span>
                  {key.revoked ? <Badge variant="destructive">Revoked</Badge> : null}
                </div>
                <code className="text-xs text-muted-foreground">{key.keyPrefix}…</code>
                <div className="flex flex-wrap gap-1">
                  {key.scopes.map((s) => (
                    <Badge key={s} variant="outline">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
              {key.revoked ? null : (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => rotate.mutate(key.id)} disabled={rotate.isPending}>
                    Rotate
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => revoke.mutate(key.id)} disabled={revoke.isPending}>
                    Revoke
                  </Button>
                </div>
              )}
            </div>
          ))}
          {keys && keys.length === 0 ? <p className="text-sm text-muted-foreground">No API keys yet.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
