import { apiFetch } from "@/lib/api/client";

export interface Member {
  userId: string;
  email: string | null;
  role: string;
  joinedAt: string;
}

export interface PendingInvite {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
}

export interface MembersAndInvites {
  members: Member[];
  pendingInvites: PendingInvite[];
}

export interface MemberUsage {
  userId: string;
  email: string | null;
  callCount: number;
  costUsd: number;
}

export interface UsageSummary {
  scoreScansThisMonth: number;
  apiCallsThisMonth: number;
  totalCostUsd: number;
  byMember: MemberUsage[];
}

export function getMembers() {
  return apiFetch<MembersAndInvites>("/v1/workspace/members");
}

export function getUsageSummary() {
  return apiFetch<UsageSummary>("/v1/workspace/usage");
}

/** role is one of MembershipRole's wire values: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER". */
export function inviteMember(email: string, role: string) {
  return apiFetch<{ token: string }>("/v1/workspace/invites", {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
}
