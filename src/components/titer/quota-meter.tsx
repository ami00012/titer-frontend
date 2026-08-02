import { cn } from "@/lib/utils";

interface QuotaMeterProps {
  label: string;
  used: number;
  /** null = unlimited at this plan -- entitlements' own convention for scoreScansMonthly etc. */
  limit: number | null;
  className?: string;
}

export function QuotaMeter({ label, used, limit, className }: QuotaMeterProps) {
  const unlimited = limit == null;
  const pct = unlimited ? 0 : Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));
  const critical = !unlimited && pct >= 90;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-secondary-foreground">{label}</span>
        <span className={cn("tabular-nums text-muted-foreground", critical && "text-destructive")}>
          {unlimited ? `${used} used` : `${used} / ${limit}`}
        </span>
      </div>
      {unlimited ? null : (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full bg-primary transition-all", critical && "bg-destructive")}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
