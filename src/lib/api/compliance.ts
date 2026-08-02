import { apiFetch, apiFetchBlob } from "@/lib/api/client";
import type { Finding } from "@/lib/api/score";

export type RuleKind = "prohibit" | "require" | "flag";
export type RuleSeverity = "block" | "warn" | "info";
export type CheckOutcome = "pass" | "flagged" | "blocked" | "overridden" | "approved";
export type ReviewDecision = "approve" | "override" | "reject";
export type ExportFormat = "pdf" | "csv";
export type ExportStatus = "pending" | "ready" | "failed";

export interface PolicyRule {
  ruleKey: string;
  dimensionKey: string;
  kind: RuleKind;
  threshold: number;
  severity: RuleSeverity;
  citation: string | null;
  rationale: string | null;
}

export interface PolicyVersion {
  id: string;
  version: number;
  live: boolean;
  rules: PolicyRule[];
  createdAt: string;
}

export interface Policy {
  id: string;
  name: string;
  regime: string | null;
  status: "active" | "archived";
  packKey: string | null;
  packVersion: number | null;
  updateAvailable: boolean;
  liveVersion: PolicyVersion | null;
  createdAt: string;
}

export interface PackDiffRuleChange {
  ruleKey: string;
  before: PolicyRule | null;
  after: PolicyRule | null;
}

export interface PackDiff {
  packKey: string;
  currentPackVersion: number;
  policyPackVersion: number | null;
  updateAvailable: boolean;
  addedRules: PolicyRule[];
  removedRules: PolicyRule[];
  changedRules: PackDiffRuleChange[];
}

export interface Dimension {
  key: string;
  name: string;
  description: string;
  category: string;
  measurability: string;
}

export interface BatchCheckItemInput {
  text: string;
  contentRef?: string;
}

export interface BatchCheckJob {
  id: string;
  policyId: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  totalItems: number;
  completedItems: number;
  failedItems: number;
  createdAt: string;
  completedAt: string | null;
}

export interface BatchCheckItemResult {
  contentRef: string | null;
  checkId: string | null;
  outcome: string | null;
  violationCount: number | null;
  status: "PENDING" | "SUCCESS" | "FAILED";
  error: string | null;
}

export type PackRequestStatus = "pending" | "approved" | "rejected";

export interface PackRequest {
  id: string;
  regimeName: string;
  jurisdiction: string | null;
  sourceUrl: string | null;
  notes: string | null;
  sourcePolicyId: string | null;
  status: PackRequestStatus;
  createdAt: string;
}

export interface PolicyPack {
  regime: string;
  name: string;
  description: string;
  rules: PolicyRule[];
}

export interface RuleResult {
  ruleKey: string;
  dimensionKey: string;
  kind: RuleKind;
  severity: RuleSeverity;
  titer: number;
  threshold: number;
  citation: string | null;
  violated: boolean;
}

export interface Violation {
  id: string;
  ruleKey: string;
  dimensionKey: string;
  kind: RuleKind;
  severity: RuleSeverity;
  titer: number;
  threshold: number;
  citation: string | null;
  findings: Finding[];
  resolved: "open" | "accepted" | "overridden" | "fixed";
}

export interface Review {
  id: string;
  reviewerUserId: string;
  decision: ReviewDecision;
  reason: string;
  reviewedAt: string;
}

export interface ComplianceCheck {
  id: string;
  policyId: string;
  policyVersion: number;
  contentRef: string | null;
  outcome: CheckOutcome;
  ruleResults: RuleResult[];
  violations: Violation[];
  reviews: Review[];
  createdAt: string;
  disclaimer: string;
}

export interface ComplianceCheckSummary {
  id: string;
  policyId: string;
  policyVersion: number;
  contentRef: string | null;
  outcome: CheckOutcome;
  violationCount: number;
  createdAt: string;
}

export interface AuditExport {
  id: string;
  rangeStart: string;
  rangeEnd: string;
  policyId: string | null;
  format: ExportFormat;
  status: ExportStatus;
  downloadUrl: string | null;
  createdAt: string;
}

export function listPacks() {
  return apiFetch<PolicyPack[]>("/v1/compliance/packs");
}

export function listPolicies() {
  return apiFetch<Policy[]>("/v1/compliance/policies");
}

export function getPolicy(id: string) {
  return apiFetch<Policy>(`/v1/compliance/policies/${id}`);
}

export function createPolicyFromPack(regime: string, name?: string) {
  return apiFetch<Policy>("/v1/compliance/policies/from-pack", {
    method: "POST",
    body: JSON.stringify({ regime, name }),
  });
}

export function runCheck(text: string, policyId: string, contentRef?: string) {
  return apiFetch<ComplianceCheck>("/v1/compliance/checks", {
    method: "POST",
    body: JSON.stringify({ text, policyId, contentRef }),
  });
}

export function listChecks() {
  return apiFetch<ComplianceCheckSummary[]>("/v1/compliance/checks");
}

export function getCheck(id: string) {
  return apiFetch<ComplianceCheck>(`/v1/compliance/checks/${id}`);
}

export function reviewCheck(id: string, decision: ReviewDecision, reason: string) {
  return apiFetch<Review>(`/v1/compliance/checks/${id}/review`, {
    method: "POST",
    body: JSON.stringify({ decision, reason }),
  });
}

export function createExport(rangeStart: string, rangeEnd: string, format: ExportFormat, policyId?: string) {
  return apiFetch<AuditExport>("/v1/compliance/exports", {
    method: "POST",
    body: JSON.stringify({ rangeStart, rangeEnd, format, policyId }),
  });
}

export function getExport(id: string) {
  return apiFetch<AuditExport>(`/v1/compliance/exports/${id}`);
}

// ------------------------------------------------------------- policy versions

export function createPolicyVersion(policyId: string, rules: PolicyRule[]) {
  return apiFetch<PolicyVersion>(`/v1/compliance/policies/${policyId}/versions`, {
    method: "POST",
    body: JSON.stringify({ rules }),
  });
}

export function activatePolicyVersion(policyId: string, version: number) {
  return apiFetch<PolicyVersion>(`/v1/compliance/policies/${policyId}/activate`, {
    method: "POST",
    body: JSON.stringify({ version }),
  });
}

export function getPackDiff(policyId: string) {
  return apiFetch<PackDiff>(`/v1/compliance/policies/${policyId}/pack-diff`);
}

export function resetToPackDefaults(policyId: string) {
  return apiFetch<PolicyVersion>(`/v1/compliance/policies/${policyId}/reset-to-pack-defaults`, { method: "POST" });
}

export function updatePolicyFromPack(policyId: string) {
  return apiFetch<PolicyVersion>(`/v1/compliance/policies/${policyId}/update-from-pack`, { method: "POST" });
}

export function listDimensions() {
  return apiFetch<Dimension[]>("/v1/dimensions");
}

// ------------------------------------------------------------- batch checks

export function startBatchCheck(policyId: string, items: BatchCheckItemInput[]) {
  return apiFetch<BatchCheckJob>("/v1/compliance/checks/batch", {
    method: "POST",
    body: JSON.stringify({ policyId, items }),
  });
}

export function getBatchJob(id: string) {
  return apiFetch<BatchCheckJob>(`/v1/compliance/checks/batch/${id}`);
}

export function getBatchJobItems(id: string) {
  return apiFetch<BatchCheckItemResult[]>(`/v1/compliance/checks/batch/${id}/items`);
}

// ------------------------------------------------------------- pack requests

export function createPackRequest(input: {
  regimeName: string;
  jurisdiction?: string;
  sourceUrl?: string;
  notes?: string;
  sourcePolicyId?: string;
}) {
  return apiFetch<PackRequest>("/v1/compliance/pack-requests", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** Lists ALL workspaces' requests, not just this one's -- see PackRequestService's own javadoc: there's no platform-admin role yet to gate this on, so it's open to any authenticated user for now. Not sensitive data (regime names/jurisdictions/notes), but flagged in DECISIONS-NEEDED.md as needing real admin/founder separation before this is customer-facing. */
export function listAllPackRequests() {
  return apiFetch<PackRequest[]>("/v1/compliance/pack-requests");
}

export function approvePackRequest(id: string) {
  return apiFetch<PackRequest>(`/v1/compliance/pack-requests/${id}/approve`, { method: "POST" });
}

export function rejectPackRequest(id: string) {
  return apiFetch<PackRequest>(`/v1/compliance/pack-requests/${id}/reject`, { method: "POST" });
}

export const PACK_REQUEST_STATUS_LABEL: Record<PackRequestStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

/** Auth headers can't ride a plain <a href> browser navigation (no cookie-based session), so the file comes down as a Blob and gets a client-side object-URL download instead. */
export async function downloadExport(exp: AuditExport) {
  if (!exp.downloadUrl) {
    throw new Error("Export is not ready yet");
  }
  const blob = await apiFetchBlob(exp.downloadUrl);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `titer-compliance-audit-${exp.id}.${exp.format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const OUTCOME_LABEL: Record<CheckOutcome, string> = {
  pass: "Pass",
  flagged: "Flagged",
  blocked: "Blocked",
  overridden: "Overridden",
  approved: "Approved",
};
