import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TiterDial } from "@/components/titer/titer-dial";
import { ScoreQuotaMeter } from "@/components/titer/score-quota-meter";

export default function DashboardPage() {
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
            <TiterDial score={0} direction="lower-is-better" verdict="No scans yet" size={120} />
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
