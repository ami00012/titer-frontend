"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";

export function LogoutButton() {
  const router = useRouter();
  const clearWorkspace = useWorkspaceStore((s) => s.clearWorkspace);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Persisted to localStorage, unscoped to any account -- a workspace ID
    // selected under this session must not leak into whichever account
    // signs in next on the same browser (see WorkspaceResolutionFilter's
    // 404 on a workspace the caller isn't a member of).
    clearWorkspace();
    router.push("/");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout}>
      Log out
    </Button>
  );
}
