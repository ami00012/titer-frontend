"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { upsertTiterScore, upsertModelRisk, recordProofRun } from "@/app/actions/scoring";
import { openBidWindow } from "@/app/actions/bids";
import { TITER_SCORE_COMPONENTS, type TiterScoreComponents } from "@/lib/titer-score";
import type { Asset, BidWindow, MoatType, TiterScore } from "@prisma/client";

const MOAT_TYPES: MoatType[] = ["PROMPT", "PROPRIETARY_DATA", "WORKFLOW", "DISTRIBUTION", "INTEGRATION"];

export function TiterScoreForm({ assetId, existing }: { assetId: string; existing: TiterScore | null }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    const components = TITER_SCORE_COMPONENTS.reduce((acc, c) => {
      acc[c.key] = Number(formData.get(c.key) ?? 0);
      return acc;
    }, {} as TiterScoreComponents);
    const justification = String(formData.get("justification") ?? "");

    startTransition(async () => {
      try {
        await upsertTiterScore(assetId, components, justification);
        toast.success("Titer Score saved");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save score");
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-5">
        {TITER_SCORE_COMPONENTS.map((c) => (
          <div key={c.key} className="flex flex-col gap-1">
            <Label htmlFor={c.key} className="text-xs">
              {c.label} (0–{c.max})
            </Label>
            <Input
              id={c.key}
              name={c.key}
              type="number"
              min={0}
              max={c.max}
              defaultValue={existing?.[c.key] ?? ""}
              required
            />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="justification" className="text-xs">
          Justification (what was verified, not claimed)
        </Label>
        <Textarea id="justification" name="justification" rows={3} defaultValue={existing?.justification ?? ""} required />
      </div>
      <Button type="submit" size="sm" disabled={pending} className="self-start">
        {existing ? "Update score" : "Save score"}
      </Button>
    </form>
  );
}

export function ModelRiskForm({ assetId, asset }: { assetId: string; asset: Asset }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await upsertModelRisk(assetId, {
          primaryModelProvider: String(formData.get("primaryModelProvider") ?? ""),
          fallbackProvider: String(formData.get("fallbackProvider") ?? ""),
          inferenceCostPctOfRevenue: formData.get("inferenceCostPctOfRevenue")
            ? Number(formData.get("inferenceCostPctOfRevenue"))
            : undefined,
          grossMarginAt2xTokenPrice: formData.get("grossMarginAt2xTokenPrice")
            ? Number(formData.get("grossMarginAt2xTokenPrice"))
            : undefined,
          moatType: (formData.get("moatType") as MoatType) || undefined,
          providerFeatureOverlapNotes: String(formData.get("providerFeatureOverlapNotes") ?? ""),
          modelRiskVerdict: String(formData.get("modelRiskVerdict") ?? ""),
          transferChecklist: String(formData.get("transferChecklist") ?? ""),
        });
        toast.success("Model risk block saved");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save");
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor="primaryModelProvider" className="text-xs">Primary model provider</Label>
          <Input id="primaryModelProvider" name="primaryModelProvider" defaultValue={asset.primaryModelProvider ?? ""} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="fallbackProvider" className="text-xs">Fallback provider</Label>
          <Input id="fallbackProvider" name="fallbackProvider" defaultValue={asset.fallbackProvider ?? ""} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="inferenceCostPctOfRevenue" className="text-xs">Inference cost (% of revenue)</Label>
          <Input
            id="inferenceCostPctOfRevenue"
            name="inferenceCostPctOfRevenue"
            type="number"
            step="0.1"
            defaultValue={asset.inferenceCostPctOfRevenue?.toString() ?? ""}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="grossMarginAt2xTokenPrice" className="text-xs">Gross margin at 2x token price (%)</Label>
          <Input
            id="grossMarginAt2xTokenPrice"
            name="grossMarginAt2xTokenPrice"
            type="number"
            step="0.1"
            defaultValue={asset.grossMarginAt2xTokenPrice?.toString() ?? ""}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="moatType" className="text-xs">Moat type</Label>
          <select
            id="moatType"
            name="moatType"
            defaultValue={asset.moatType ?? ""}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="">Not set</option>
            {MOAT_TYPES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="providerFeatureOverlapNotes" className="text-xs">Provider feature overlap notes</Label>
        <Textarea id="providerFeatureOverlapNotes" name="providerFeatureOverlapNotes" rows={2} defaultValue={asset.providerFeatureOverlapNotes ?? ""} />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="modelRiskVerdict" className="text-xs">One-line plain-English verdict</Label>
        <Input id="modelRiskVerdict" name="modelRiskVerdict" defaultValue={asset.modelRiskVerdict ?? ""} />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="transferChecklist" className="text-xs">Transfer checklist (what literally moves, account by account)</Label>
        <Textarea id="transferChecklist" name="transferChecklist" rows={3} defaultValue={asset.transferChecklist ?? ""} />
      </div>
      <Button type="submit" size="sm" disabled={pending} className="self-start">
        Save model risk block
      </Button>
    </form>
  );
}

export function ProofRunForm({ assetId }: { assetId: string }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await recordProofRun(assetId, {
          harnessVersion: String(formData.get("harnessVersion") ?? ""),
          requestCount: Number(formData.get("requestCount") ?? 0),
          successRate: Number(formData.get("successRate") ?? 0),
          p50Ms: Number(formData.get("p50Ms") ?? 0),
          p95Ms: Number(formData.get("p95Ms") ?? 0),
          costPerTaskUsd: Number(formData.get("costPerTaskUsd") ?? 0),
          errors: String(formData.get("errors") ?? ""),
          ranAt: String(formData.get("ranAt") ?? ""),
          artifactUrl: String(formData.get("artifactUrl") ?? ""),
        });
        toast.success("Proof run recorded");
        (document.getElementById("proof-run-form") as HTMLFormElement | null)?.reset();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to record run");
      }
    });
  }

  return (
    <form id="proof-run-form" action={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Harness version" name="harnessVersion" required />
        <Field label="Ran at" name="ranAt" type="date" required />
        <Field label="Request count" name="requestCount" type="number" required />
        <Field label="Success rate (%)" name="successRate" type="number" step="0.1" required />
        <Field label="p50 (ms)" name="p50Ms" type="number" required />
        <Field label="p95 (ms)" name="p95Ms" type="number" required />
        <Field label="Cost per task (USD)" name="costPerTaskUsd" type="number" step="0.0001" required />
        <Field label="Artifact URL (private)" name="artifactUrl" />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="errors" className="text-xs">Error taxonomy (JSON array)</Label>
        <Textarea id="errors" name="errors" rows={2} placeholder='[{"type":"timeout","count":2}]' />
      </div>
      <Button type="submit" size="sm" disabled={pending} className="self-start">
        Record run
      </Button>
    </form>
  );
}

export function OpenBidForm({ assetId, bidWindow }: { assetId: string; bidWindow: BidWindow | null }) {
  const [pending, startTransition] = useTransition();

  if (bidWindow) {
    return (
      <p className="text-sm text-secondary-foreground">
        Bid window {bidWindow.status.toLowerCase()} · closes {bidWindow.closesAt.toDateString()} · reserve $
        {Number(bidWindow.reservePrice).toLocaleString()} (private)
      </p>
    );
  }

  function handleSubmit(formData: FormData) {
    const reservePrice = Number(formData.get("reservePrice") ?? 0);
    startTransition(async () => {
      try {
        await openBidWindow(assetId, reservePrice);
        toast.success("Open Bid window started (7 days)");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to open bid window");
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex items-end gap-2">
      <div className="flex flex-col gap-1">
        <Label htmlFor="reservePrice" className="text-xs">Reserve price (private, under $25,000 listing)</Label>
        <Input id="reservePrice" name="reservePrice" type="number" required />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        Open 7-day bid window
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  step,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  step?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={name} className="text-xs">{label}</Label>
      <Input id={name} name={name} type={type} step={step} required={required} />
    </div>
  );
}
