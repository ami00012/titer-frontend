"use client";

import { useLocalizedCurrency } from "@/hooks/use-currency-symbol";

export function LocalizedPrice({
  amount,
  prefix = "",
  suffix = "",
}: {
  amount: number;
  prefix?: string;
  suffix?: string;
}) {
  const { symbol, convert } = useLocalizedCurrency();
  return (
    <>
      {prefix}
      {symbol}
      {convert(amount)}
      {suffix}
    </>
  );
}
