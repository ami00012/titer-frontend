import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WorkspaceState {
  currentWorkspaceId: string | null;
  setCurrentWorkspaceId: (id: string) => void;
  clearWorkspace: () => void;
}

/** Persisted client-side selection; apiFetch reads this synchronously to attach X-Workspace-Id. Omitting the header entirely (null) is fine -- WorkspaceResolutionFilter falls back to the caller's default (personal) workspace. */
export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      currentWorkspaceId: null,
      setCurrentWorkspaceId: (id) => set({ currentWorkspaceId: id }),
      clearWorkspace: () => set({ currentWorkspaceId: null }),
    }),
    { name: "titer_workspace_id" },
  ),
);
