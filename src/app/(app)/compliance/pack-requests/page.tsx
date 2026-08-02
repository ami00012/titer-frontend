"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import {
  approvePackRequest,
  createPackRequest,
  listAllPackRequests,
  rejectPackRequest,
  PACK_REQUEST_STATUS_LABEL,
  type PackRequest,
} from "@/lib/api/compliance";
import { track } from "@/lib/analytics";

const STATUS_BADGE: Record<PackRequest["status"], "outline" | "secondary" | "destructive" | "default"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
};

export default function PackRequestsPage() {
  const queryClient = useQueryClient();
  const [regimeName, setRegimeName] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [notes, setNotes] = useState("");

  const requestsQuery = useQuery({ queryKey: ["compliance", "pack-requests"], queryFn: listAllPackRequests });

  const createMutation = useMutation<PackRequest, ApiError, void>({
    mutationFn: () =>
      createPackRequest({
        regimeName,
        jurisdiction: jurisdiction || undefined,
        sourceUrl: sourceUrl || undefined,
        notes: notes || undefined,
      }),
    onSuccess: () => {
      track("compliance_pack_requested", { regimeName });
      setRegimeName("");
      setJurisdiction("");
      setSourceUrl("");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["compliance", "pack-requests"] });
    },
  });

  const approveMutation = useMutation<PackRequest, ApiError, string>({
    mutationFn: (id) => approvePackRequest(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["compliance", "pack-requests"] }),
  });

  const rejectMutation = useMutation<PackRequest, ApiError, string>({
    mutationFn: (id) => rejectPackRequest(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["compliance", "pack-requests"] }),
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/compliance" className="text-sm text-secondary-foreground hover:text-foreground">
          ← Compliance
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">Request a pack</h1>
        <p className="text-secondary-foreground">
          Ask for a new regulatory pack, or request that your own private policy be promoted to a built-in every
          workspace can use. Approving a request doesn&apos;t auto-publish it — a real pack still gets written and
          calibrated by hand, same bar as every existing built-in.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New request</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="regime-name">Regime name *</Label>
              <Input
                id="regime-name"
                value={regimeName}
                onChange={(e) => setRegimeName(e.target.value)}
                placeholder="e.g. UK ASA Influencer Guidance"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="jurisdiction">Jurisdiction</Label>
              <Input id="jurisdiction" value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} placeholder="e.g. United Kingdom" />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="source-url">Source URL</Label>
              <Input
                id="source-url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="Link to the regulation or guidance"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-input bg-transparent p-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                placeholder="Why this pack, and anything specific it should cover"
              />
            </div>
          </div>
          <div>
            <Button onClick={() => createMutation.mutate()} disabled={!regimeName.trim() || createMutation.isPending}>
              {createMutation.isPending ? "Submitting…" : "Submit request"}
            </Button>
          </div>
          {createMutation.isError ? (
            <p className="text-sm text-destructive">{apiErrorMessage(createMutation.error, "Couldn't submit the request.")}</p>
          ) : createMutation.isSuccess ? (
            <p className="text-sm text-secondary-foreground">Request submitted.</p>
          ) : null}
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold">All requests</h2>
          <p className="text-sm text-muted-foreground">
            Open to every authenticated user for now — there&apos;s no platform-admin role yet to gate approve/reject
            on (see DECISIONS-NEEDED.md). Not sensitive data, but treat this list as provisional.
          </p>
        </div>

        {requestsQuery.isPending ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : requestsQuery.isError ? (
          <p className="text-sm text-destructive">{apiErrorMessage(requestsQuery.error, "Couldn't load pack requests.")}</p>
        ) : requestsQuery.data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No requests yet.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Regime</th>
                  <th className="px-4 py-2 font-medium">Jurisdiction</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Requested</th>
                  <th className="px-4 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requestsQuery.data.map((req) => (
                  <tr key={req.id}>
                    <td className="px-4 py-2">
                      {req.regimeName}
                      {req.sourceUrl ? (
                        <a href={req.sourceUrl} target="_blank" rel="noreferrer" className="ml-2 text-xs text-secondary-foreground hover:underline">
                          source ↗
                        </a>
                      ) : null}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{req.jurisdiction ?? "—"}</td>
                    <td className="px-4 py-2">
                      <Badge variant={STATUS_BADGE[req.status]}>{PACK_REQUEST_STATUS_LABEL[req.status]}</Badge>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      {req.status === "pending" ? (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => approveMutation.mutate(req.id)} disabled={approveMutation.isPending}>
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => rejectMutation.mutate(req.id)} disabled={rejectMutation.isPending}>
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
