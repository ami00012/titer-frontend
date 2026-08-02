"use client";

import { LockIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUpgradeModalStore } from "@/lib/stores/upgrade-modal-store";

interface LockedProps {
  /** Gate condition -- typically an entitlements field, e.g. entitlements.webhooks or entitlements.clientWorkspaces > 0. */
  allowed: boolean;
  /** Shown in the upsell overlay and passed to the upgrade modal, e.g. "Webhooks are a Studio feature." */
  reason: string;
  /** Plan key the CTA nudges toward, e.g. "studio". Omit if there's no single obvious next plan. */
  suggestedPlan?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * The one place gated UI checks an entitlement, per the design rule --
 * every locked affordance in the app should render through this rather than
 * hand-rolling its own plan comparison. Renders children unchanged when
 * allowed; otherwise dims them behind an overlay with an upgrade CTA.
 */
export function Locked({ allowed, reason, suggestedPlan, children, className }: LockedProps) {
  const openModal = useUpgradeModalStore((s) => s.openModal);

  if (allowed) return <>{children}</>;

  return (
    <div className={cn("group relative", className)}>
      <div aria-hidden className="pointer-events-none select-none opacity-40 blur-[1px]">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-background/60 p-4 text-center">
        <LockIcon className="size-5 text-muted-foreground" />
        <p className="max-w-xs text-sm text-muted-foreground">{reason}</p>
        <Button size="sm" onClick={() => openModal({ reason, suggestedPlan })}>
          Upgrade
        </Button>
      </div>
    </div>
  );
}
