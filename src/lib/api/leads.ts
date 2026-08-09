import { apiFetch } from "@/lib/api/client";

export type LeadType = "trial_request" | "demo_request" | "waitlist_signup" | "custom_plan_call";

export interface LeadPayload {
  type: LeadType;
  /** Required for trial_request/demo_request; optional for waitlist_signup (backend makes both nullable, see LeadRequest's javadoc). */
  name?: string;
  workEmail: string;
  company?: string;
  role?: string;
  message?: string;
}

export function submitLead(payload: LeadPayload) {
  return apiFetch<void>("/v1/leads", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
