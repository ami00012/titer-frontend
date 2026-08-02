import { apiFetch } from "@/lib/api/client";

export type LeadType = "trial_request" | "demo_request";

export interface LeadPayload {
  type: LeadType;
  name: string;
  workEmail: string;
  company: string;
  role?: string;
  message?: string;
}

// NOTE: /v1/leads doesn't exist on the backend yet (separate task: add it to
// titer-backend — store the lead, email the founder via Resend, return 202).
// Until then this call fails for real, and RequestDialog shows that as a
// genuine error state rather than faking a success.
export function submitLead(payload: LeadPayload) {
  return apiFetch<void>("/v1/leads", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
