import { apiFetch } from "@/lib/api/client";

export interface ApiKey {
  id: string;
  label: string;
  keyPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  revoked: boolean;
  expiresAt: string | null;
  createdAt: string;
  /** Only present on the response from create()/rotate() -- shown once, never returned again. */
  rawKey: string | null;
}

/** Mirrors com.titerbackend.apikey.ApiScope's wire values. quality:write/dimensions:manage are issuable but don't gate anything yet. */
export const API_SCOPES = [
  { value: "score:read", label: "Score: read" },
  { value: "score:write", label: "Score: write" },
  { value: "quality:write", label: "Quality: write" },
  { value: "visibility:read", label: "Visibility: read" },
  { value: "visibility:write", label: "Visibility: write" },
  { value: "dimensions:manage", label: "Dimensions: manage" },
  { value: "compliance:read", label: "Compliance: read" },
  { value: "compliance:write", label: "Compliance: write" },
] as const;

export function listApiKeys() {
  return apiFetch<ApiKey[]>("/v1/keys");
}

export function createApiKey(label: string, scopes: string[]) {
  return apiFetch<ApiKey>("/v1/keys", {
    method: "POST",
    body: JSON.stringify({ label, scopes }),
  });
}

export function revokeApiKey(id: string) {
  return apiFetch<void>(`/v1/keys/${id}`, { method: "DELETE" });
}

export function rotateApiKey(id: string) {
  return apiFetch<ApiKey>(`/v1/keys/${id}/rotate`, { method: "POST" });
}
