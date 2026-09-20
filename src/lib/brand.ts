export const BRAND_NAME = "Titer";
export const BRAND_TAGLINE = "The ratings and measurement layer for AI-era assets.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://titer.dev";
/** Internal notification sink -- routed through sendEmailEvent (console-logs until a real provider is wired up, see src/lib/email). Not rendered publicly as a contact address. */
export const TEAM_NOTIFICATION_EMAIL = process.env.TEAM_NOTIFICATION_EMAIL ?? "team@titer.dev";
