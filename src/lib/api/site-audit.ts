import { apiFetch, apiFetchBlob } from "@/lib/api/client";

export type SiteAuditStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
export type SiteAuditMode = "SCORE_DIMENSIONS" | "COMPLIANCE_POLICY";
export type SiteAuditItemStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface BotAccessFinding {
  ruleId: string;
  severity: string;
  explanation: string;
  suggestion: string | null;
}

export interface SiteAuditJob {
  id: string;
  domain: string;
  status: SiteAuditStatus;
  mode: SiteAuditMode;
  policyId: string | null;
  totalUrls: number;
  completedUrls: number;
  failedUrls: number;
  aggregateScore: number | null;
  createdAt: string;
  completedAt: string | null;
  botAccessFindings: BotAccessFinding[];
}

export interface SiteAuditItem {
  id: string;
  url: string;
  status: SiteAuditItemStatus;
  scanId: string | null;
  titer: number | null;
  outcome: string | null;
  violationCount: number | null;
  error: string | null;
  /** Set when the score is real but only visible after Titer rendered the page with JS -- plain-fetch crawlers see none of it. */
  renderNote: string | null;
}

export interface StartSiteAuditInput {
  domain?: string;
  urls?: string[];
  policyId?: string;
  dimensionKeys?: string[];
}

export function startSiteAudit(input: StartSiteAuditInput) {
  return apiFetch<SiteAuditJob>("/v1/site-audits", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listSiteAudits() {
  return apiFetch<SiteAuditJob[]>("/v1/site-audits");
}

export function getSiteAudit(id: string) {
  return apiFetch<SiteAuditJob>(`/v1/site-audits/${id}`);
}

/** Worst-first -- lowest score (SCORE_DIMENSIONS) or worst outcome + most violations (COMPLIANCE_POLICY) first; failed items always last. */
export function getSiteAuditItems(id: string) {
  return apiFetch<SiteAuditItem[]>(`/v1/site-audits/${id}/items`);
}

export async function downloadSiteAuditExport(id: string) {
  const blob = await apiFetchBlob(`/v1/site-audits/${id}/export`);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `titer-quality-audit-${id}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** "Client-ready reports" / "white-label reports" -- applies the workspace's saved branding (Settings > Branding); 402s below shareCard=CLEAN. */
export async function downloadSiteAuditPdf(id: string) {
  const blob = await apiFetchBlob(`/v1/site-audits/${id}/export/pdf`);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `titer-quality-report-${id}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
