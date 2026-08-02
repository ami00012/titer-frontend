import { apiFetch } from "@/lib/api/client";

export interface BrandingSettings {
  logoUrl: string | null;
  primaryColor: string | null;
  footerText: string | null;
  customDomain: string | null;
  removeFooter: boolean;
}

export function getBranding() {
  return apiFetch<BrandingSettings>("/v1/workspace/branding");
}

export function updateBranding(settings: BrandingSettings) {
  return apiFetch<BrandingSettings>("/v1/workspace/branding", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
}
