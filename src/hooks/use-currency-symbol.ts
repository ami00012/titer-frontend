"use client";

import { useEffect, useState } from "react";
import { currencyForRegion, detectRegion, DEFAULT_CURRENCY } from "@/lib/currency";

/** Server and first client paint both render "$" so hydration matches; the real symbol swaps in right after mount. */
export function useCurrencySymbol(): string {
  const [symbol, setSymbol] = useState(DEFAULT_CURRENCY.symbol);

  useEffect(() => {
    setSymbol(currencyForRegion(detectRegion()).symbol);
  }, []);

  return symbol;
}
