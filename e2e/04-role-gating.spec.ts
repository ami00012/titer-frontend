import { randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";
import { API_URL, acceptInviteAs, inviteMember, meAsDevUser, setWorkspacePlan } from "./support/api";
import { signDevJwt } from "./support/dev-jwt";

/**
 * Gate: "downgraded workspace shows a paused/restricted state," adapted --
 * Visibility (the plan's original subject) doesn't exist as a built
 * feature, so this exercises the restriction that IS real and enforced
 * today: WorkspaceClientController.requireAdmin() on the P8-prep members/
 * usage endpoints. Two layers, both live:
 *   1. API layer -- a real VIEWER-role JWT gets a real 403 from the backend.
 *   2. FE layer -- the members/usage pages render a restricted message
 *      instead of data for a non-admin role.
 * Layer 2 can't be driven by a real second browser session (dev-bypass
 * pins every browser tab to the fixed DevUser, always OWNER of their own
 * workspace) without a real second Supabase account, so it's the one
 * deliberate exception in this suite: /v1/me's `role` field is intercepted
 * to VIEWER while everything else in the response stays real, purely to
 * prove MembersPage/UsagePage's own role check renders correctly.
 */
test("a viewer is rejected by the real API and blocked by the real FE gate", async ({ page, request }) => {
  const me = await meAsDevUser(request);
  await setWorkspacePlan(request, me.workspaceId, "agency"); // plenty of seats

  const viewerId = randomUUID();
  const viewerEmail = `viewer-${viewerId}@example.com`;
  const token = await inviteMember(request, me.workspaceId, viewerEmail, "VIEWER");
  const viewerJwt = signDevJwt(viewerId, viewerEmail);
  await acceptInviteAs(request, token, viewerJwt);

  const membersAsViewer = await request.get(`${API_URL}/v1/workspace/members`, {
    headers: { Authorization: `Bearer ${viewerJwt}`, "X-Workspace-Id": me.workspaceId },
  });
  expect(membersAsViewer.status()).toBe(403);

  const usageAsViewer = await request.get(`${API_URL}/v1/workspace/usage`, {
    headers: { Authorization: `Bearer ${viewerJwt}`, "X-Workspace-Id": me.workspaceId },
  });
  expect(usageAsViewer.status()).toBe(403);

  await page.route("**/v1/me", async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    await route.fulfill({ response, json: { ...body, role: "VIEWER" } });
  });

  await page.goto("/settings/members");
  await expect(page.getByText(/Only workspace owners and admins can view the member roster/i)).toBeVisible();

  await page.goto("/settings/usage");
  await expect(page.getByText(/Only workspace owners and admins can view usage/i)).toBeVisible();
});
