// Display-only currency localization: swaps the symbol shown next to a
// plan price based on the visitor's browser locale, but never changes the
// underlying number. Every plan is actually billed in USD (see PayPal plan
// IDs in PlanCatalog.java) -- this is cosmetic, not real FX conversion, so
// unmapped regions fall back to USD rather than guessing.

export type CurrencyInfo = { code: string; symbol: string };

export const DEFAULT_CURRENCY: CurrencyInfo = { code: "USD", symbol: "$" };

const EUR: CurrencyInfo = { code: "EUR", symbol: "€" };

const CURRENCY_BY_REGION: Record<string, CurrencyInfo> = {
  US: DEFAULT_CURRENCY,
  GB: { code: "GBP", symbol: "£" },
  CA: { code: "CAD", symbol: "CA$" },
  AU: { code: "AUD", symbol: "A$" },
  NZ: { code: "NZD", symbol: "NZ$" },
  IN: { code: "INR", symbol: "₹" },
  JP: { code: "JPY", symbol: "¥" },
  SG: { code: "SGD", symbol: "S$" },
  AE: { code: "AED", symbol: "AED " },
  CH: { code: "CHF", symbol: "CHF " },
  // Eurozone
  DE: EUR,
  FR: EUR,
  ES: EUR,
  IT: EUR,
  NL: EUR,
  IE: EUR,
  PT: EUR,
  BE: EUR,
  AT: EUR,
  FI: EUR,
  GR: EUR,
  LU: EUR,
  SK: EUR,
  SI: EUR,
  EE: EUR,
  LV: EUR,
  LT: EUR,
  CY: EUR,
  MT: EUR,
  HR: EUR,
};

export function detectRegion(): string | null {
  if (typeof navigator === "undefined" || !navigator.language) return null;
  try {
    return new Intl.Locale(navigator.language).maximize().region ?? null;
  } catch {
    return null;
  }
}

export function currencyForRegion(region: string | null): CurrencyInfo {
  if (!region) return DEFAULT_CURRENCY;
  return CURRENCY_BY_REGION[region] ?? DEFAULT_CURRENCY;
}
