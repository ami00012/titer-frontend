"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { listPolicies, listPacks, createPolicyFromPack, type Policy, type PolicyPack } from "@/lib/api/compliance";
import { track } from "@/lib/analytics";

export default function CompliancePage() {
  const queryClient = useQueryClient();
  const policiesQuery = useQuery({ queryKey: ["compliance", "policies"], queryFn: listPolicies });
  const packsQuery = useQuery({ queryKey: ["compliance", "packs"], queryFn: listPacks });

  const fromPackMutation = useMutation<Policy, ApiError, { regime: string }>({
    mutationFn: (vars) => createPolicyFromPack(vars.regime),
    onSuccess: (policy) => {
      track("compliance_policy_created", { regime: policy.regime });
      queryClient.invalidateQueries({ queryKey: ["compliance", "policies"] });
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Compliance</h1>
        <p className="text-secondary-foreground">
          Check content against a policy, flag violations, and keep an auditor-ready record of every
          decision. Titer flags for human review — a qualified person makes the compliance call.
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link href="/compliance/checks/batch" className="text-secondary-foreground hover:text-foreground hover:underline">
            Batch check →
          </Link>
          <Link href="/compliance/pack-requests" className="text-secondary-foreground hover:text-foreground hover:underline">
            Request a pack →
          </Link>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your policies</h2>
          {policiesQuery.data && policiesQuery.data.length > 0 ? (
            <Link href="/compliance/checks" className="text-sm text-secondary-foreground hover:text-foreground">
              View check history →
            </Link>
          ) : null}
        </div>

        {policiesQuery.isPending ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : policiesQuery.isError ? (
          <p className="text-sm text-destructive">{apiErrorMessage(policiesQuery.error, "Couldn't load policies.")}</p>
        ) : policiesQuery.data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No policies yet — start from one of the packs below, or the API supports fully custom rule sets.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {policiesQuery.data.map((policy) => (
              <PolicyCard key={policy.id} policy={policy} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-8">
        <div>
          <h2 className="text-lg font-semibold">Start from a pack</h2>
          <p className="text-sm text-secondary-foreground">
            Built-in policy packs, each rule grounded in a specific regulation.
          </p>
        </div>

        {/* Pinned right under the heading, not after the (potentially long,
            multi-row) pack grid -- a failed "Use this pack" click otherwise
            produces an error the user can't see without scrolling past
            every pack card below it. */}
        {fromPackMutation.isError ? (
          <p className="text-sm text-destructive">{apiErrorMessage(fromPackMutation.error, "Couldn't create the policy.")}</p>
        ) : null}

        {packsQuery.isPending ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : packsQuery.isError ? (
          <p className="text-sm text-destructive">{apiErrorMessage(packsQuery.error, "Couldn't load policy packs.")}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {packsQuery.data.map((pack) => (
              <PackCard
                key={pack.regime}
                pack={pack}
                onUse={() => fromPackMutation.mutate({ regime: pack.regime })}
                isPending={fromPackMutation.isPending && fromPackMutation.variables?.regime === pack.regime}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function PolicyCard({ policy }: { policy: Policy }) {
  const ruleCount = policy.liveVersion?.rules.length ?? 0;
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{policy.name}</CardTitle>
          {policy.regime ? <Badge variant="outline">{policy.regime}</Badge> : null}
        </div>
        <CardDescription>
          {ruleCount} rule{ruleCount === 1 ? "" : "s"} · v{policy.liveVersion?.version ?? "—"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Button size="sm" nativeButton={false} render={<Link href={`/compliance/check?policyId=${policy.id}`} />}>
          Run a check
        </Button>
        <Button size="sm" variant="outline" nativeButton={false} render={<Link href={`/compliance/policies/${policy.id}`} />}>
          View policy
        </Button>
      </CardContent>
    </Card>
  );
}

function PackCard({ pack, onUse, isPending }: { pack: PolicyPack; onUse: () => void; isPending: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{pack.name}</CardTitle>
        <CardDescription>{pack.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
          {pack.rules.map((rule) => (
            <li key={rule.ruleKey} className="flex items-start gap-1.5">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
              <span>
                <span className="font-medium text-secondary-foreground">{rule.ruleKey.replace(/_/g, " ")}</span>
                {rule.citation ? ` — ${rule.citation}` : ""}
              </span>
            </li>
          ))}
        </ul>
        <Button size="sm" variant="outline" onClick={onUse} disabled={isPending}>
          {isPending ? "Creating…" : "Use this pack"}
        </Button>
      </CardContent>
    </Card>
  );
}
