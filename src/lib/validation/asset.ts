import { z } from "zod";

/**
 * One shared base (title/description/price + common metrics) maps to Asset's
 * top-level columns, so the marketplace can filter/sort on them without
 * reaching into JSON. Everything else per asset type is type-specific and
 * lives in `Asset.metadata`, validated below -- one table, not six.
 */
export const baseAssetSchema = z.object({
  title: z.string().min(3).max(140),
  description: z.string().min(20).max(5000),
  price: z.coerce.number().positive().optional(),
  currency: z.string().length(3).default("USD"),
  pricingType: z.enum(["FIXED", "NEGOTIABLE", "AUCTION", "MONTHLY", "HOURLY", "USAGE_BASED"]).default("FIXED"),
  revenue: z.coerce.number().nonnegative().optional(),
  monthlyRevenue: z.coerce.number().nonnegative().optional(),
  profit: z.coerce.number().optional(),
  monthlyProfit: z.coerce.number().optional(),
  growthRate: z.coerce.number().optional(),
  customers: z.coerce.number().int().nonnegative().optional(),
  traffic: z.coerce.number().int().nonnegative().optional(),
  category: z.string().optional(),
  businessModel: z.string().optional(),
  founderHoursPerWeek: z.coerce.number().int().nonnegative().optional(),
  // §2.4 -- name/URL/screenshots hidden on render when true; metrics/score stay public.
  confidential: z.coerce.boolean().default(false),
});

export const digitalBusinessMetadataSchema = z.object({
  url: z.string().url().optional(),
  reasonForSelling: z.string().max(2000).optional(),
  techStack: z.string().max(500).optional(),
});

export const domainMetadataSchema = z.object({
  domain: z.string().min(3),
  registrar: z.string().optional(),
  domainAgeYears: z.coerce.number().nonnegative().optional(),
});

export const aiAgentMetadataSchema = z.object({
  whatItDoes: z.string().max(2000).optional(),
  urlOrApi: z.string().optional(),
  modelDependencies: z.string().max(500).optional(),
  infrastructure: z.string().max(500).optional(),
  documentationUrl: z.string().url().optional(),
});

export const datasetMetadataSchema = z.object({
  sizeDescription: z.string().optional(),
  format: z.string().optional(),
  domain: z.string().optional(),
  recordCount: z.coerce.number().int().nonnegative().optional(),
  licensing: z.string().optional(),
  source: z.string().optional(),
  updateFrequency: z.string().optional(),
});

export const apiMetadataSchema = z.object({
  endpoint: z.string().optional(),
  requestsPerMonth: z.coerce.number().int().nonnegative().optional(),
  uptimePercent: z.coerce.number().min(0).max(100).optional(),
  documentationUrl: z.string().url().optional(),
});

export const computeMetadataSchema = z.object({
  gpu: z.string().optional(),
  gpuCount: z.coerce.number().int().nonnegative().optional(),
  vramGb: z.coerce.number().nonnegative().optional(),
  cpu: z.string().optional(),
  ramGb: z.coerce.number().nonnegative().optional(),
  storage: z.string().optional(),
  region: z.string().optional(),
  availability: z.string().optional(),
  pricePerHour: z.coerce.number().nonnegative().optional(),
  pricePerDay: z.coerce.number().nonnegative().optional(),
  pricePerMonth: z.coerce.number().nonnegative().optional(),
  networkBandwidth: z.string().optional(),
});

export const ASSET_TYPES = ["DIGITAL_BUSINESS", "DOMAIN", "AI_AGENT", "DATASET", "API", "COMPUTE"] as const;
export type AssetTypeValue = (typeof ASSET_TYPES)[number];

/**
 * V1 ships two categories deep, not six shallow (see AGENTS spec §1). The other
 * four stay in `ASSET_TYPES`/the Prisma enum -- existing rows and admin/back-end
 * code still work -- they're just hidden from every buyer/seller-facing picker.
 */
export const ACTIVE_ASSET_TYPES = ["DIGITAL_BUSINESS", "AI_AGENT"] as const satisfies readonly AssetTypeValue[];

export const metadataSchemaFor: Record<AssetTypeValue, z.ZodTypeAny> = {
  DIGITAL_BUSINESS: digitalBusinessMetadataSchema,
  DOMAIN: domainMetadataSchema,
  AI_AGENT: aiAgentMetadataSchema,
  DATASET: datasetMetadataSchema,
  API: apiMetadataSchema,
  COMPUTE: computeMetadataSchema,
};

export const ASSET_TYPE_LABELS: Record<AssetTypeValue, string> = {
  DIGITAL_BUSINESS: "Digital Business",
  DOMAIN: "Domain",
  AI_AGENT: "AI Agent",
  DATASET: "Dataset",
  API: "API",
  COMPUTE: "Compute",
};

export function validateAssetSubmission(assetType: AssetTypeValue, input: unknown) {
  const base = baseAssetSchema.parse(input);
  const metadata = metadataSchemaFor[assetType].parse(input);
  // Round-trip through JSON so optional-but-undefined keys are dropped --
  // Prisma's Json column (and its InputJsonValue type) can't hold `undefined`.
  return { base, metadata: JSON.parse(JSON.stringify(metadata)) as Record<string, unknown> };
}
