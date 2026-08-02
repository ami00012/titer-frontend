import { createHmac } from "node:crypto";

// Must match the running dev backend's SUPABASE_JWT_SECRET (the "dev" Spring
// profile's known local value). DevAuthFilter authenticates every request as
// the fixed DevUser UNLESS a real, validly-signed Bearer token is presented
// -- in which case SupabaseJwtAuthFilter wins instead (see its javadoc).
// This is how these tests impersonate a *second* real user without a real
// Supabase account, mirroring the exact technique the backend's own
// integration tests use (see ClientWorkspaceIsolationTest.jwtFor).
const DEV_JWT_SECRET = process.env.SUPABASE_JWT_SECRET ?? "local-dev-secret-local-dev-secret-32b";

function base64url(input: string): string {
  return Buffer.from(input).toString("base64url");
}

export function signDevJwt(userId: string, email: string): string {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64url(
    JSON.stringify({ sub: userId, email, iat: now, exp: now + 3600 }),
  );
  const signature = createHmac("sha256", DEV_JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");
  return `${header}.${payload}.${signature}`;
}
