import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AssetForm } from "@/components/marketplace/asset-form";
import { BASE_FIELDS, TYPE_FIELDS } from "@/lib/asset-form-fields";
import { ASSET_TYPE_LABELS, ASSET_TYPES, type AssetTypeValue } from "@/lib/validation/asset";

function slugToType(slug: string): AssetTypeValue | undefined {
  const upper = slug.toUpperCase().replace(/-/g, "_");
  return ASSET_TYPES.find((type) => type === upper);
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  const assetType = slugToType(type);
  return assetType ? { title: `Sell your ${ASSET_TYPE_LABELS[assetType].toLowerCase()}` } : {};
}

export default async function SellTypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const assetType = slugToType(type);
  if (!assetType) notFound();

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/sell/${type}`);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-16 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold">List your {ASSET_TYPE_LABELS[assetType].toLowerCase()}</h1>
        <p className="text-secondary-foreground">Your listing goes to our team for review before it&apos;s published.</p>
      </div>
      <AssetForm assetType={assetType} fields={[...BASE_FIELDS, ...TYPE_FIELDS[assetType]]} />
    </div>
  );
}
