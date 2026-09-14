/**
 * Diagnoses Cloudinary configuration without uploading anything.
 *
 * The admin upload button failing tells you nothing about which of the three
 * credentials is wrong. This reads .env.local, reports what it found (masked),
 * flags the copy-paste mistakes that account for most failures, then calls
 * Cloudinary's Admin API ping endpoint, which validates cloud name, key and
 * secret together and names what it rejected.
 *
 * Nothing is printed in full: keys are masked and the secret is never shown.
 *
 * Run with: npm run check:cloudinary
 */

import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const VARS = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"] as const;

function mask(value: string): string {
  if (value.length <= 4) return "*".repeat(value.length);
  return value.slice(0, 2) + "*".repeat(Math.max(4, value.length - 4)) + value.slice(-2);
}

/** The mistakes that survive a careless copy out of the Cloudinary dashboard. */
function complaints(name: string, raw: string): string[] {
  const out: string[] = [];
  if (raw !== raw.trim()) out.push("has leading or trailing whitespace");
  const v = raw.trim();
  if (/^["'].*["']$/.test(v)) out.push("is wrapped in quotes — .env values must be bare");
  if (v.includes(" ")) out.push("contains a space");
  if (/^(your|xxx|changeme|<.*>)/i.test(v)) out.push("still looks like a placeholder");
  if (name === "CLOUDINARY_CLOUD_NAME" && v.includes("://")) out.push("should be just the cloud name, not a URL");
  if (name === "CLOUDINARY_API_KEY" && !/^\d+$/.test(v)) out.push("should be all digits");
  return out;
}

async function main() {
  console.log("Reading .env.local\n");

  const values: Record<string, string> = {};
  let blocked = false;

  for (const name of VARS) {
    const raw = process.env[name];
    if (!raw) {
      console.log(`  ${name}: MISSING`);
      blocked = true;
      continue;
    }
    values[name] = raw.trim().replace(/^["']|["']$/g, "");
    const issues = complaints(name, raw);
    const shown = name === "CLOUDINARY_API_SECRET" ? "(set, hidden)" : mask(values[name]);
    console.log(`  ${name}: ${shown}${issues.length ? "  <-- " + issues.join("; ") : ""}`);
    if (issues.length) blocked = true;
  }

  if (blocked) {
    console.log("\nFix the entries above, restart the dev server, then run this again.");
    console.log("Next.js only reads .env.local at startup — editing it while the server runs changes nothing.");
    return;
  }

  const { CLOUDINARY_CLOUD_NAME: cloud, CLOUDINARY_API_KEY: key, CLOUDINARY_API_SECRET: secret } = values;
  const auth = Buffer.from(`${key}:${secret}`).toString("base64");

  console.log(`\nPinging Cloudinary as cloud "${cloud}"...`);
  let res: Response;
  try {
    res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/ping`, {
      headers: { Authorization: `Basic ${auth}` },
    });
  } catch (err) {
    console.log(`  Could not reach api.cloudinary.com: ${(err as Error).message}`);
    console.log("  That is a network/proxy problem, not a credentials problem.");
    return;
  }

  const body = await res.json().catch(() => ({}) as Record<string, unknown>);

  if (res.ok) {
    console.log("  OK — all three credentials are valid.");
    console.log("  If the admin upload still fails, the problem is in the browser, not the config:");
    console.log("  open devtools, retry the upload, and read the message on the POST to api.cloudinary.com.");
    return;
  }

  const detail = (body as { error?: { message?: string } }).error?.message;
  console.log(`  Rejected (HTTP ${res.status})${detail ? ": " + detail : " with no message"}`);
  if (res.status === 401) console.log("  401 means the API key and secret pair is wrong.");
  if (res.status === 404) console.log(`  404 means the cloud name "${cloud}" does not exist.`);
  if (res.status === 403 && !detail) {
    console.log("  A 403 with no message usually is not Cloudinary — check whether a corporate");
    console.log("  proxy, VPN or firewall is intercepting requests to api.cloudinary.com.");
  }
  process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
