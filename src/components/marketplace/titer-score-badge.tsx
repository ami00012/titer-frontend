import { Badge } from "@/components/ui/badge";
import { computeGrade, GRADE_COLOR_CLASSES } from "@/lib/titer-score";

/** Never infer or estimate a grade -- `total` absent means render "Unscored". */
export function TiterScoreBadge({ total }: { total: number | null | undefined }) {
  if (total === null || total === undefined) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Unscored
      </Badge>
    );
  }
  const grade = computeGrade(total);
  return (
    <Badge className={GRADE_COLOR_CLASSES[grade]}>
      {grade} · {total}
    </Badge>
  );
}
