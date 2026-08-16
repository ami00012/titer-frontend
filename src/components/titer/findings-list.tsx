import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { apiErrorMessage } from "@/lib/api/client";
import { generateFix, type Finding } from "@/lib/api/score";

function severityVariant(severity: string): "destructive" | "secondary" | "outline" {
  if (severity === "high") return "destructive";
  if (severity === "medium") return "secondary";
  return "outline";
}

function copyText(text: string, finding: Finding) {
  navigator.clipboard.writeText(text);
  toast.success("Fix copied.");
  track("fix_clicked", { ruleId: finding.ruleId, severity: finding.severity });
}

/** sourceText, if given, lets a real fix be generated even when the judge itself returned no suggestion -- see FixGenerationService on the backend. */
export function FindingsList({ findings, sourceText, dimensionKey }: { findings: Finding[]; sourceText?: string; dimensionKey?: string }) {
  const [generated, setGenerated] = useState<Record<number, { suggestion: string; preview: boolean }>>({});
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [errorIndex, setErrorIndex] = useState<number | null>(null);

  if (findings.length === 0) return null;

  function quotedTextFor(finding: Finding): string | null {
    const [start, end] = finding.span;
    if (!sourceText || start < 0 || end <= start) return null;
    return sourceText.slice(start, end);
  }

  async function handleGenerateFix(finding: Finding, index: number) {
    setPendingIndex(index);
    setErrorIndex(null);
    track("fix_generate_clicked", { ruleId: finding.ruleId, severity: finding.severity });
    try {
      const result = await generateFix(finding, quotedTextFor(finding), dimensionKey);
      setGenerated((prev) => ({ ...prev, [index]: result }));
    } catch (error) {
      setErrorIndex(index);
      toast.error(apiErrorMessage(error, "Couldn't generate a fix."));
    } finally {
      setPendingIndex(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium text-secondary-foreground">Findings</h3>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {findings.map((finding, index) => {
          const fix = generated[index];
          const suggestion = finding.suggestion ?? fix?.suggestion ?? null;
          return (
            <li
              key={`${finding.ruleId}-${index}`}
              className="rounded-md border border-border bg-muted/30 p-3 text-sm"
            >
              <div className="flex items-center gap-2">
                <Badge variant={severityVariant(finding.severity)}>{finding.severity}</Badge>
                <span className="font-medium">{finding.ruleId}</span>
              </div>
              <p className="mt-1 text-secondary-foreground">{finding.explanation}</p>
              {suggestion ? (
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="text-muted-foreground">
                    Suggestion: {suggestion}
                    {fix?.preview ? (
                      <span className="ml-1 text-xs text-amber-600 dark:text-amber-400">(preview -- upgrade for the full fix)</span>
                    ) : null}
                  </p>
                  <Button size="xs" variant="outline" onClick={() => copyText(suggestion, finding)}>
                    Copy fix
                  </Button>
                </div>
              ) : (
                <div className="mt-1 flex items-center gap-2">
                  <Button
                    size="xs"
                    variant="outline"
                    disabled={pendingIndex === index}
                    onClick={() => handleGenerateFix(finding, index)}
                  >
                    {pendingIndex === index ? "Generating…" : "Generate fix"}
                  </Button>
                  {errorIndex === index ? <span className="text-xs text-destructive">Couldn&apos;t generate a fix.</span> : null}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
