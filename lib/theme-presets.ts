/**
 * Storefront colour presets.
 *
 * Kept in its own module with no imports of its own: the Mongoose schema, the
 * settings defaults, the seed script and the appearance layer all need these
 * values, and lib/site-settings.ts already imports the model, so anything
 * shared has to sit outside that pair to avoid a cycle.
 */

export interface ThemePreset {
  primaryColor: string;
  primaryForeground: string;
  backgroundColor: string;
  surfaceColor: string;
  foregroundColor: string;
  mutedColor: string;
  borderColor: string;
  accentColor: string;
}

/**
 * The Amaze Markets palette, and the default the storefront ships with: a
 * white canvas with rose primary and deep plum text, matching the pink logo
 * and hero artwork. This is the theme the site actually renders, so it is also
 * what the admin Theme tab shows.
 */
export const LIGHT_THEME: ThemePreset = {
  primaryColor: "#B42D55",
  primaryForeground: "#FFFFFF",
  backgroundColor: "#FFFFFF",
  surfaceColor: "#FFF4F6",
  foregroundColor: "#3A0E22",
  mutedColor: "#6E5560",
  borderColor: "#F2DDE3",
  accentColor: "#E85D84",
};

/** Primary of the previous purple Amaze preset; stored copies are upgraded on read. */
const RETIRED_LIGHT_PRIMARY = "#412b6b";

/** True for the dark Tiger preset or the untouched purple Amaze preset — never an admin's own palette. */
export function isRetiredTheme(theme: { backgroundColor: string; primaryColor: string }): boolean {
  return isLegacyDarkTheme(theme) || theme.primaryColor.trim().toLowerCase() === RETIRED_LIGHT_PRIMARY;
}

/**
 * Canvas colour of the retired Tiger preset. Settings documents created before
 * the Amaze redesign still carry it, so it is the marker used to upgrade them
 * to LIGHT_THEME on read. Matching on the canvas alone is deliberate: the old
 * check also required the original crimson primary, so an admin who changed
 * nothing but the accent dropped out of the match and got the near-black
 * canvas back across the whole site.
 */
export const LEGACY_DARK_BACKGROUND = "#0a0a0b";

export function isLegacyDarkTheme(theme: { backgroundColor: string }): boolean {
  return theme.backgroundColor.trim().toLowerCase() === LEGACY_DARK_BACKGROUND;
}
