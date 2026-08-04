import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import type { Finding } from "@/lib/api/score";

function severityVariant(severity: string): "destructive" | "secondary" | "outline" {
  if (severity === "high") return "destructive";
  if (severity === "medium") return "secondary";
  return "outline";
}

function copyFix(finding: Finding) {
  if (!finding.suggestion) return;
  navigator.clipboard.writeText(finding.suggestion);
  toast.success("Fix copied.");
  track("fix_clicked", { ruleId: finding.ruleId, severity: finding.severity });
}

export function FindingsList({ findings }: { findings: Finding[] }) {
  if (findings.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium text-secondary-foreground">Findings</h3>
      <ul className="flex flex-col gap-2">
        {findings.map((finding, index) => (
          <li
            key={`${finding.ruleId}-${index}`}
            className="rounded-md border border-border bg-muted/30 p-3 text-sm"
          >
            <div className="flex items-center gap-2">
              <Badge variant={severityVariant(finding.severity)}>{finding.severity}</Badge>
              <span className="font-medium">{finding.ruleId}</span>
            </div>
            <p className="mt-1 text-secondary-foreground">{finding.explanation}</p>
            {finding.suggestion ? (
              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="text-muted-foreground">Suggestion: {finding.suggestion}</p>
                <Button size="xs" variant="outline" onClick={() => copyFix(finding)}>
                  Copy fix
                </Button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
