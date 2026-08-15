"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { TiterDial } from "@/components/titer/titer-dial";
import { apiErrorMessage } from "@/lib/api/client";
import { reportIssue, reviewCheck, OUTCOME_LABEL, type ComplianceCheck, type RuleResult, type ReviewDecision } from "@/lib/api/compliance";
import { track } from "@/lib/analytics";

const OUTCOME_TONE: Record<string, string> = {
  pass: "border-[color:var(--status-good)] bg-[color:var(--status-good)]/5",
  flagged: "border-[color:var(--status-warning)] bg-[color:var(--status-warning)]/5",
  blocked: "border-[color:var(--status-critical)] bg-[color:var(--status-critical)]/5",
  overridden: "border-border bg-muted/30",
  approved: "border-[color:var(--status-good)] bg-[color:var(--status-good)]/5",
};

export function CheckResult({ check: initialCheck }: { check: ComplianceCheck }) {
  const [check, setCheck] = useState(initialCheck);
  const decided = check.outcome === "approved" || check.outcome === "overridden";
  const needsReview = check.outcome === "blocked" || check.outcome === "flagged";

  return (
    <div className="flex flex-col gap-4">
      <div className={`rounded-lg border p-4 ${OUTCOME_TONE[check.outcome] ?? "border-border"}`}>
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">{OUTCOME_LABEL[check.outcome]}</span>
          <Badge variant="outline">
            {check.violations.length} of {check.ruleResults.length} rule{check.ruleResults.length === 1 ? "" : "s"} flagged
          </Badge>
        </div>
        <p className="mt-1 text-sm text-secondary-foreground">{check.disclaimer}</p>
      </div>

      <ReportIssue checkId={check.id} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {check.ruleResults.map((rule) => (
          <RuleCard key={rule.ruleKey} rule={rule} check={check} />
        ))}
      </div>

      {needsReview ? (
        <ReviewPanel check={check} onDecided={setCheck} />
      ) : decided ? (
        <DecisionTrail check={check} />
      ) : null}
    </div>
  );
}

function RuleCard({ rule, check }: { rule: RuleResult; check: ComplianceCheck }) {
  const violation = check.violations.find((v) => v.ruleKey === rule.ruleKey);
  const direction = rule.kind === "require" ? "higher-is-better" : "lower-is-better";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm capitalize">{rule.ruleKey.replace(/_/g, " ")}</CardTitle>
          <Badge variant={rule.violated ? (rule.kind === "flag" ? "secondary" : "destructive") : "outline"}>
            {rule.violated ? (rule.kind === "flag" ? "Review" : "Violation") : "Pass"}
          </Badge>
        </div>
        {rule.citation ? <CardDescription className="text-xs">{rule.citation}</CardDescription> : null}
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3">
        <TiterDial score={rule.titer} direction={direction} size={90} />
        {violation && violation.findings.length > 0 ? (
          <ul className="flex w-full flex-col gap-2 text-xs">
            {violation.findings.map((finding, index) => (
              <li key={index} className="rounded-md border border-border bg-muted/30 p-2 text-secondary-foreground">
                {finding.explanation}
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ReportIssue({ checkId }: { checkId: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const mutation = useMutation({
    mutationFn: () => reportIssue(checkId, message),
    onSuccess: () => {
      track("compliance_issue_reported", { checkId });
      setMessage("");
      setOpen(false);
    },
  });

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      >
        See something wrong with a rule or citation? Report it
      </button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Report an issue</CardTitle>
        <CardDescription>Sent to support@titer.dev along with this check&apos;s context.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          placeholder="What looks wrong? A specific rule, citation, or score is most useful."
          className="w-full resize-none rounded-md border border-input bg-input/30 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={() => mutation.mutate()} disabled={mutation.isPending || message.trim().length === 0}>
            {mutation.isPending ? "Sending…" : "Send report"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
        {mutation.isError ? (
          <p className="text-sm text-destructive">{apiErrorMessage(mutation.error, "Couldn't send the report.")}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ReviewPanel({ check, onDecided }: { check: ComplianceCheck; onDecided: (check: ComplianceCheck) => void }) {
  const [decision, setDecision] = useState<ReviewDecision>("approve");
  const [reason, setReason] = useState("");

  const mutation = useMutation({
    mutationFn: () => reviewCheck(check.id, decision, reason),
    onSuccess: (review) => {
      track("compliance_review_submitted", { decision: review.decision });
      onDecided({
        ...check,
        outcome: decision === "approve" ? "approved" : decision === "override" ? "overridden" : check.outcome,
        reviews: [...check.reviews, review],
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review</CardTitle>
        <CardDescription>A reason is required — it&apos;s the audit trail&apos;s most important field.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex gap-2">
          {(["approve", "override", "reject"] as ReviewDecision[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDecision(d)}
              className={`flex-1 rounded-md border px-3 py-2 text-sm capitalize transition-colors ${
                decision === d ? "border-foreground bg-foreground/5 font-medium" : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="review-reason">Reason</Label>
          <textarea
            id="review-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            placeholder="Why does this decision hold up? Be specific — this is what an auditor reads."
            className="w-full resize-none rounded-md border border-input bg-input/30 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          />
        </div>
        <div>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || reason.trim().length === 0}>
            {mutation.isPending ? "Submitting…" : `Submit ${decision}`}
          </Button>
        </div>
        {mutation.isError ? (
          <p className="text-sm text-destructive">{apiErrorMessage(mutation.error, "Couldn't submit the review.")}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function DecisionTrail({ check }: { check: ComplianceCheck }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Decision trail</CardTitle>
        <CardDescription>This check is decided and immutable — a new check is created to re-check the same content.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {check.reviews.map((review) => (
          <div key={review.id} className="rounded-md border border-border bg-muted/30 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium capitalize">{review.decision}</span>
              <span className="text-xs text-muted-foreground">{new Date(review.reviewedAt).toLocaleString()}</span>
            </div>
            <p className="mt-1 text-secondary-foreground">{review.reason}</p>
            <p className="mt-1 text-xs text-muted-foreground">Reviewer: {review.reviewerUserId}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
