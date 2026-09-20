/**
 * Pure rubric math (AGENTS spec §2.1). The rubric itself is published at
 * /methodology -- this file is the single source of truth for the weights so
 * the admin form, the listing page, and the methodology page can't drift.
 */
export const TITER_SCORE_COMPONENTS = [
  { key: "revenueDurability", label: "Revenue Durability", max: 25 },
  { key: "modelDependencyRisk", label: "Model Dependency Risk", max: 25 },
  { key: "transferComplexity", label: "Transfer Complexity", max: 20 },
  { key: "operationalLoad", label: "Operational Load", max: 15 },
  { key: "evidenceStrength", label: "Evidence Strength", max: 15 },
] as const;

export type TiterScoreComponentKey = (typeof TITER_SCORE_COMPONENTS)[number]["key"];

export type TiterScoreComponents = Record<TiterScoreComponentKey, number>;

export const CURRENT_RUBRIC_VERSION = "v1";

export type TiterGrade = "A" | "B" | "C" | "D";

export function computeGrade(total: number): TiterGrade {
  if (total >= 80) return "A";
  if (total >= 65) return "B";
  if (total >= 50) return "C";
  return "D";
}

export function computeTotal(components: TiterScoreComponents): number {
  return TITER_SCORE_COMPONENTS.reduce((sum, c) => sum + components[c.key], 0);
}

/** Clamps every component into [0, max] -- admin input is trusted but not blindly. */
export function clampComponents(components: TiterScoreComponents): TiterScoreComponents {
  return TITER_SCORE_COMPONENTS.reduce((acc, c) => {
    const value = Number(components[c.key]) || 0;
    acc[c.key] = Math.min(Math.max(Math.round(value), 0), c.max);
    return acc;
  }, {} as TiterScoreComponents);
}

export const GRADE_COLOR_CLASSES: Record<TiterGrade, string> = {
  A: "bg-emerald-600 text-white dark:bg-emerald-500",
  B: "bg-lime-600 text-white dark:bg-lime-500",
  C: "bg-amber-500 text-white dark:bg-amber-500",
  D: "bg-red-600 text-white dark:bg-red-500",
};
