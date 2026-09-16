"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ASSET_TYPE_LABELS, ASSET_TYPES } from "@/lib/validation/asset";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price", label: "Price" },
  { value: "revenue", label: "Revenue" },
  { value: "growth", label: "Growth" },
];

export function MarketplaceFilters({ lockedAssetType }: { lockedAssetType?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6">
      <Input
        placeholder="Search listings…"
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(e) => setParam("q", e.target.value)}
        className="max-w-sm"
      />
      <div className="flex flex-wrap items-center gap-3 text-sm">
        {!lockedAssetType && (
          <select
            className="rounded-md border border-border bg-background px-3 py-1.5"
            defaultValue={searchParams.get("type") ?? ""}
            onChange={(e) => setParam("type", e.target.value)}
          >
            <option value="">All types</option>
            {ASSET_TYPES.map((type) => (
              <option key={type} value={type}>
                {ASSET_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        )}
        <select
          className="rounded-md border border-border bg-background px-3 py-1.5"
          defaultValue={searchParams.get("verified") ?? ""}
          onChange={(e) => setParam("verified", e.target.value)}
        >
          <option value="">Any verification</option>
          <option value="VERIFIED">Verified only</option>
          <option value="PARTIAL">Partially verified</option>
        </select>
        <Input
          type="number"
          placeholder="Min price"
          className="w-32"
          defaultValue={searchParams.get("priceMin") ?? ""}
          onChange={(e) => setParam("priceMin", e.target.value)}
        />
        <Input
          type="number"
          placeholder="Max price"
          className="w-32"
          defaultValue={searchParams.get("priceMax") ?? ""}
          onChange={(e) => setParam("priceMax", e.target.value)}
        />
        <select
          className="ml-auto rounded-md border border-border bg-background px-3 py-1.5"
          defaultValue={searchParams.get("sort") ?? "newest"}
          onChange={(e) => setParam("sort", e.target.value)}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort: {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
