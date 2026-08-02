"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api/account";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";

/**
 * The one FE hook that surfaces entitlements, per the design rule: "surfaced
 * by exactly one FE hook (useEntitlements)." Every gated affordance in the
 * app (Locked, QuotaMeter, admin pages) reads from this, never from a
 * hardcoded plan check.
 */
export function useEntitlements() {
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const setCurrentWorkspaceId = useWorkspaceStore((s) => s.setCurrentWorkspaceId);

  const query = useQuery({
    queryKey: ["me", currentWorkspaceId],
    queryFn: getMe,
    staleTime: 30_000,
  });

  // No explicit selection yet: pin the store to whatever the backend
  // resolved by default (WorkspaceResolutionFilter's "first membership"
  // fallback), so the switcher's "current" highlight and later
  // workspace-scoped calls agree with what /v1/me actually returned.
  useEffect(() => {
    if (!currentWorkspaceId && query.data?.workspaceId) {
      setCurrentWorkspaceId(query.data.workspaceId);
    }
  }, [currentWorkspaceId, query.data?.workspaceId, setCurrentWorkspaceId]);

  return {
    ...query,
    workspaceId: query.data?.workspaceId ?? null,
    workspaceName: query.data?.workspaceName ?? null,
    workspacePlan: query.data?.workspacePlan ?? null,
    role: query.data?.role ?? null,
    entitlements: query.data?.entitlements ?? null,
    quotaRemaining: query.data?.quotaRemaining ?? {},
  };
}
