import { test, expect } from "@playwright/test";
import { API_URL, meAsDevUser, setWorkspacePlan } from "./support/api";

/**
 * Gate: "workspace switch isolates data." Creates a real client workspace
 * under DevUser's own (now-agency-plan) workspace via the real
 * POST /v1/workspace/clients endpoint, then verifies it surfaces in the FE
 * switcher (exercising the listMyWorkspaces implicit-access fix made
 * alongside this test) and that switching to it changes what the app
 * displays -- a client workspace's own `plan` is nominally "free" (see
 * WorkspaceService.createClientWorkspace), distinctly different from the
 * agency parent's "agency" plan, so the billing page's displayed plan is a
 * clean, real signal that the switch actually changed which workspace's
 * data is being read.
 */
test("switching workspaces changes which workspace's data is displayed", async ({ page, request }) => {
  const me = await meAsDevUser(request);
  await setWorkspacePlan(request, me.workspaceId, "agency");

  const clientName = `E2E Client ${Date.now()}`;
  const createRes = await request.post(`${API_URL}/v1/workspace/clients`, {
    headers: { "X-Workspace-Id": me.workspaceId },
    data: { name: clientName },
  });
  expect(createRes.ok()).toBeTruthy();

  await page.goto("/settings/billing");
  await expect(page.getByText("agency", { exact: true })).toBeVisible();

  // "dev" is displayName(user) for dev@titer.local (WorkspaceService.displayName) --
  // the switcher only renders as a clickable dropdown once there are 2+ workspaces.
  await page.getByRole("button", { name: "dev", exact: true }).click();
  await page.getByRole("menuitem", { name: new RegExp(clientName) }).click();

  await expect(page.getByText("free", { exact: true })).toBeVisible();
});
