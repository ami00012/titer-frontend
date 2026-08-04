"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TiterDial } from "@/components/titer/titer-dial";
import { ScoreQuotaMeter } from "@/components/titer/score-quota-meter";
import { listScans } from "@/lib/api/score";

export default function DashboardPage() {
  // Most-recent-first (see ScanRepository.findByWorkspaceIdOrderByCreatedAtDesc) --
  // [0] is the latest scan, if any.
  const scansQuery = useQuery({ queryKey: ["scans"], queryFn: listScans });
  const latestScan = scansQuery.data?.[0];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Overview</h1>
      <ScoreQuotaMeter />
      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Titer Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-2">
            {/* higher-is-better, matching every other Score dial in the app
                (see product/score, the homepage TOOLS card, Measure) --
                titer is "how emotionally resonant this reads." */}
            <TiterDial
              score={latestScan?.titer ?? 0}
              direction="higher-is-better"
              verdict={latestScan ? latestScan.verdict : "No scans yet"}
              size={120}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Titer Visibility</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-2">
            <TiterDial
              score={0}
              direction="higher-is-better"
              verdict="No brand tracked"
              size={120}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
