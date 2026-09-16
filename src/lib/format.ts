export function formatMoney(value: number | string | null | undefined, currency = "USD") {
  if (value === null || value === undefined) return null;
  const amount = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(amount)) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: amount >= 1000 ? 0 : 2,
  }).format(amount);
}

export function formatCompactNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) return null;
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return null;
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(num);
}

export function titleCaseFromEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export const ASSET_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending review",
  PUBLISHED: "Published",
  RESERVED: "Reserved",
  UNDER_OFFER: "Under offer",
  SOLD: "Sold",
  RENTED: "Rented",
  ARCHIVED: "Archived",
};

export const VERIFICATION_LABELS: Record<string, string> = {
  REVENUE_VERIFIED: "Revenue verified",
  TRAFFIC_VERIFIED: "Traffic verified",
  OWNERSHIP_VERIFIED: "Ownership verified",
  CUSTOMERS_VERIFIED: "Customers verified",
  TECHNOLOGY_VERIFIED: "Technology verified",
  IDENTITY_VERIFIED: "Identity verified",
};
