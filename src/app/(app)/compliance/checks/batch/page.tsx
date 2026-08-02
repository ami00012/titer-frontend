"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import {
  listPolicies,
  startBatchCheck,
  getBatchJob,
  getBatchJobItems,
  OUTCOME_LABEL,
  type BatchCheckItemInput,
  type BatchCheckItemResult,
  type BatchCheckJob,
} from "@/lib/api/compliance";
import { track } from "@/lib/analytics";

const OUTCOME_BADGE: Record<string, "outline" | "secondary" | "destructive" | "default"> = {
  pass: "outline",
  flagged: "secondary",
  blocked: "destructive",
  overridden: "default",
  approved: "default",
};

/** Simple two-column CSV: header row with "text" and optional "contentRef"/"content_ref". No quoted-comma support -- good enough for a title/text pair, not a general CSV parser. */
function parseCsv(raw: string): BatchCheckItemInput[] {
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const textIndex = header.indexOf("text");
  const refIndex = header.indexOf("contentref") >= 0 ? header.indexOf("contentref") : header.indexOf("content_ref");
  if (textIndex === -1) {
    // No recognizable header -- treat every line as one item, whole line as text.
    return lines.map((line) => ({ text: line.trim() }));
  }
  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    return {
      text: (cols[textIndex] ?? "").trim(),
      contentRef: refIndex >= 0 ? (cols[refIndex] ?? "").trim() || undefined : undefined,
    };
  });
}

function parsePasted(raw: string): BatchCheckItemInput[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((text) => ({ text }));
}

export default function ComplianceBatchCheckPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <BatchCheckPageContent />
    </Suspense>
  );
}

function BatchCheckPageContent() {
  const searchParams = useSearchParams();
  const initialPolicyId = searchParams.get("policyId") ?? "";

  const [policyId, setPolicyId] = useState(initialPolicyId);
  const [pasted, setPasted] = useState("");
  const [csvItems, setCsvItems] = useState<BatchCheckItemInput[] | null>(null);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const policiesQuery = useQuery({ queryKey: ["compliance", "policies"], queryFn: listPolicies });

  const items = csvItems ?? parsePasted(pasted);

  const startMutation = useMutation<BatchCheckJob, ApiError, void>({
    mutationFn: () => startBatchCheck(policyId, items),
    onMutate: () => track("compliance_batch_check_started", { policyId, itemCount: items.length }),
  });

  const jobId = startMutation.data?.id;
  const jobQuery = useQuery({
    queryKey: ["compliance", "checks", "batch", jobId],
    queryFn: () => getBatchJob(jobId!),
    enabled: !!jobId,
  });

  const isDone = jobQuery.data?.status === "COMPLETED" || jobQuery.data?.status === "FAILED";

  // Manual poll loop rather than react-query's refetchInterval option -- more
  // predictable to reason about here, and avoids depending on the interval
  // getting rescheduled correctly off a callback reading query.state.data.
  useEffect(() => {
    if (!jobId || isDone) return;
    const interval = setInterval(() => {
      jobQuery.refetch();
    }, 1500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, isDone]);
  const itemsQuery = useQuery({
    queryKey: ["compliance", "checks", "batch", jobId, "items"],
    queryFn: () => getBatchJobItems(jobId!),
    enabled: !!jobId && isDone,
  });

  useEffect(() => {
    if (jobQuery.data?.status === "COMPLETED") {
      track("compliance_batch_check_completed", {
        policyId,
        total: jobQuery.data.totalItems,
        failed: jobQuery.data.failedItems,
      });
    }
  }, [jobQuery.data?.status, jobQuery.data?.totalItems, jobQuery.data?.failedItems, policyId]);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      setCsvItems(parseCsv(String(reader.result ?? "")));
      setCsvFileName(file.name);
    };
    reader.readAsText(file);
  }

  const canSubmit = !!policyId && items.length > 0 && !startMutation.isPending;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/compliance" className="text-sm text-secondary-foreground hover:text-foreground">
          ← Compliance
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">Batch check</h1>
        <p className="text-secondary-foreground">
          Check many pieces of content against one policy at once. Runs asynchronously — large batches won&apos;t
          time out your browser.
        </p>
      </div>

      {!jobId ? (
        <Card>
          <CardHeader>
            <CardTitle>Set up your batch</CardTitle>
            <CardDescription>Paste one item per line, or upload a CSV with a &quot;text&quot; column.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="batch-policy">Policy</Label>
              {policiesQuery.isPending ? (
                <p className="text-sm text-muted-foreground">Loading policies…</p>
              ) : policiesQuery.isError ? (
                <p className="text-sm text-destructive">{apiErrorMessage(policiesQuery.error, "Couldn't load policies.")}</p>
              ) : (
                <select
                  id="batch-policy"
                  value={policyId}
                  onChange={(e) => setPolicyId(e.target.value)}
                  className="h-8 w-full max-w-sm rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                >
                  <option value="">Select a policy…</option>
                  {policiesQuery.data.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="batch-text">Paste content (one item per line)</Label>
              <textarea
                id="batch-text"
                rows={8}
                value={pasted}
                onChange={(e) => {
                  setPasted(e.target.value);
                  setCsvItems(null);
                  setCsvFileName(null);
                }}
                placeholder={"First piece of content to check…\nSecond piece of content to check…"}
                className="w-full rounded-lg border border-input bg-transparent p-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">— or —</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                Upload CSV
              </Button>
              {csvFileName ? (
                <span className="text-sm text-muted-foreground">
                  {csvFileName} ({csvItems?.length ?? 0} rows)
                </span>
              ) : null}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{items.length} item{items.length === 1 ? "" : "s"} ready.</p>
              <Button onClick={() => startMutation.mutate()} disabled={!canSubmit}>
                {startMutation.isPending ? "Starting…" : "Run batch check"}
              </Button>
            </div>

            {startMutation.isError ? (
              <p className="text-sm text-destructive">{apiErrorMessage(startMutation.error, "Couldn't start the batch.")}</p>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <BatchProgress
          job={jobQuery.data}
          items={itemsQuery.data}
          isLoadingItems={itemsQuery.isPending && isDone}
        />
      )}
    </div>
  );
}

function BatchProgress({
  job,
  items,
  isLoadingItems,
}: {
  job: BatchCheckJob | undefined;
  items: BatchCheckItemResult[] | undefined;
  isLoadingItems: boolean;
}) {
  if (!job) {
    return <p className="text-sm text-muted-foreground">Starting…</p>;
  }

  const processed = job.completedItems + job.failedItems;
  const pct = job.totalItems === 0 ? 0 : Math.round((processed / job.totalItems) * 100);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {job.status === "COMPLETED" ? "Batch complete" : job.status === "FAILED" ? "Batch failed" : "Running…"}
            </CardTitle>
            <Badge variant={job.status === "FAILED" ? "destructive" : job.status === "COMPLETED" ? "default" : "secondary"}>
              {job.status}
            </Badge>
          </div>
          <CardDescription>
            {processed}/{job.totalItems} processed — {job.completedItems} succeeded, {job.failedItems} failed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
        </CardContent>
      </Card>

      {job.status === "COMPLETED" || job.status === "FAILED" ? (
        isLoadingItems ? (
          <p className="text-sm text-muted-foreground">Loading results…</p>
        ) : items && items.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Content</th>
                  <th className="px-4 py-2 font-medium">Outcome</th>
                  <th className="px-4 py-2 font-medium">Violations</th>
                  <th className="px-4 py-2 font-medium">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item, index) => (
                  <tr key={index} className="hover:bg-muted/20">
                    <td className="px-4 py-2">
                      {item.checkId ? (
                        <Link href={`/compliance/checks/${item.checkId}`} className="hover:underline">
                          {item.contentRef || item.checkId.slice(0, 8)}
                        </Link>
                      ) : (
                        item.contentRef || "—"
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {item.outcome ? (
                        <Badge variant={OUTCOME_BADGE[item.outcome.toLowerCase()] ?? "outline"}>
                          {OUTCOME_LABEL[item.outcome.toLowerCase() as keyof typeof OUTCOME_LABEL] ?? item.outcome}
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Failed</Badge>
                      )}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{item.violationCount ?? "—"}</td>
                    <td className="px-4 py-2 text-destructive">{item.error ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null
      ) : null}
    </div>
  );
}