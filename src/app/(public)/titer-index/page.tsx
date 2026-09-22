import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { computeMedians, THIN_DATA_THRESHOLD } from "@/lib/index-medians";
import { ASSET_TYPE_LABELS, type AssetTypeValue } from "@/lib/validation/asset";

export const metadata: Metadata = {
  title: "Titer Index",
  description: "Median deal multiples by category and size band, from closed Titer deals and public comparables.",
};

export default async function TiterIndexPage() {
  const comparables = await prisma.comparable.findMany({ orderBy: { createdAt: "desc" } });
  const medians = computeMedians(comparables);
  const lastUpdated = comparables[0]?.createdAt ?? null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold">Titer Index</h1>
        <p className="text-secondary-foreground">
          Median multiple by category and size band, from closed Titer deals and manually entered public
          comparables. Updated as new comps come in.
          {lastUpdated && <> Last updated {lastUpdated.toDateString()}.</>}
        </p>
      </div>

      {medians.length === 0 ? (
        <p className="text-secondary-foreground">
          No comparables entered yet — check back once the first deals close. In the meantime, see the{" "}
          <a href="/mandates" className="underline">
            mandate board
          </a>{" "}
          for active demand.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {medians.map((row) => (
            <Card key={`${row.assetType}-${row.sizeBand}`}>
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium">
                    {ASSET_TYPE_LABELS[row.assetType as AssetTypeValue]} · {row.sizeBand}
                  </div>
                  <div className="text-sm text-secondary-foreground">
                    n={row.n}
                    {row.thinData && <span className="ml-2 text-amber-600 dark:text-amber-400">Thin data (n&lt;{THIN_DATA_THRESHOLD})</span>}
                  </div>
                </div>
                <div className="text-xl font-semibold">{row.median.toFixed(1)}x</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-sm text-secondary-foreground">
        Methodology: median of revenue multiples for closed deals and publicly reported comparables, grouped by
        asset category and deal size band. See <a href="/methodology" className="underline">/methodology</a> for the
        Titer Score rubric these listings are also measured against.
      </p>
    </div>
  );
}
