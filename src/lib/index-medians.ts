import type { AssetType } from "@prisma/client";

export const THIN_DATA_THRESHOLD = 5;

export interface ComparableRow {
  assetType: AssetType;
  sizeBand: string;
  multiple: unknown; // Decimal, coerced with Number()
}

export interface MedianRow {
  assetType: AssetType;
  sizeBand: string;
  median: number;
  n: number;
  thinData: boolean;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/** Groups by (assetType, sizeBand) and computes the median multiple for each -- n<5 is flagged as thin data, never hidden. */
export function computeMedians(rows: ComparableRow[]): MedianRow[] {
  const groups = new Map<string, { assetType: AssetType; sizeBand: string; values: number[] }>();

  for (const row of rows) {
    const key = `${row.assetType}::${row.sizeBand}`;
    const group = groups.get(key) ?? { assetType: row.assetType, sizeBand: row.sizeBand, values: [] };
    group.values.push(Number(row.multiple));
    groups.set(key, group);
  }

  return Array.from(groups.values())
    .map((g) => ({
      assetType: g.assetType,
      sizeBand: g.sizeBand,
      median: median(g.values),
      n: g.values.length,
      thinData: g.values.length < THIN_DATA_THRESHOLD,
    }))
    .sort((a, b) => a.assetType.localeCompare(b.assetType) || a.sizeBand.localeCompare(b.sizeBand));
}
