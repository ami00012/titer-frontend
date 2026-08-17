// Display-only currency localization: shows an approximate local-currency
// price based on the visitor's browser locale. Billing itself always runs
// in USD (see PayPal plan IDs in PlanCatalog.java) -- these are static,
// illustrative conversion rates for display purposes only, not a live FX
// feed, and get stale over time. Good enough to avoid a nonsense sticker
// price (e.g. showing "9" for a currency worth ~80x less per unit than
// USD), not precise enough to bill against.

export type CurrencyInfo = { code: string; symbol: string; rate: number };

export const DEFAULT_CURRENCY: CurrencyInfo = { code: "USD", symbol: "$", rate: 1 };

const EUR: CurrencyInfo = { code: "EUR", symbol: "€", rate: 0.92 };

const CURRENCY_BY_REGION: Record<string, CurrencyInfo> = {
  US: DEFAULT_CURRENCY,
  GB: { code: "GBP", symbol: "£", rate: 0.79 },
  CA: { code: "CAD", symbol: "CA$", rate: 1.37 },
  AU: { code: "AUD", symbol: "A$", rate: 1.53 },
  NZ: { code: "NZD", symbol: "NZ$", rate: 1.66 },
  IN: { code: "INR", symbol: "₹", rate: 83 },
  JP: { code: "JPY", symbol: "¥", rate: 150 },
  SG: { code: "SGD", symbol: "S$", rate: 1.34 },
  AE: { code: "AED", symbol: "AED ", rate: 3.67 },
  CH: { code: "CHF", symbol: "CHF ", rate: 0.88 },
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

/**
 * Converts a USD amount to the target currency and rounds to a "clean"
 * sticker price instead of showing raw FX-converted cents. $0 always stays
 * 0 (free tier, no currency to convert).
 */
export function convertAmount(amountUsd: number, rate: number): number {
  if (amountUsd === 0) return 0;
  const converted = amountUsd * rate;
  if (converted >= 1000) return Math.round(converted / 100) * 100;
  if (converted >= 100) return Math.round(converted / 10) * 10;
  return Math.round(converted);
}
