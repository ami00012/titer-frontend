"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CheckResult } from "@/components/compliance/check-result";
import { apiErrorMessage } from "@/lib/api/client";
import { getCheck } from "@/lib/api/compliance";

export default function ComplianceCheckDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const checkQuery = useQuery({ queryKey: ["compliance", "checks", id], queryFn: () => getCheck(id) });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/compliance/checks" className="text-sm text-secondary-foreground hover:text-foreground">
          ← Check history
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">{checkQuery.data?.contentRef || "Check detail"}</h1>
      </div>

      {checkQuery.isPending ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : checkQuery.isError ? (
        <p className="text-sm text-destructive">{apiErrorMessage(checkQuery.error, "Couldn't load this check.")}</p>
      ) : (
        <CheckResult check={checkQuery.data} />
      )}
    </div>
  );
}
