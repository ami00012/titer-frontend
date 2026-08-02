/**
 * Dev-only escape hatch to view protected pages without a real Supabase
 * project. Double-gated so a stray env var can never leak into a prod
 * build: NODE_ENV is forced to "production" by `next build`/`next start`
 * regardless of what's in .env.
 */
export function isDevAuthBypassEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true"
  );
}

export const DEV_BYPASS_USER = {
  id: "00000000-0000-0000-0000-000000000000",
  email: "dev@titer.local",
};
