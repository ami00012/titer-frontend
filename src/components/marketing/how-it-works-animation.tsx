import { ShieldCheck, Handshake, Building2, Globe, Bot } from "lucide-react";

/** Three small mini-listing cards cycling in and out, suggesting new assets being listed. */
export function ListingAnimation() {
  const cards = [
    { Icon: Building2, label: "SaaS", cls: "animate-step-card-1" },
    { Icon: Globe, label: "Domain", cls: "animate-step-card-2" },
    { Icon: Bot, label: "AI Agent", cls: "animate-step-card-3" },
  ];
  return (
    <div className="relative flex h-24 w-full items-center justify-center">
      {cards.map(({ Icon, label, cls }) => (
        <div
          key={label}
          className={`absolute flex w-40 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-sm ${cls}`}
        >
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          <div className="flex flex-1 flex-col gap-1">
            <div className="h-1.5 w-16 rounded-full bg-foreground/20" />
            <div className="h-1.5 w-10 rounded-full bg-foreground/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** A shield-check badge with expanding verification rings pulsing outward. */
export function VerifyMatchAnimation() {
  return (
    <div className="relative flex h-24 w-full items-center justify-center">
      <span className="absolute size-12 rounded-full border-2 border-foreground/30 animate-step-ring-1" />
      <span className="absolute size-12 rounded-full border-2 border-foreground/30 animate-step-ring-2" />
      <div className="relative flex size-12 items-center justify-center rounded-full bg-foreground text-background">
        <ShieldCheck className="size-6" />
      </div>
    </div>
  );
}

/** Two nodes with a line drawing between them and a handshake check popping at the midpoint. */
export function BrokerDealAnimation() {
  return (
    <div className="relative flex h-24 w-full items-center justify-center gap-6">
      <div className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-xs font-medium text-muted-foreground">
        Buyer
      </div>
      <svg width="64" height="2" viewBox="0 0 64 2" className="shrink-0 overflow-visible">
        <line
          x1="0"
          y1="1"
          x2="64"
          y2="1"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="64"
          className="animate-step-line text-foreground/40"
        />
      </svg>
      <div className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-xs font-medium text-muted-foreground">
        Seller
      </div>
      <div className="absolute flex size-9 items-center justify-center rounded-full bg-foreground text-background animate-step-check">
        <Handshake className="size-4" />
      </div>
    </div>
  );
}
