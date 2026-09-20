import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ComparableDeleteButton } from "@/components/admin/comparable-delete-button";
import { createComparable } from "@/app/actions/comparables";
import { ACTIVE_ASSET_TYPES, ASSET_TYPE_LABELS } from "@/lib/validation/asset";

export default async function AdminComparablesPage() {
  const comparables = await prisma.comparable.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Comparables (Titer Index)</h1>

      <Card>
        <CardContent>
          <form action={createComparable} className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="assetType" className="text-xs">Category</Label>
              <select id="assetType" name="assetType" className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm" required>
                {ACTIVE_ASSET_TYPES.map((type) => (
                  <option key={type} value={type}>{ASSET_TYPE_LABELS[type]}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="sizeBand" className="text-xs">Size band (e.g. &quot;$0-25k&quot;)</Label>
              <Input id="sizeBand" name="sizeBand" required />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="multiple" className="text-xs">Multiple</Label>
              <Input id="multiple" name="multiple" type="number" step="0.1" required />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="source" className="text-xs">Source</Label>
              <select id="source" name="source" className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm" required>
                <option value="CLOSED_DEAL">Closed Titer deal</option>
                <option value="PUBLIC_COMP">Public comparable</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="dealDate" className="text-xs">Deal date (optional)</Label>
              <Input id="dealDate" name="dealDate" type="date" />
            </div>
            <div className="col-span-full flex flex-col gap-1">
              <Label htmlFor="notes" className="text-xs">Notes</Label>
              <Textarea id="notes" name="notes" rows={2} />
            </div>
            <Button type="submit" size="sm" className="self-start">Add comparable</Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {comparables.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium">
                  {ASSET_TYPE_LABELS[c.assetType as keyof typeof ASSET_TYPE_LABELS]} · {c.sizeBand} · {Number(c.multiple)}x
                </div>
                <div className="text-sm text-secondary-foreground">
                  {c.source === "CLOSED_DEAL" ? "Closed deal" : "Public comp"}
                  {c.dealDate && <> · {c.dealDate.toDateString()}</>}
                  {c.notes && <> · {c.notes}</>}
                </div>
              </div>
              <ComparableDeleteButton id={c.id} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
