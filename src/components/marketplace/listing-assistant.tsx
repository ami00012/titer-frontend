"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { generateListingDraft, type ListingDraft } from "@/app/actions/listing-assistant";
import type { AssetTypeValue } from "@/lib/validation/asset";

export function ListingAssistant({
  assetType,
  onDraft,
}: {
  assetType: AssetTypeValue;
  onDraft: (draft: ListingDraft) => void;
}) {
  const [roughDescription, setRoughDescription] = useState("");
  const [pending, startTransition] = useTransition();
  const [hasGenerated, setHasGenerated] = useState(false);

  function handleGenerate() {
    startTransition(async () => {
      try {
        const draft = await generateListingDraft(assetType, roughDescription);
        onDraft(draft);
        setHasGenerated(true);
        toast.success("Draft filled in below — review and edit before submitting.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Couldn't generate a draft");
      }
    });
  }

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <SparklesIcon className="size-4" />
          Describe it in your own words, and we&apos;ll draft the listing
        </div>
        <Textarea
          value={roughDescription}
          onChange={(e) => setRoughDescription(e.target.value)}
          rows={3}
          placeholder="e.g. A Chrome extension that auto-fills expense reports. About 40 users, makes roughly $30/mo. I don't have time to maintain it anymore."
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Only tells us what you actually say — it won&apos;t invent numbers.
            {hasGenerated && " Generating again replaces the fields below."}
          </p>
          <Button type="button" variant="outline" size="sm" disabled={pending} onClick={handleGenerate}>
            {pending ? "Drafting…" : "Draft with AI"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
