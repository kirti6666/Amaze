"use client";

import { useEffect, useState } from "react";

/**
 * Reads the store's currency (symbol + code) from Site Settings for use in
 * CLIENT components (cart, product detail, etc.). Server components should call
 * getSiteSettings() directly and pass the symbol down as a prop instead.
 *
 * The fetch is de-duplicated at module scope: no matter how many components call
 * useCurrency() on a page, /api/settings is hit at most once, and the result is
 * cached for the rest of the session. Falls back to ₹ / INR while loading or on
 * error, so prices always render.
 */
export interface Currency {
  symbol: string;
  code: string;
}

const FALLBACK: Currency = { symbol: "₹", code: "INR" };

let cache: Currency | null = null;
let inflight: Promise<Currency> | null = null;

function fetchCurrency(): Promise<Currency> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        cache = {
          symbol: d?.settings?.commerce?.currencySymbol ?? FALLBACK.symbol,
          code: d?.settings?.commerce?.currencyCode ?? FALLBACK.code,
        };
        return cache;
      })
      .catch(() => {
        cache = FALLBACK;
        return cache;
      });
  }
  return inflight;
}

export function useCurrency(): Currency {
  const [currency, setCurrency] = useState<Currency>(cache ?? FALLBACK);

  useEffect(() => {
    let active = true;
    fetchCurrency().then((c) => {
      if (active) setCurrency(c);
    });
    return () => {
      active = false;
    };
  }, []);

  return currency;
}
