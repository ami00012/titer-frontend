"use client";

import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuotaMeter } from "@/components/titer/quota-meter";
import { useEntitlements } from "@/hooks/use-entitlements";
import { getUsageSummary } from "@/lib/api/workspace";

export default function UsagePage() {
  const { role, entitlements } = useEntitlements();
  const isAdmin = role === "OWNER" || role === "ADMIN";

  const { data, isLoading } = useQuery({
    queryKey: ["workspace", "usage"],
    queryFn: getUsageSummary,
    enabled: isAdmin,
  });

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          Only workspace owners and admins can view usage.
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>This month</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <QuotaMeter
            label="Score scans"
            used={data.scoreScansThisMonth}
            limit={entitlements?.scoreScansMonthly ?? null}
          />
          <QuotaMeter
            label="API calls"
            used={data.apiCallsThisMonth}
            limit={entitlements ? entitlements.apiCallsMonthly : null}
          />
          <p className="text-sm text-muted-foreground">
            Total LLM cost this month: ${data.totalCostUsd.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>By member</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {data.byMember.map((m) => (
            <div key={m.userId} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
              <span className="text-sm font-medium">{m.email ?? m.userId}</span>
              <span className="text-sm text-muted-foreground">
                {m.callCount} calls · ${m.costUsd.toFixed(4)}
              </span>
            </div>
          ))}
          {data.byMember.length === 0 ? (
            <p className="text-sm text-muted-foreground">No usage recorded yet this month.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
