import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createBuyerRequest } from "@/app/actions/buyer-requests";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ASSET_TYPE_LABELS, ASSET_TYPES } from "@/lib/validation/asset";

export const metadata: Metadata = { title: "Buy an Asset" };

export default async function BuyPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-16 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold">Tell us what you&apos;re looking for</h1>
        <p className="text-secondary-foreground">
          e.g. &ldquo;I want a SaaS doing $2k-$10k MRR, under $100k, B2B, low maintenance.&rdquo; We&apos;ll match it against published listings.
        </p>
      </div>
      <form
        action={async (formData: FormData) => {
          "use server";
          const current = await getCurrentUser();
          if (!current) redirect("/login?next=/buy");
          await createBuyerRequest(formData);
        }}
        className="flex flex-col gap-5"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="description">What are you looking for?</Label>
          <Textarea id="description" name="description" rows={5} required minLength={10} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="assetType">Asset type (optional)</Label>
          <select id="assetType" name="assetType" className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm">
            <option value="">Any</option>
            {ASSET_TYPES.map((type) => (
              <option key={type} value={type}>
                {ASSET_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="budgetMin">Budget min</Label>
            <Input id="budgetMin" name="budgetMin" type="number" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="budgetMax">Budget max</Label>
            <Input id="budgetMax" name="budgetMax" type="number" />
          </div>
        </div>
        <Button type="submit" className="self-start">
          {user ? "Find matches" : "Log in to find matches"}
        </Button>
      </form>
    </div>
  );
}
