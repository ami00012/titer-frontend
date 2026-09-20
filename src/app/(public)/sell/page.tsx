import type { Metadata } from "next";
import Link from "next/link";
import { BuildingIcon, BotIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ACTIVE_ASSET_TYPES, ASSET_TYPE_LABELS } from "@/lib/validation/asset";

export const metadata: Metadata = { title: "Sell an Asset" };

const ICONS = {
  DIGITAL_BUSINESS: BuildingIcon,
  AI_AGENT: BotIcon,
} as const;

export default function SellPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold">What are you selling?</h1>
        <p className="text-secondary-foreground">Pick a category to start your listing. It goes to our team for review before it&apos;s published.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {ACTIVE_ASSET_TYPES.map((type) => {
          const Icon = ICONS[type];
          return (
            <Link key={type} href={`/sell/${type.toLowerCase().replace(/_/g, "-")}`}>
              <Card className="h-full transition-colors hover:ring-foreground/20">
                <CardContent className="flex items-center gap-4">
                  <Icon className="size-6 shrink-0" />
                  <span className="font-medium">{ASSET_TYPE_LABELS[type]}</span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
