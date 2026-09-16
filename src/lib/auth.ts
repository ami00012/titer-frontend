import "server-only";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { DEV_BYPASS_USER, isDevAuthBypassEnabled } from "@/lib/dev-bypass";
import type { User } from "@prisma/client";

/**
 * Resolves the signed-in Supabase user and its matching Prisma profile row,
 * creating the profile on first sight -- there is no separate signup-sync
 * step, the row is upserted lazily the first time it's needed.
 */
export async function getCurrentUser(): Promise<User | null> {
  if (isDevAuthBypassEnabled()) {
    return prisma.user.upsert({
      where: { id: DEV_BYPASS_USER.id },
      update: {},
      create: { id: DEV_BYPASS_USER.id, email: DEV_BYPASS_USER.email, role: "ADMIN" },
    });
  }

  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (!supabaseUser) return null;

  return prisma.user.upsert({
    where: { id: supabaseUser.id },
    update: {},
    create: { id: supabaseUser.id, email: supabaseUser.email ?? "" },
  });
}

/** Throws-by-redirect callers should use this from a Server Action / Route Handler that requires a signed-in user. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

/** Server-side admin gate -- never trust a client-supplied role, always re-check here. */
export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "ADMIN" || user.suspended) throw new Error("Not authorized");
  return user;
}
