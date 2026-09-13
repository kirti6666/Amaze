/**
 * Upgrades a stored settings document from the retired dark Tiger palette to
 * the light Amaze palette.
 *
 * The storefront already renders light for these documents — storefrontAppearance()
 * swaps the palette at read time — but the document itself still holds the dark
 * values, so the admin Theme tab shows eight near-black swatches that don't match
 * the live site. This writes the light palette once so the two agree.
 *
 * Safe to run repeatedly: it only touches a document whose canvas is still the
 * legacy ink colour, and leaves any palette an admin has chosen alone.
 *
 * Run with: npm run migrate:theme
 * Requires MONGODB_URI in .env.local
 */

import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import mongoose from "mongoose";
import { SiteSettings } from "../models";
import { LIGHT_THEME, isLegacyDarkTheme } from "../lib/theme-presets";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set in .env.local");

  await mongoose.connect(uri);
  console.log("Connected.");

  const settings = await SiteSettings.findOne({ singletonKey: "site" });
  if (!settings) {
    console.log("No settings document yet — nothing to migrate. New sites get the light palette by default.");
    return;
  }

  const current = settings.theme ?? { backgroundColor: "" };
  if (!isLegacyDarkTheme(current)) {
    console.log(`Canvas is already ${current.backgroundColor} — leaving this palette alone.`);
    return;
  }

  settings.theme = { ...LIGHT_THEME };
  await settings.save();
  console.log("Theme migrated to the light Amaze palette:");
  console.table(LIGHT_THEME);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
