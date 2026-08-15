import { apiFetch } from "@/lib/api/client";

/** plan is one of PlanCatalog.PLAN_KEYS ("free" | "pro" | "studio" | "agency" | "business"); "anon" has no checkout. */
export function startCheckout(plan: string) {
  return apiFetch<{ url: string }>("/v1/billing/checkout", {
    method: "POST",
    body: JSON.stringify({
      plan,
      successUrl: `${window.location.origin}${window.location.pathname}?checkout=success`,
      cancelUrl: `${window.location.origin}${window.location.pathname}?checkout=cancelled`,
    }),
  });
}

export function openBillingPortal() {
  return apiFetch<{ url: string }>("/v1/billing/portal", {
    method: "POST",
    body: JSON.stringify({ returnUrl: `${window.location.origin}${window.location.pathname}` }),
  });
}
