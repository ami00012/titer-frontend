"use client";

import { useState } from "react";
import { AssetForm } from "@/components/marketplace/asset-form";
import { ListingAssistant } from "@/components/marketplace/listing-assistant";
import type { ListingDraft } from "@/app/actions/listing-assistant";
import type { FormField } from "@/lib/asset-form-fields";
import type { AssetTypeValue } from "@/lib/validation/asset";

export function SellFormWithAssistant({
  assetType,
  fields,
  aiAssistEnabled,
}: {
  assetType: AssetTypeValue;
  fields: FormField[];
  aiAssistEnabled: boolean;
}) {
  const [draft, setDraft] = useState<ListingDraft | undefined>(undefined);

  return (
    <div className="flex flex-col gap-6">
      {aiAssistEnabled && <ListingAssistant assetType={assetType} onDraft={setDraft} />}
      <AssetForm assetType={assetType} fields={fields} initialValues={draft} />
    </div>
  );
}
