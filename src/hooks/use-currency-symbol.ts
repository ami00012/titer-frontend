"use client";

import { useEffect, useState } from "react";
import { convertAmount, currencyForRegion, detectRegion, DEFAULT_CURRENCY, type CurrencyInfo } from "@/lib/currency";

/**
 * Server and first client paint both render USD so hydration matches; the
 * real currency swaps in right after mount. Pass forceDefault when a page
 * (e.g. /pricing, meant as the one stable reference page) should always
 * show USD regardless of visitor locale.
 */
export function useLocalizedCurrency(forceDefault = false): { symbol: string; convert: (amountUsd: number) => number } {
  const [currency, setCurrency] = useState<CurrencyInfo>(DEFAULT_CURRENCY);

  useEffect(() => {
    if (!forceDefault) {
      setCurrency(currencyForRegion(detectRegion()));
    }
  }, [forceDefault]);

  return {
    symbol: currency.symbol,
    convert: (amountUsd: number) => convertAmount(amountUsd, currency.rate),
  };
}
