import type { Metadata } from "next";
import Link from "next/link";
import { BuildingIcon, GlobeIcon, BotIcon, DatabaseIcon, PlugIcon, CpuIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ASSET_TYPE_LABELS, ASSET_TYPES } from "@/lib/validation/asset";

export const metadata: Metadata = { title: "Sell an Asset" };

const ICONS = {
  DIGITAL_BUSINESS: BuildingIcon,
  DOMAIN: GlobeIcon,
  AI_AGENT: BotIcon,
  DATASET: DatabaseIcon,
  API: PlugIcon,
  COMPUTE: CpuIcon,
} as const;

export default function SellPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold">What are you selling?</h1>
        <p className="text-secondary-foreground">Pick a category to start your listing. It goes to our team for review before it&apos;s published.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {ASSET_TYPES.map((type) => {
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
