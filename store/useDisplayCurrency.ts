"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FALLBACK_RATES } from "@/lib/currencies";

/**
 * The shopper's chosen display currency (persisted in localStorage) plus the
 * exchange rates used to convert prices into it. Rates are fetched once per
 * page session from /api/rates and shared by every <Price> on the page.
 */
interface DisplayCurrencyState {
  code: string;
  rates: Record<string, number>;
  setCode: (code: string) => void;
}

export const useDisplayCurrencyStore = create<DisplayCurrencyState>()(
  persist(
    (set) => ({
      code: "INR",
      rates: FALLBACK_RATES,
      setCode: (code) => set({ code }),
    }),
    // Only the choice is persisted; rates always come fresh from the server.
    { name: "display-currency", partialize: (s) => ({ code: s.code }) }
  )
);

let ratesRequested = false;

function loadRates() {
  if (ratesRequested) return;
  ratesRequested = true;
  fetch("/api/rates")
    .then((r) => r.json())
    .then((d) => {
      if (d?.rates) useDisplayCurrencyStore.setState({ rates: d.rates });
    })
    .catch(() => {
      // Keep the fallback rates; allow a retry on the next mount.
      ratesRequested = false;
    });
}

/**
 * Returns the display currency, or null until mounted. Prices render in the
 * store currency during server render and hydration (so markup matches), then
 * switch to the shopper's choice on the client.
 */
export function useDisplayCurrency() {
  const [mounted, setMounted] = useState(false);
  const code = useDisplayCurrencyStore((s) => s.code);
  const rates = useDisplayCurrencyStore((s) => s.rates);

  useEffect(() => {
    setMounted(true);
    if (useDisplayCurrencyStore.getState().code !== "INR") loadRates();
  }, []);

  // Fetch rates as soon as the shopper picks a foreign currency.
  useEffect(() => {
    if (mounted && code !== "INR") loadRates();
  }, [mounted, code]);

  return mounted ? { code, rates } : null;
}
