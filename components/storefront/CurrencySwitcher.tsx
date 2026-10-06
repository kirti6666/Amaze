"use client";

import { useEffect, useState } from "react";
import { DISPLAY_CURRENCIES } from "@/lib/currencies";
import { useDisplayCurrencyStore } from "@/store/useDisplayCurrency";

/** Compact currency picker used in the top bar and the mobile menu. */
export function CurrencySwitcher({ className = "" }: { className?: string }) {
  const code = useDisplayCurrencyStore((s) => s.code);
  const setCode = useDisplayCurrencyStore((s) => s.setCode);
  // The persisted choice only exists in the browser; render INR until mounted.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <label className={`util-select notranslate ${className}`} translate="no">
      <span className="sr-only">Currency</span>
      <select value={mounted ? code : "INR"} onChange={(e) => setCode(e.target.value)} aria-label="Currency">
        {DISPLAY_CURRENCIES.map((c) => (
          <option key={c.code} value={c.code} title={c.label}>
            {c.code}
          </option>
        ))}
      </select>
    </label>
  );
}
