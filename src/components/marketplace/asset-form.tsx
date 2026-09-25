"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createAsset } from "@/app/actions/assets";
import type { FormField } from "@/lib/asset-form-fields";
import type { AssetTypeValue } from "@/lib/validation/asset";

export function AssetForm({
  assetType,
  fields,
  initialValues,
}: {
  assetType: AssetTypeValue;
  fields: FormField[];
  /** AI-drafted prefill (see ListingAssistant) -- a starting point the
   * seller can edit, never submitted as-is. Keyed by a version stamp on the
   * <form> below so a new draft remounts the inputs with fresh defaults
   * instead of fighting values the seller may have already edited. */
  initialValues?: Record<string, string | number | boolean>;
}) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createAsset(assetType, formData);
      } catch (err) {
        // createAsset redirect()s on success, which throws internally with a
        // "NEXT_REDIRECT" digest -- let that propagate so Next can navigate;
        // only actual validation/DB failures should show a toast.
        if (err && typeof err === "object" && "digest" in err && String(err.digest).startsWith("NEXT_REDIRECT")) {
          throw err;
        }
        toast.error(err instanceof Error ? err.message : "Couldn't submit this listing");
      }
    });
  }

  return (
    <form
      key={initialValues ? JSON.stringify(initialValues) : "blank"}
      action={handleSubmit}
      className="flex flex-col gap-5"
    >
      {fields.map((field) => {
        const prefill = initialValues?.[field.name];
        return field.type === "checkbox" ? (
          <label key={field.name} className="flex items-start gap-2 text-sm">
            <input
              id={field.name}
              name={field.name}
              type="checkbox"
              className="mt-1"
              defaultChecked={typeof prefill === "boolean" ? prefill : undefined}
            />
            {field.label}
          </label>
        ) : (
          <div key={field.name} className="flex flex-col gap-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-destructive"> *</span>}
            </Label>
            {field.type === "textarea" ? (
              <Textarea
                id={field.name}
                name={field.name}
                required={field.required}
                rows={4}
                defaultValue={prefill !== undefined ? String(prefill) : undefined}
              />
            ) : (
              <Input
                id={field.name}
                name={field.name}
                type={field.type}
                required={field.required}
                defaultValue={prefill !== undefined ? String(prefill) : undefined}
              />
            )}
          </div>
        );
      })}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Submitting…" : "Submit for review"}
      </Button>
    </form>
  );
}
