import type { AssetTypeValue } from "@/lib/validation/asset";

export interface FormField {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "url";
  required?: boolean;
}

/** Base fields collected for every asset type -- map 1:1 onto Asset's shared columns. */
export const BASE_FIELDS: FormField[] = [
  { name: "title", label: "Name", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea", required: true },
  { name: "price", label: "Asking price", type: "number", required: true },
];

/** Type-specific fields -- map onto Asset.metadata (see src/lib/validation/asset.ts for the matching zod schema). */
export const TYPE_FIELDS: Record<AssetTypeValue, FormField[]> = {
  DIGITAL_BUSINESS: [
    { name: "url", label: "URL", type: "url" },
    { name: "revenue", label: "Revenue", type: "number" },
    { name: "monthlyRevenue", label: "MRR", type: "number" },
    { name: "profit", label: "Profit", type: "number" },
    { name: "customers", label: "Customers", type: "number" },
    { name: "traffic", label: "Traffic", type: "number" },
    { name: "growthRate", label: "Growth (% MoM)", type: "number" },
    { name: "reasonForSelling", label: "Reason for selling", type: "textarea" },
    { name: "techStack", label: "Tech stack", type: "text" },
  ],
  DOMAIN: [
    { name: "domain", label: "Domain", type: "text", required: true },
    { name: "registrar", label: "Registrar", type: "text" },
    { name: "domainAgeYears", label: "Domain age (years)", type: "number" },
    { name: "traffic", label: "Traffic", type: "number" },
    { name: "revenue", label: "Revenue (if applicable)", type: "number" },
  ],
  AI_AGENT: [
    { name: "whatItDoes", label: "What it does", type: "textarea" },
    { name: "urlOrApi", label: "URL / API", type: "text" },
    { name: "customers", label: "Users", type: "number" },
    { name: "revenue", label: "Revenue", type: "number" },
    { name: "modelDependencies", label: "Model dependencies", type: "text" },
    { name: "infrastructure", label: "Infrastructure", type: "text" },
    { name: "documentationUrl", label: "Documentation", type: "url" },
  ],
  DATASET: [
    { name: "sizeDescription", label: "Size", type: "text" },
    { name: "format", label: "Format", type: "text" },
    { name: "domain", label: "Domain", type: "text" },
    { name: "recordCount", label: "Number of records", type: "number" },
    { name: "licensing", label: "Licensing", type: "text" },
    { name: "source", label: "Source", type: "text" },
    { name: "updateFrequency", label: "Update frequency", type: "text" },
  ],
  API: [
    { name: "endpoint", label: "API endpoint", type: "text" },
    { name: "requestsPerMonth", label: "Requests/month", type: "number" },
    { name: "revenue", label: "Revenue", type: "number" },
    { name: "uptimePercent", label: "Uptime (%)", type: "number" },
    { name: "documentationUrl", label: "Documentation", type: "url" },
  ],
  COMPUTE: [
    { name: "gpu", label: "GPU", type: "text" },
    { name: "gpuCount", label: "GPU count", type: "number" },
    { name: "vramGb", label: "VRAM (GB)", type: "number" },
    { name: "cpu", label: "CPU", type: "text" },
    { name: "ramGb", label: "RAM (GB)", type: "number" },
    { name: "storage", label: "Storage", type: "text" },
    { name: "region", label: "Region", type: "text" },
    { name: "availability", label: "Availability", type: "text" },
    { name: "pricePerHour", label: "Price/hour", type: "number" },
    { name: "pricePerDay", label: "Price/day", type: "number" },
    { name: "pricePerMonth", label: "Price/month", type: "number" },
    { name: "networkBandwidth", label: "Network bandwidth", type: "text" },
  ],
};
