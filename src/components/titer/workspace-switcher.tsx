"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDownIcon, CheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEntitlements } from "@/hooks/use-entitlements";
import { useMyWorkspaces } from "@/hooks/use-my-workspaces";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";

const KIND_LABEL: Record<string, string> = {
  PERSONAL: "Personal",
  TEAM: "Team",
  CLIENT: "Client",
};

export function WorkspaceSwitcher() {
  const { data: workspaces, isLoading } = useMyWorkspaces();
  const { workspaceId: currentWorkspaceId, workspaceName } = useEntitlements();
  const setCurrentWorkspaceId = useWorkspaceStore((s) => s.setCurrentWorkspaceId);
  const queryClient = useQueryClient();

  if (isLoading || !workspaces || workspaces.length <= 1) {
    return workspaceName ? (
      <span className="text-sm font-medium text-secondary-foreground">{workspaceName}</span>
    ) : null;
  }

  function selectWorkspace(id: string) {
    if (id === currentWorkspaceId) return;
    setCurrentWorkspaceId(id);
    // Workspace switch invalidates every workspace-scoped query at once --
    // simpler and safer than threading invalidation through each feature.
    queryClient.invalidateQueries();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm">
            {workspaceName ?? "Select workspace"}
            <ChevronsUpDownIcon data-icon="inline-end" className="opacity-60" />
          </Button>
        }
      />
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.map((workspace) => (
          <DropdownMenuItem key={workspace.id} onClick={() => selectWorkspace(workspace.id)}>
            <div className="flex flex-1 flex-col">
              <span>{workspace.name}</span>
              <span className="text-xs text-muted-foreground">{KIND_LABEL[workspace.kind] ?? workspace.kind}</span>
            </div>
            {workspace.id === currentWorkspaceId ? <CheckIcon className="size-4" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
