"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckResult } from "@/components/compliance/check-result";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { listPolicies, runCheck, type ComplianceCheck } from "@/lib/api/compliance";
import { track } from "@/lib/analytics";

const MIN_LENGTH = 5;

export default function CompliancePolicyCheckPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <CheckPageContent />
    </Suspense>
  );
}

function CheckPageContent() {
  const searchParams = useSearchParams();
  const initialPolicyId = searchParams.get("policyId") ?? "";

  const [policyId, setPolicyId] = useState(initialPolicyId);
  const [contentRef, setContentRef] = useState("");
  const [text, setText] = useState("");

  const policiesQuery = useQuery({ queryKey: ["compliance", "policies"], queryFn: listPolicies });

  const checkMutation = useMutation<ComplianceCheck, ApiError, { text: string; policyId: string; contentRef?: string }>({
    mutationFn: (vars) => runCheck(vars.text, vars.policyId, vars.contentRef || undefined),
    onMutate: () => track("compliance_check_started", { policyId }),
    onSuccess: (data) => track("compliance_check_completed", { outcome: data.outcome, violations: data.violations.length }),
  });

  const canSubmit = !checkMutation.isPending && policyId.length > 0 && text.trim().length >= MIN_LENGTH;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Check content</h1>
        <p className="text-secondary-foreground">
          Paste content, pick a policy, and Titer checks it against every rule at once.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content to check</CardTitle>
          <CardDescription>Checked against the policy&apos;s live version.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="policy-select">Policy</Label>
            {policiesQuery.isPending ? (
              <p className="text-sm text-muted-foreground">Loading policies…</p>
            ) : policiesQuery.isError ? (
              <p className="text-sm text-destructive">{apiErrorMessage(policiesQuery.error, "Couldn't load policies.")}</p>
            ) : policiesQuery.data.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No policies yet — create one from a pack on the{" "}
                <a href="/compliance" className="underline">
                  Compliance
                </a>{" "}
                page first.
              </p>
            ) : (
              <select
                id="policy-select"
                value={policyId}
                onChange={(event) => setPolicyId(event.target.value)}
                className="w-full rounded-md border border-input bg-input/30 px-3 py-2 text-sm"
              >
                <option value="" disabled>
                  Select a policy…
                </option>
                {policiesQuery.data.map((policy) => (
                  <option key={policy.id} value={policy.id}>
                    {policy.name} ({policy.liveVersion?.rules.length ?? 0} rules)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="content-ref">Content reference (optional)</Label>
            <Input
              id="content-ref"
              value={contentRef}
              onChange={(event) => setContentRef(event.target.value)}
              placeholder="e.g. landing-page-hero-v3"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="check-text">Content</Label>
            <textarea
              id="check-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Paste the marketing copy, endorsement, or promotion to check…"
              rows={8}
              className="w-full resize-none rounded-md border border-input bg-input/30 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
            />
          </div>

          <div>
            <Button onClick={() => checkMutation.mutate({ text, policyId, contentRef })} disabled={!canSubmit}>
              {checkMutation.isPending ? "Checking…" : "Run check"}
            </Button>
          </div>

          {checkMutation.isError ? (
            <p className="text-sm text-destructive">{apiErrorMessage(checkMutation.error, "Couldn't run the check.")}</p>
          ) : null}
        </CardContent>
      </Card>

      {checkMutation.data ? <CheckResult check={checkMutation.data} /> : null}
    </div>
  );
}
