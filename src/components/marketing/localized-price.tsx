"use client";

import { useCurrencySymbol } from "@/hooks/use-currency-symbol";

export function LocalizedPrice({
  amount,
  prefix = "",
  suffix = "",
}: {
  amount: number;
  prefix?: string;
  suffix?: string;
}) {
  const symbol = useCurrencySymbol();
  return (
    <>
      {prefix}
      {symbol}
      {amount}
      {suffix}
    </>
  );
}
