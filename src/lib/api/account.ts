import { apiFetch } from "@/lib/api/client";

/**
 * Mirrors com.titerbackend.plan.Entitlements verbatim -- this is the one FE
 * hook (useEntitlements) that surfaces the one backend config (PlanCatalog),
 * per the design rule. Add a field here only when it's added there.
 */
export interface Entitlements {
  planKey: string;
  stripePriceId: string | null;
  priceMonthlyUsd: number;
  seatsIncluded: number;
  clientWorkspaces: number;
  extraClientWorkspacePriceId: string | null;
  scoreScansMonthly: number | null;
  dimensionsPerScan: number;
  adhocXDaily: number | null;
  fixSuggestions: string;
  fileUpload: boolean;
  maxCharsPerScan: number;
  heatStrip: boolean;
  historyRetentionScans: number;
  historyRetentionMonths: number;
  shareCard: string;
  qualityScansMonthly: number;
  batchUrlsPerJob: number;
  visBrands: number;
  visQueriesPerBrand: number;
  visChannels: number | null;
  visCadence: string;
  customDimensions: number;
  dimensionPacksIncluded: number | null;
  thresholds: number;
  apiCallsMonthly: number;
  webhooks: boolean;
  scheduledReports: string;
  whiteLabelPdf: boolean;
  ssoSaml: boolean;
  support: string;
  fairUseDaily: number;
  concurrencyCap: number;
  apiRateLimitPerMinute: number;
}

export interface MeResponse {
  userId: string;
  email: string;
  createdAt: string;
  workspaceId: string | null;
  workspaceName: string | null;
  workspacePlan: string | null;
  role: string | null;
  entitlements: Entitlements | null;
  quotaRemaining: Record<string, number>;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  kind: string;
  createdAt: string;
}

export function getMe() {
  return apiFetch<MeResponse>("/v1/me");
}

export function listMyWorkspaces() {
  return apiFetch<WorkspaceSummary[]>("/v1/workspaces");
}

