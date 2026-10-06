import { NextResponse } from "next/server";
import { DISPLAY_CURRENCIES, FALLBACK_RATES } from "@/lib/currencies";

/**
 * Public exchange rates for the storefront currency changer, as units of each
 * display currency per 1 INR. Pulled from the free open.er-api.com feed and
 * cached for 12 hours by Next's fetch cache, so the upstream is hit at most a
 * couple of times a day however busy the store is. Falls back to the rough
 * built-in rates if the feed is down — a slightly stale estimate is better
 * than no prices.
 */
export const revalidate = 43200;

export async function GET() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/INR", { next: { revalidate } });
    if (!res.ok) throw new Error(`rates feed ${res.status}`);
    const data = (await res.json()) as { result?: string; rates?: Record<string, number>; time_last_update_utc?: string };
    if (data.result !== "success" || !data.rates) throw new Error("rates feed returned no rates");

    const rates: Record<string, number> = {};
    for (const { code } of DISPLAY_CURRENCIES) {
      const r = data.rates[code];
      rates[code] = typeof r === "number" && r > 0 ? r : FALLBACK_RATES[code];
    }
    return NextResponse.json({ base: "INR", rates, live: true, updated: data.time_last_update_utc ?? null });
  } catch (err) {
    console.error("Exchange rates unavailable, using fallback:", err);
    return NextResponse.json({ base: "INR", rates: FALLBACK_RATES, live: false, updated: null });
  }
}
