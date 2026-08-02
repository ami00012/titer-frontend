"use client";

interface ParagraphScore {
  index: number;
  span: [number, number];
  titer: number;
  band: string;
  findingCount: number;
  insufficientLength: boolean;
}

interface HeatStripProps {
  paragraphs: ParagraphScore[];
  onSelectParagraph?: (paragraph: ParagraphScore) => void;
  selectedIndex?: number | null;
}

function colorVarFor(titer: number): string {
  // Same "higher titer = better" direction as the rest of the app
  // (ScoreCombiner.verdict / emotional_tone.yaml bands).
  if (titer >= 70) return "var(--status-good)";
  if (titer >= 40) return "var(--status-warning)";
  return "var(--status-critical)";
}

/**
 * One segment per scorable paragraph. Segments are equal-width by design:
 * paragraph *length* isn't the signal here, which paragraph is the problem
 * is. Renders nothing below 3 scorable paragraphs.
 *
 * Currently always renders null: emotional_tone (the flagship dimension) has
 * no deterministic per-paragraph pass -- ai_flavor's RuleEngine, which this
 * fed on, was retired with it (no per-paragraph tone signal exists yet, and
 * an LLM call per paragraph would multiply judge-call cost per scan). The
 * backend always returns an empty paragraphs array; this component is kept
 * because it degrades gracefully rather than needing to be ripped out, and
 * is ready to come back if a per-paragraph signal is ever built.
 */
export function HeatStrip({ paragraphs, onSelectParagraph, selectedIndex }: HeatStripProps) {
  if (paragraphs.length < 3) return null;

  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Paragraph breakdown</span>
        <span>{paragraphs.length} paragraphs</span>
      </div>
      <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full">
        {paragraphs.map((paragraph) => (
          <button
            key={paragraph.index}
            type="button"
            onClick={() => onSelectParagraph?.(paragraph)}
            title={
              paragraph.insufficientLength
                ? `Paragraph ${paragraph.index + 1}: too short to score independently`
                : `Paragraph ${paragraph.index + 1}: ${paragraph.titer} (${paragraph.band}), ${paragraph.findingCount} finding${paragraph.findingCount === 1 ? "" : "s"}`
            }
            className="h-full flex-1 transition-opacity hover:opacity-80"
            style={{
              backgroundColor: colorVarFor(paragraph.titer),
              opacity: paragraph.insufficientLength ? 0.35 : selectedIndex === paragraph.index ? 1 : 0.85,
              outline: selectedIndex === paragraph.index ? "2px solid var(--foreground)" : "none",
              outlineOffset: "1px",
            }}
          />
        ))}
      </div>
    </div>
  );
}
