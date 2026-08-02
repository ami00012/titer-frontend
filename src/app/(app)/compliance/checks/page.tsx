"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { apiErrorMessage } from "@/lib/api/client";
import { listChecks, createExport, downloadExport, OUTCOME_LABEL, type AuditExport, type ExportFormat } from "@/lib/api/compliance";
import { track } from "@/lib/analytics";

const OUTCOME_BADGE: Record<string, "outline" | "secondary" | "destructive" | "default"> = {
  pass: "outline",
  flagged: "secondary",
  blocked: "destructive",
  overridden: "default",
  approved: "default",
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function firstOfMonthIso() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

export default function ComplianceChecksPage() {
  const checksQuery = useQuery({ queryKey: ["compliance", "checks"], queryFn: listChecks });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Check history</h1>
        <p className="text-secondary-foreground">Every check run against a policy, with its outcome and audit trail.</p>
      </div>

      <ExportPanel />

      <section className="flex flex-col gap-3">
        {checksQuery.isPending ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : checksQuery.isError ? (
          <p className="text-sm text-destructive">{apiErrorMessage(checksQuery.error, "Couldn't load check history.")}</p>
        ) : checksQuery.data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No checks yet —{" "}
            <Link href="/compliance/check" className="underline">
              run your first check
            </Link>
            .
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Content</th>
                  <th className="px-4 py-2 font-medium">Outcome</th>
                  <th className="px-4 py-2 font-medium">Violations</th>
                  <th className="px-4 py-2 font-medium">Checked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {checksQuery.data.map((check) => (
                  <tr key={check.id} className="hover:bg-muted/20">
                    <td className="px-4 py-2">
                      <Link href={`/compliance/checks/${check.id}`} className="hover:underline">
                        {check.contentRef || check.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant={OUTCOME_BADGE[check.outcome] ?? "outline"}>{OUTCOME_LABEL[check.outcome]}</Badge>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{check.violationCount}</td>
                    <td className="px-4 py-2 text-muted-foreground">{new Date(check.createdAt).toLocaleString()}</td>
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

function ExportPanel() {
  const [rangeStart, setRangeStart] = useState(firstOfMonthIso());
  const [rangeEnd, setRangeEnd] = useState(todayIso());
  const [format, setFormat] = useState<ExportFormat>("pdf");

  const mutation = useMutation({
    mutationFn: () => createExport(rangeStart, rangeEnd, format),
    onMutate: () => track("compliance_export_requested", { format }),
  });

  async function handleDownload(exp: AuditExport) {
    await downloadExport(exp);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export audit</CardTitle>
        <CardDescription>A PDF or CSV of every check, rule result, and review decision in the range.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="range-start">From</Label>
            <input
              id="range-start"
              type="date"
              value={rangeStart}
              onChange={(event) => setRangeStart(event.target.value)}
              className="rounded-md border border-input bg-input/30 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="range-end">To</Label>
            <input
              id="range-end"
              type="date"
              value={rangeEnd}
              onChange={(event) => setRangeEnd(event.target.value)}
              className="rounded-md border border-input bg-input/30 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="export-format">Format</Label>
            <select
              id="export-format"
              value={format}
              onChange={(event) => setFormat(event.target.value as ExportFormat)}
              className="rounded-md border border-input bg-input/30 px-3 py-2 text-sm"
            >
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
            </select>
          </div>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Generating…" : "Generate export"}
          </Button>
        </div>

        {mutation.isError ? (
          <p className="text-sm text-destructive">{apiErrorMessage(mutation.error, "Couldn't generate the export.")}</p>
        ) : mutation.data?.status === "ready" ? (
          <Button variant="outline" size="sm" onClick={() => handleDownload(mutation.data!)}>
            Download {mutation.data.format.toUpperCase()}
          </Button>
        ) : mutation.data?.status === "failed" ? (
          <p className="text-sm text-destructive">Export failed to render. Try a narrower date range.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
