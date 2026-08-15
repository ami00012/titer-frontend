type AnalyticsEvent =
  | "trial_requested"
  | "demo_requested"
  | "custom_plan_call_requested"
  | "scan_started"
  | "scan_completed"
  | "fix_clicked"
  | "fix_generate_clicked"
  | "compliance_policy_created"
  | "compliance_check_started"
  | "compliance_check_completed"
  | "compliance_review_submitted"
  | "compliance_issue_reported"
  | "compliance_export_requested"
  | "compliance_batch_check_started"
  | "compliance_batch_check_completed"
  | "compliance_pack_requested"
  | "compliance_policy_version_saved"
  | "compliance_policy_reset_to_pack"
  | "compliance_policy_updated_from_pack"
  | "quality_audit_started"
  | "visibility_brand_created"
  | "visibility_check_started"
  | "waitlist_signup";

// NOTE: no analytics provider is wired up yet (that's build-order step 8:
// analytics + SEO + JSON-LD + Lighthouse gate). Until then this pushes to
// window.dataLayer, so a provider snippet can pick events up later without
// call sites changing, and logs in dev so events are visible while building.
export function track(event: AnalyticsEvent, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  const payload = { event, properties, page: window.location.pathname };
  const w = window as typeof window & { dataLayer?: unknown[] };
  w.dataLayer ??= [];
  w.dataLayer.push(payload);

  if (process.env.NODE_ENV !== "production") {
    console.info("[analytics]", payload);
  }
}
