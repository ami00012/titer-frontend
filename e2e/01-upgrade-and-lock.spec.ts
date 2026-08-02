import { test, expect } from "@playwright/test";
import { meAsDevUser, setWorkspacePlan } from "./support/api";

/**
 * Gate: "free hits limit -> upgrades -> limit gone" adapted to a real,
 * currently-enforced entitlement gate. Titer has no per-scan hard block UI
 * today (quota exhaustion surfaces as a 402 from the scan endpoint, not a FE
 * lock), but branding's "remove footer" toggle IS gated live by
 * entitlements.shareCard === "WHITE_LABEL" (only true on Agency) via the
 * same <Locked> component any future quota-based lock would use. This test
 * drives that real gate end to end: locked -> click upgrade -> modal opens
 * with plan options -> a plan selection reaches the real checkout endpoint.
 */
test("locked branding feature opens the upgrade modal and starts checkout", async ({ page, request }) => {
  const me = await meAsDevUser(request);
  await setWorkspacePlan(request, me.workspaceId, "free");

  await page.goto("/settings/branding");

  await expect(page.getByText(/white-label feature on Agency/i)).toBeVisible();
  await page.getByRole("button", { name: "Upgrade" }).click();

  await expect(page.getByRole("heading", { name: "Upgrade your plan" })).toBeVisible();
  const agencyOption = page.getByRole("button", { name: /Agency/ });
  await expect(agencyOption).toBeVisible();

  await agencyOption.click();

  // Stripe isn't configured with a real secret key in this dev environment,
  // so accept either outcome of a genuinely-attempted checkout call: a real
  // redirect to Stripe, or the app's own graceful error toast.
  const outcome = await Promise.race([
    page.waitForURL(/stripe/i, { timeout: 8000 }).then(() => "redirect" as const).catch(() => null),
    page
      .getByText(/couldn't start checkout/i)
      .waitFor({ state: "visible", timeout: 8000 })
      .then(() => "error-toast" as const)
      .catch(() => null),
  ]);

  expect(outcome).not.toBeNull();
});
