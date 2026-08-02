import { create } from "zustand";

interface UpgradeModalState {
  open: boolean;
  reason: string | null;
  suggestedPlan: string | null;
  openModal: (opts: { reason: string; suggestedPlan?: string }) => void;
  close: () => void;
}

/** Global so <Locked> anywhere in the tree can trigger the one modal rendered at the app root, without prop drilling. */
export const useUpgradeModalStore = create<UpgradeModalState>((set) => ({
  open: false,
  reason: null,
  suggestedPlan: null,
  openModal: ({ reason, suggestedPlan }) => set({ open: true, reason, suggestedPlan: suggestedPlan ?? null }),
  close: () => set({ open: false }),
}));
