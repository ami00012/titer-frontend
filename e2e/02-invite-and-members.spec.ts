import { randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";
import { acceptInviteAs, meAsDevUser, setWorkspacePlan } from "./support/api";
import { signDevJwt } from "./support/dev-jwt";

/**
 * Gate: "invite -> accept -> shared data visible." DevUser (the browser
 * identity under dev-bypass) sends the invite through the real UI; a second,
 * genuinely distinct user (minted JWT, not DevUser) accepts it at the API
 * layer -- the browser has no way to become a second real identity under
 * dev-bypass, so this is where a live Playwright UI test necessarily hands
 * off to a live API call for the "other side" of a two-party flow.
 */
test("invited member appears pending, then a member after they accept", async ({ page, request }) => {
  const me = await meAsDevUser(request);
  await setWorkspacePlan(request, me.workspaceId, "studio"); // 3 seats -- room for DevUser + one invite

  await page.goto("/settings/members");
  await expect(page.getByText("dev@titer.local")).toBeVisible();

  const inviteEmail = `e2e-invite-${Date.now()}@example.com`;
  await page.getByLabel("Email").fill(inviteEmail);
  await page.getByLabel("Role").selectOption("MEMBER");

  const [inviteResponse] = await Promise.all([
    page.waitForResponse(
      (res) => res.url().includes("/v1/workspace/invites") && res.request().method() === "POST",
    ),
    page.getByRole("button", { name: "Send invite" }).click(),
  ]);
  const { token } = (await inviteResponse.json()) as { token: string };

  await expect(page.getByText(inviteEmail)).toBeVisible();

  const secondUserId = randomUUID();
  const accepterEmail = `accepter-${secondUserId}@example.com`;
  await acceptInviteAs(request, token, signDevJwt(secondUserId, accepterEmail));

  await page.reload();
  // The accepting request's JWT claims flow through SupabaseJwtAuthFilter ->
  // UserService.ensureUser, which real-creates the User row -- so the
  // member list (joined against that row) shows their real email, and the
  // pending-invites card disappears once its one entry is gone.
  await expect(page.getByText(accepterEmail)).toBeVisible();
  await expect(page.getByText("Pending invites")).toHaveCount(0);
});
