/**
 * Display currencies for the storefront currency changer.
 *
 * This only changes how prices are SHOWN. Orders are always charged in the
 * store's own currency (Site Settings → Commerce, INR by default), so the cart
 * and checkout say so whenever another currency is selected.
 *
 * FALLBACK_RATES are units of each currency per 1 INR, used only when the live
 * rate feed (/api/rates) can't be reached. They're deliberately rough — live
 * rates replace them on every normal page load.
 */
export interface DisplayCurrency {
  code: string;
  label: string;
  locale: string;
}

export const DISPLAY_CURRENCIES: DisplayCurrency[] = [
  { code: "INR", label: "Indian Rupee", locale: "en-IN" },
  { code: "USD", label: "US Dollar", locale: "en-US" },
  { code: "EUR", label: "Euro", locale: "de-DE" },
  { code: "GBP", label: "British Pound", locale: "en-GB" },
  { code: "AED", label: "UAE Dirham", locale: "en-AE" },
  { code: "CAD", label: "Canadian Dollar", locale: "en-CA" },
  { code: "AUD", label: "Australian Dollar", locale: "en-AU" },
  { code: "SGD", label: "Singapore Dollar", locale: "en-SG" },
];

export const FALLBACK_RATES: Record<string, number> = {
  INR: 1,
  USD: 0.0104,
  EUR: 0.0093,
  GBP: 0.0079,
  AED: 0.038,
  CAD: 0.0148,
  AUD: 0.0149,
  SGD: 0.0133,
};

export function getDisplayCurrency(code: string): DisplayCurrency {
  return DISPLAY_CURRENCIES.find((c) => c.code === code) ?? DISPLAY_CURRENCIES[0];
}

/**
 * Converts `amount` from `base` into `target` using INR-based rates. Returns
 * null when either rate is unknown, so callers can fall back to the base price.
 */
export function convert(amount: number, base: string, target: string, rates: Record<string, number>) {
  if (base === target) return amount;
  const from = rates[base];
  const to = rates[target];
  if (!from || !to) return null;
  return (amount / from) * to;
}

export function formatMoney(amount: number, code: string) {
  const { locale } = getDisplayCurrency(code);
  // Whole rupees read naturally; other currencies need their cents.
  const digits = code === "INR" ? 0 : 2;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount);
}
