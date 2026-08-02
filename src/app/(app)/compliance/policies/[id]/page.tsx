"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import {
  activatePolicyVersion,
  createPolicyVersion,
  getPackDiff,
  getPolicy,
  listDimensions,
  resetToPackDefaults,
  updatePolicyFromPack,
  type Dimension,
  type PackDiff,
  type PolicyRule,
  type PolicyVersion,
} from "@/lib/api/compliance";
import { track } from "@/lib/analytics";

const KINDS = ["prohibit", "require", "flag"] as const;
const SEVERITIES = ["block", "warn", "info"] as const;

function blankRule(dimensionKey: string): PolicyRule {
  return {
    ruleKey: "",
    dimensionKey,
    kind: "prohibit",
    threshold: 70,
    severity: "block",
    citation: "",
    rationale: "",
  };
}

export default function CompliancePolicyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const policyQuery = useQuery({ queryKey: ["compliance", "policies", id], queryFn: () => getPolicy(id) });
  const dimensionsQuery = useQuery({ queryKey: ["dimensions"], queryFn: listDimensions });

  const [rules, setRules] = useState<PolicyRule[] | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (policyQuery.data?.liveVersion && !editing) {
      setRules(policyQuery.data.liveVersion.rules);
    }
  }, [policyQuery.data, editing]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["compliance", "policies", id] });
    queryClient.invalidateQueries({ queryKey: ["compliance", "policies", id, "pack-diff"] });
  };

  const saveMutation = useMutation<PolicyVersion, ApiError, PolicyRule[]>({
    mutationFn: async (nextRules) => {
      const version = await createPolicyVersion(id, nextRules);
      // Auto-activate: this editor has no separate draft-review step (a real
      // possible follow-up), so "save" means "take effect now," matching
      // reset-to-pack-defaults/update-from-pack's own immediate-effect shape.
      return activatePolicyVersion(id, version.version);
    },
    onSuccess: () => {
      track("compliance_policy_version_saved", { policyId: id });
      setEditing(false);
      invalidate();
    },
  });

  const resetMutation = useMutation<PolicyVersion, ApiError, void>({
    mutationFn: () => resetToPackDefaults(id),
    onSuccess: () => {
      track("compliance_policy_reset_to_pack", { policyId: id });
      invalidate();
    },
  });

  const updateFromPackMutation = useMutation<PolicyVersion, ApiError, void>({
    mutationFn: () => updatePolicyFromPack(id),
    onSuccess: () => {
      track("compliance_policy_updated_from_pack", { policyId: id });
      invalidate();
    },
  });

  if (policyQuery.isPending) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }
  if (policyQuery.isError) {
    return <p className="text-sm text-destructive">{apiErrorMessage(policyQuery.error, "Couldn't load this policy.")}</p>;
  }

  const policy = policyQuery.data;
  const dimensions = dimensionsQuery.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/compliance" className="text-sm text-secondary-foreground hover:text-foreground">
          ← Compliance
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">{policy.name}</h1>
          {policy.regime ? <Badge variant="outline">{policy.regime}</Badge> : null}
          <Badge variant={policy.status === "active" ? "default" : "secondary"}>{policy.status}</Badge>
          {policy.updateAvailable ? <Badge variant="secondary">Pack update available</Badge> : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button nativeButton={false} render={<Link href={`/compliance/check?policyId=${policy.id}`} />}>
          Run a check
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={`/compliance/checks/batch?policyId=${policy.id}`} />}
        >
          Batch check
        </Button>
        {policy.packKey ? (
          <>
            {policy.updateAvailable ? (
              <Button
                variant="outline"
                onClick={() => updateFromPackMutation.mutate()}
                disabled={updateFromPackMutation.isPending}
              >
                {updateFromPackMutation.isPending ? "Updating…" : "Update from pack"}
              </Button>
            ) : null}
            <Button variant="outline" onClick={() => resetMutation.mutate()} disabled={resetMutation.isPending}>
              {resetMutation.isPending ? "Resetting…" : "Reset to pack defaults"}
            </Button>
          </>
        ) : null}
      </div>

      {resetMutation.isError ? (
        <p className="text-sm text-destructive">{apiErrorMessage(resetMutation.error, "Couldn't reset to pack defaults.")}</p>
      ) : null}
      {updateFromPackMutation.isError ? (
        <p className="text-sm text-destructive">{apiErrorMessage(updateFromPackMutation.error, "Couldn't update from pack.")}</p>
      ) : null}

      {policy.packKey && policy.updateAvailable ? <PackDiffPanel policyId={policy.id} /> : null}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Rules — v{policy.liveVersion?.version ?? "—"}</CardTitle>
              <CardDescription>
                Saving creates a new version and activates it immediately — every past check stays checkable
                against the exact version it ran against.
              </CardDescription>
            </div>
            {!editing ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setRules(policy.liveVersion?.rules ?? []);
                  setEditing(true);
                }}
              >
                Edit rules
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {editing && rules ? (
            <RuleEditor
              rules={rules}
              dimensions={dimensions}
              onChange={setRules}
              onCancel={() => {
                setEditing(false);
                setRules(policy.liveVersion?.rules ?? []);
              }}
              onSave={() => saveMutation.mutate(rules)}
              isSaving={saveMutation.isPending}
              error={saveMutation.isError ? apiErrorMessage(saveMutation.error, "Couldn't save this version.") : null}
            />
          ) : !policy.liveVersion || policy.liveVersion.rules.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rules in the live version.</p>
          ) : (
            <RuleTable rules={policy.liveVersion.rules} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RuleTable({ rules }: { rules: PolicyRule[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
            <th className="px-4 py-2 font-medium">Rule</th>
            <th className="px-4 py-2 font-medium">Kind</th>
            <th className="px-4 py-2 font-medium">Threshold</th>
            <th className="px-4 py-2 font-medium">Severity</th>
            <th className="px-4 py-2 font-medium">Citation</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rules.map((rule) => (
            <tr key={rule.ruleKey}>
              <td className="px-4 py-2 capitalize">{rule.ruleKey.replace(/_/g, " ")}</td>
              <td className="px-4 py-2 capitalize text-muted-foreground">{rule.kind}</td>
              <td className="px-4 py-2 text-muted-foreground">{rule.threshold}</td>
              <td className="px-4 py-2 capitalize text-muted-foreground">{rule.severity}</td>
              <td className="px-4 py-2 text-muted-foreground">{rule.citation ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RuleEditor({
  rules,
  dimensions,
  onChange,
  onCancel,
  onSave,
  isSaving,
  error,
}: {
  rules: PolicyRule[];
  dimensions: Dimension[];
  onChange: (rules: PolicyRule[]) => void;
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
  error: string | null;
}) {
  const update = (index: number, patch: Partial<PolicyRule>) => {
    onChange(rules.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };
  const remove = (index: number) => {
    onChange(rules.filter((_, i) => i !== index));
  };
  const add = () => {
    onChange([...rules, blankRule(dimensions[0]?.key ?? "")]);
  };

  const canSave = rules.length > 0 && rules.every((r) => r.ruleKey.trim() && r.dimensionKey.trim());

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {rules.map((rule, index) => (
          <div key={index} className="grid grid-cols-2 gap-2 rounded-lg border border-border p-3 sm:grid-cols-6">
            <div className="col-span-2 flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Rule key</Label>
              <Input
                value={rule.ruleKey}
                onChange={(e) => update(index, { ruleKey: e.target.value })}
                placeholder="e.g. deceptive_claim"
              />
            </div>
            <div className="col-span-2 flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Dimension</Label>
              <select
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                value={rule.dimensionKey}
                onChange={(e) => update(index, { dimensionKey: e.target.value })}
              >
                {dimensions.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Kind</Label>
              <select
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm capitalize outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                value={rule.kind}
                onChange={(e) => update(index, { kind: e.target.value as PolicyRule["kind"] })}
              >
                {KINDS.map((k) => (
                  <option key={k} value={k} className="capitalize">
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Threshold</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={rule.threshold}
                onChange={(e) => update(index, { threshold: Number(e.target.value) })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Severity</Label>
              <select
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm capitalize outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                value={rule.severity}
                onChange={(e) => update(index, { severity: e.target.value as PolicyRule["severity"] })}
              >
                {SEVERITIES.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2 flex flex-col gap-1 sm:col-span-4">
              <Label className="text-xs text-muted-foreground">Citation (optional)</Label>
              <Input
                value={rule.citation ?? ""}
                onChange={(e) => update(index, { citation: e.target.value })}
                placeholder="e.g. 16 CFR 255.5"
              />
            </div>
            <div className="col-span-2 flex items-end sm:col-span-2">
              <Button size="sm" variant="destructive" onClick={() => remove(index)} className="w-full">
                Remove rule
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={add}>
          Add rule
        </Button>
        <div className="flex-1" />
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={onSave} disabled={!canSave || isSaving}>
          {isSaving ? "Saving…" : "Save and activate"}
        </Button>
      </div>
      {!canSave ? (
        <p className="text-xs text-muted-foreground">Every rule needs a rule key and a dimension; at least one rule is required.</p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function PackDiffPanel({ policyId }: { policyId: string }) {
  const diffQuery = useQuery({ queryKey: ["compliance", "policies", policyId, "pack-diff"], queryFn: () => getPackDiff(policyId) });

  if (diffQuery.isPending || diffQuery.isError || !diffQuery.data) {
    return null;
  }
  const diff: PackDiff = diffQuery.data;
  if (!diff.updateAvailable) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>What changed in the pack</CardTitle>
        <CardDescription>
          Pack version {diff.policyPackVersion ?? "—"} → {diff.currentPackVersion}. &quot;Update from pack&quot; applies
          these changes as a new version.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        {diff.addedRules.length > 0 ? <DiffList label="Added" variant="default" rules={diff.addedRules} /> : null}
        {diff.removedRules.length > 0 ? <DiffList label="Removed" variant="destructive" rules={diff.removedRules} /> : null}
        {diff.changedRules.length > 0 ? (
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Badge variant="secondary">Changed</Badge>
            </div>
            <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
              {diff.changedRules.map((change) => (
                <li key={change.ruleKey}>
                  <span className="font-medium text-secondary-foreground">{change.ruleKey.replace(/_/g, " ")}</span>
                  {change.before && change.after && change.before.threshold !== change.after.threshold
                    ? ` — threshold ${change.before.threshold} → ${change.after.threshold}`
                    : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function DiffList({ label, variant, rules }: { label: string; variant: "default" | "destructive"; rules: PolicyRule[] }) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <Badge variant={variant}>{label}</Badge>
      </div>
      <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
        {rules.map((rule) => (
          <li key={rule.ruleKey}>
            <span className="font-medium text-secondary-foreground">{rule.ruleKey.replace(/_/g, " ")}</span>
            {rule.citation ? ` — ${rule.citation}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
