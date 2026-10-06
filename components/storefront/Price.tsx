"use client";

import { useCurrency } from "@/lib/useCurrency";
import { convert, formatMoney } from "@/lib/currencies";
import { useDisplayCurrency } from "@/store/useDisplayCurrency";

/**
 * A price in the store currency, shown in the shopper's chosen display
 * currency (see CurrencySwitcher). Server render and first paint use the store
 * currency exactly as before; the converted figure swaps in after mount.
 *
 * `symbol` lets server components pass the store symbol they already have, so
 * the first paint never flashes a different symbol.
 */
export function Price({
  amount,
  symbol,
  className,
}: {
  amount: number;
  symbol?: string;
  className?: string;
}) {
  const store = useCurrency();
  const display = useDisplayCurrency();
  const base = store.code;

  let text = `${symbol ?? store.symbol}${amount.toLocaleString("en-IN")}`;
  let approx = false;
  if (display && display.code !== base) {
    const value = convert(amount, base, display.code, display.rates);
    if (value !== null) {
      text = formatMoney(value, display.code);
      approx = true;
    }
  }

  return (
    // notranslate: keep the page translator from rewriting figures.
    <span className={`notranslate ${className ?? ""}`} translate="no" title={approx ? `Approx. — charged as ${symbol ?? store.symbol}${amount.toLocaleString("en-IN")}` : undefined}>
      {approx && <span aria-hidden="true">≈ </span>}
      {text}
    </span>
  );
}

/** "Prices shown in USD are estimates; you'll pay in INR" — shown only when converting. */
export function ChargeCurrencyNote({ className }: { className?: string }) {
  const store = useCurrency();
  const display = useDisplayCurrency();
  if (!display || display.code === store.code) return null;
  return (
    <p className={className ?? "mt-2 text-xs text-muted"}>
      Prices in {display.code} are estimates. Your order will be charged in {store.code}.
    </p>
  );
}
