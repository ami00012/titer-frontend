import type { APIRequestContext } from "@playwright/test";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/** DevUser's fixed identity under the backend's "dev" profile (see DevUser.java) -- every unauthenticated/no-token request is logged in as this user. */
export const DEV_USER_ID = "00000000-0000-0000-0000-000000000000";

export async function meAsDevUser(request: APIRequestContext) {
  const res = await request.get(`${API_URL}/v1/me`);
  if (!res.ok()) throw new Error(`GET /v1/me failed: ${res.status()}`);
  return res.json() as Promise<{ workspaceId: string; workspacePlan: string }>;
}

/** Dev-profile-only escape hatch (DevTestController) -- sets a workspace's plan directly, bypassing Stripe checkout, which isn't configured in this dev environment. */
export async function setWorkspacePlan(request: APIRequestContext, workspaceId: string, plan: string) {
  const res = await request.post(`${API_URL}/v1/dev/workspaces/${workspaceId}/plan`, {
    data: { plan },
  });
  if (!res.ok()) throw new Error(`Failed to set plan: ${res.status()} ${await res.text()}`);
}

export async function inviteMember(
  request: APIRequestContext,
  workspaceId: string,
  email: string,
  role: string,
) {
  const res = await request.post(`${API_URL}/v1/workspace/invites`, {
    headers: { "X-Workspace-Id": workspaceId },
    data: { email, role },
  });
  if (!res.ok()) throw new Error(`Invite failed: ${res.status()} ${await res.text()}`);
  const body = (await res.json()) as { token: string };
  return body.token;
}

export async function acceptInviteAs(request: APIRequestContext, token: string, bearerJwt: string) {
  const res = await request.post(`${API_URL}/v1/workspace/invites/accept`, {
    headers: { Authorization: `Bearer ${bearerJwt}` },
    data: { token },
  });
  if (!res.ok()) throw new Error(`Accept failed: ${res.status()} ${await res.text()}`);
}
