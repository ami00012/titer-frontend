"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { listDimensions, listPolicies, OUTCOME_LABEL } from "@/lib/api/compliance";
import {
  downloadSiteAuditExport,
  getSiteAudit,
  getSiteAuditItems,
  listSiteAudits,
  startSiteAudit,
  type SiteAuditItem,
  type SiteAuditJob,
} from "@/lib/api/site-audit";
import { track } from "@/lib/analytics";

type Doorway = "seo" | "content" | "compliance";

const OUTCOME_BADGE: Record<string, "outline" | "secondary" | "destructive" | "default"> = {
  pass: "outline",
  flagged: "secondary",
  blocked: "destructive",
  overridden: "default",
  approved: "default",
};

export default function QualityPage() {
  const [doorway, setDoorway] = useState<Doorway>("seo");
  const [inputMode, setInputMode] = useState<"domain" | "urls">("domain");
  const [domain, setDomain] = useState("");
  const [urlsText, setUrlsText] = useState("");
  const [dimensionKey, setDimensionKey] = useState("");
  const [policyId, setPolicyId] = useState("");
  // Set when clicking into a past job from "Recent audits"; a fresh start
  // (startMutation.data?.id) takes precedence once it exists, so kicking off
  // a new audit while viewing an old one still shows the new one's progress.
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const dimensionsQuery = useQuery({ queryKey: ["dimensions"], queryFn: listDimensions, enabled: doorway === "content" });
  const policiesQuery = useQuery({ queryKey: ["compliance", "policies"], queryFn: listPolicies, enabled: doorway === "compliance" });
  const recentAuditsQuery = useQuery({ queryKey: ["quality", "jobs"], queryFn: listSiteAudits });

  const startMutation = useMutation<SiteAuditJob, ApiError, void>({
    mutationFn: () => {
      const urls = urlsText
        .split(/\r?\n/)
        .map((u) => u.trim())
        .filter(Boolean);
      return startSiteAudit({
        domain: inputMode === "domain" ? domain : undefined,
        urls: inputMode === "urls" ? urls : undefined,
        policyId: doorway === "compliance" ? policyId : undefined,
        dimensionKeys: doorway === "content" && dimensionKey ? [dimensionKey] : undefined,
      });
    },
    onMutate: () => track("quality_audit_started", { doorway, inputMode }),
    onSuccess: () => {
      setSelectedJobId(null);
      recentAuditsQuery.refetch();
    },
  });

  const jobId = startMutation.data?.id ?? selectedJobId ?? undefined;
  const jobQuery = useQuery({
    queryKey: ["quality", "jobs", jobId],
    queryFn: () => getSiteAudit(jobId!),
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
    queryKey: ["quality", "jobs", jobId, "items"],
    queryFn: () => getSiteAuditItems(jobId!),
    enabled: !!jobId && isDone,
  });

  const hasInput = inputMode === "domain" ? domain.trim().length > 0 : urlsText.trim().length > 0;
  const hasTarget = doorway !== "compliance" || !!policyId;
  const canSubmit = hasInput && hasTarget && !startMutation.isPending;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Titer Quality</h1>
        <p className="text-secondary-foreground">
          Audit every page on a site (or a specific list of URLs) against Google&apos;s quality bar, your brand
          voice, or your compliance policy — worst-first results, exportable.
        </p>
      </div>

      {!jobId ? (
        <Card>
          <CardHeader>
            <CardTitle>Start an audit</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>What to measure</Label>
              <div className="flex flex-wrap gap-2">
                <DoorwayButton active={doorway === "seo"} onClick={() => setDoorway("seo")}>
                  SEO Quality
                </DoorwayButton>
                <DoorwayButton active={doorway === "content"} onClick={() => setDoorway("content")}>
                  Content Quality
                </DoorwayButton>
                <DoorwayButton active={doorway === "compliance"} onClick={() => setDoorway("compliance")}>
                  Compliance Quality
                </DoorwayButton>
              </div>
              <p className="text-xs text-muted-foreground">
                {doorway === "seo"
                  ? "Scores every page on the flagship dimension — no setup needed."
                  : doorway === "content"
                    ? "Pick a dimension (e.g. brand voice, tone) to score every page against."
                    : "Pick one of your compliance policies to run against every page."}
              </p>
            </div>

            {doorway === "content" ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dimension">Dimension</Label>
                {dimensionsQuery.isPending ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : (
                  <select
                    id="dimension"
                    value={dimensionKey}
                    onChange={(e) => setDimensionKey(e.target.value)}
                    className="h-8 w-full max-w-sm rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                  >
                    <option value="">Flagship (default)</option>
                    {dimensionsQuery.data?.map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : null}

            {doorway === "compliance" ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="policy">Policy</Label>
                {policiesQuery.isPending ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : policiesQuery.data?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No policies yet —{" "}
                    <Link href="/compliance" className="underline">
                      create one first
                    </Link>
                    .
                  </p>
                ) : (
                  <select
                    id="policy"
                    value={policyId}
                    onChange={(e) => setPolicyId(e.target.value)}
                    className="h-8 w-full max-w-sm rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                  >
                    <option value="">Select a policy…</option>
                    {policiesQuery.data?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <Label>Pages</Label>
              <div className="flex gap-2">
                <DoorwayButton active={inputMode === "domain"} onClick={() => setInputMode("domain")}>
                  Whole site (sitemap)
                </DoorwayButton>
                <DoorwayButton active={inputMode === "urls"} onClick={() => setInputMode("urls")}>
                  Paste URLs
                </DoorwayButton>
              </div>
            </div>

            {inputMode === "domain" ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="domain">Domain</Label>
                <Input id="domain" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="https://example.com" />
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="urls">URLs (one per line)</Label>
                <textarea
                  id="urls"
                  rows={6}
                  value={urlsText}
                  onChange={(e) => setUrlsText(e.target.value)}
                  placeholder={"https://example.com/page-1\nhttps://example.com/page-2"}
                  className="w-full rounded-lg border border-input bg-transparent p-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                />
              </div>
            )}

            <div>
              <Button onClick={() => startMutation.mutate()} disabled={!canSubmit}>
                {startMutation.isPending ? "Starting…" : "Run audit"}
              </Button>
            </div>

            {startMutation.isError ? (
              <p className="text-sm text-destructive">{apiErrorMessage(startMutation.error, "Couldn't start the audit.")}</p>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="self-start"
            onClick={() => {
              startMutation.reset();
              setSelectedJobId(null);
            }}
          >
            ← New audit
          </Button>
          <AuditProgress
            job={jobQuery.data}
            items={itemsQuery.data}
            isLoadingItems={itemsQuery.isPending && isDone}
          />
        </div>
      )}

      {!jobId && recentAuditsQuery.data && recentAuditsQuery.data.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Recent audits</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {recentAuditsQuery.data.map((job) => (
              <button
                key={job.id}
                type="button"
                onClick={() => setSelectedJobId(job.id)}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5 text-left text-sm hover:bg-muted/30"
              >
                <span className="truncate">
                  {job.domain} · {job.mode === "COMPLIANCE_POLICY" ? "Compliance" : "Score"}
                </span>
                <span className="flex items-center gap-3 text-muted-foreground">
                  {job.aggregateScore !== null ? `Score ${job.aggregateScore}` : null}
                  <Badge variant={job.status === "FAILED" ? "destructive" : job.status === "COMPLETED" ? "default" : "secondary"}>
                    {job.status}
                  </Badge>
                </span>
              </button>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function DoorwayButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Button size="sm" variant={active ? "default" : "outline"} onClick={onClick}>
      {children}
    </Button>
  );
}

function AuditProgress({
  job,
  items,
  isLoadingItems,
}: {
  job: SiteAuditJob | undefined;
  items: SiteAuditItem[] | undefined;
  isLoadingItems: boolean;
}) {
  if (!job) {
    return <p className="text-sm text-muted-foreground">Starting…</p>;
  }

  const processed = job.completedUrls + job.failedUrls;
  const pct = job.totalUrls === 0 ? 0 : Math.round((processed / job.totalUrls) * 100);
  const isCompliance = job.mode === "COMPLIANCE_POLICY";

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {job.status === "COMPLETED" ? "Audit complete" : job.status === "FAILED" ? "Audit failed" : "Running…"}
            </CardTitle>
            <Badge variant={job.status === "FAILED" ? "destructive" : job.status === "COMPLETED" ? "default" : "secondary"}>
              {job.status}
            </Badge>
          </div>
          <CardDescription>
            {processed}/{job.totalUrls} pages processed — {job.completedUrls} scored, {job.failedUrls} failed.
            {job.aggregateScore !== null ? ` Aggregate score: ${job.aggregateScore}.` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          {job.status === "COMPLETED" ? (
            <div>
              <Button size="sm" variant="outline" onClick={() => downloadSiteAuditExport(job.id)}>
                Export CSV
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {job.status === "COMPLETED" && job.botAccessFindings.length > 0 ? (
        <Card className="border-amber-500/40">
          <CardHeader>
            <CardTitle className="text-base">AI crawler access</CardTitle>
            <CardDescription>Whether known AI bots can actually reach this domain at all.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {job.botAccessFindings.map((finding, i) => (
              <div key={i} className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
                <p>{finding.explanation}</p>
                {finding.suggestion ? <p className="mt-1 text-xs text-muted-foreground">{finding.suggestion}</p> : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {job.status === "COMPLETED" || job.status === "FAILED" ? (
        isLoadingItems ? (
          <p className="text-sm text-muted-foreground">Loading results…</p>
        ) : items && items.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2 font-medium">URL</th>
                  <th className="px-4 py-2 font-medium">{isCompliance ? "Outcome" : "Score"}</th>
                  {isCompliance ? <th className="px-4 py-2 font-medium">Violations</th> : null}
                  <th className="px-4 py-2 font-medium">Error</th>
                  {!isCompliance ? <th className="px-4 py-2 font-medium">Note</th> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20">
                    <td className="max-w-xs truncate px-4 py-2">
                      <a href={item.url} target="_blank" rel="noreferrer" className="hover:underline">
                        {item.url}
                      </a>
                    </td>
                    <td className="px-4 py-2">
                      {isCompliance ? (
                        item.outcome ? (
                          <Badge variant={OUTCOME_BADGE[item.outcome.toLowerCase()] ?? "outline"}>
                            {OUTCOME_LABEL[item.outcome.toLowerCase() as keyof typeof OUTCOME_LABEL] ?? item.outcome}
                          </Badge>
                        ) : (
                          "—"
                        )
                      ) : (
                        (item.titer ?? "—")
                      )}
                    </td>
                    {isCompliance ? <td className="px-4 py-2 text-muted-foreground">{item.violationCount ?? "—"}</td> : null}
                    <td className="px-4 py-2 text-destructive">{item.error ?? "—"}</td>
                    {!isCompliance ? (
                      <td className="max-w-sm px-4 py-2 text-amber-600 dark:text-amber-400">{item.renderNote ?? "—"}</td>
                    ) : null}
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
