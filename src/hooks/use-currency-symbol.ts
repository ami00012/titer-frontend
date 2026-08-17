"use client";

import { useEffect, useState } from "react";
import { convertAmount, currencyForRegion, detectRegion, DEFAULT_CURRENCY, type CurrencyInfo } from "@/lib/currency";

/** Server and first client paint both render USD so hydration matches; the real currency swaps in right after mount. */
export function useLocalizedCurrency(): { symbol: string; convert: (amountUsd: number) => number } {
  const [currency, setCurrency] = useState<CurrencyInfo>(DEFAULT_CURRENCY);

  useEffect(() => {
    setCurrency(currencyForRegion(detectRegion()));
  }, []);

  return {
    symbol: currency.symbol,
    convert: (amountUsd: number) => convertAmount(amountUsd, currency.rate),
  };
}
