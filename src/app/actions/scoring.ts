"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  clampComponents,
  computeTotal,
  CURRENT_RUBRIC_VERSION,
  type TiterScoreComponents,
} from "@/lib/titer-score";
import type { MoatType, Prisma } from "@prisma/client";

async function revalidateAsset(assetId: string) {
  const asset = await prisma.asset.findUnique({ where: { id: assetId }, select: { slug: true } });
  revalidatePath("/admin/assets");
  if (asset) revalidatePath(`/asset/${asset.slug}`);
}

export async function upsertTiterScore(
  assetId: string,
  components: TiterScoreComponents,
  justification: string,
) {
  const admin = await requireAdmin();
  if (!justification.trim()) throw new Error("A justification is required — a bare number isn't credible");

  const clamped = clampComponents(components);
  const total = computeTotal(clamped);

  await prisma.titerScore.upsert({
    where: { assetId },
    update: { ...clamped, total, justification, scoredBy: admin.id, scoredAt: new Date(), rubricVersion: CURRENT_RUBRIC_VERSION },
    create: { assetId, ...clamped, total, justification, scoredBy: admin.id, rubricVersion: CURRENT_RUBRIC_VERSION },
  });

  await revalidateAsset(assetId);
}

export interface ModelRiskInput {
  primaryModelProvider?: string;
  fallbackProvider?: string;
  inferenceCostPctOfRevenue?: number;
  grossMarginAt2xTokenPrice?: number;
  moatType?: MoatType;
  providerFeatureOverlapNotes?: string;
  modelRiskVerdict?: string;
  transferChecklist?: string;
}

export async function upsertModelRisk(assetId: string, input: ModelRiskInput) {
  await requireAdmin();
  await prisma.asset.update({
    where: { id: assetId },
    data: {
      primaryModelProvider: input.primaryModelProvider || null,
      fallbackProvider: input.fallbackProvider || null,
      inferenceCostPctOfRevenue: input.inferenceCostPctOfRevenue ?? null,
      grossMarginAt2xTokenPrice: input.grossMarginAt2xTokenPrice ?? null,
      moatType: input.moatType || null,
      providerFeatureOverlapNotes: input.providerFeatureOverlapNotes || null,
      modelRiskVerdict: input.modelRiskVerdict || null,
      transferChecklist: input.transferChecklist || null,
    },
  });
  await revalidateAsset(assetId);
}

export interface ProofRunInput {
  harnessVersion: string;
  requestCount: number;
  successRate: number;
  p50Ms: number;
  p95Ms: number;
  costPerTaskUsd: number;
  errors: string; // raw JSON textarea input
  ranAt: string; // yyyy-mm-dd from a date input
  artifactUrl?: string;
}

export async function recordProofRun(assetId: string, input: ProofRunInput) {
  await requireAdmin();

  let errors: unknown = [];
  if (input.errors.trim()) {
    try {
      errors = JSON.parse(input.errors);
    } catch {
      throw new Error("Errors must be valid JSON");
    }
  }

  await prisma.proofRun.create({
    data: {
      assetId,
      harnessVersion: input.harnessVersion,
      requestCount: input.requestCount,
      successRate: input.successRate,
      p50Ms: input.p50Ms,
      p95Ms: input.p95Ms,
      costPerTaskUsd: input.costPerTaskUsd,
      errors: errors as Prisma.InputJsonValue,
      ranAt: new Date(input.ranAt),
      artifactUrl: input.artifactUrl || null,
    },
  });

  await revalidateAsset(assetId);
}
