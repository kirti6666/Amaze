import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware/requireAdmin";
import cloudinary from "@/lib/cloudinary";

/**
 * Returns a signed upload signature so the browser can upload directly to
 * Cloudinary (bypassing our server for the actual file bytes). The API secret
 * never leaves the server — only the signature does, and it's single-use
 * (tied to this exact timestamp + folder combination).
 */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // All three are needed to sign and address an upload. Checking only the
  // secret let a half-filled .env.local through, and the request then failed
  // at Cloudinary with an error the admin never saw.
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const missing = [
    ["CLOUDINARY_CLOUD_NAME", cloudName],
    ["CLOUDINARY_API_KEY", apiKey],
    ["CLOUDINARY_API_SECRET", apiSecret],
  ].filter(([, value]) => !value).map(([key]) => key);
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: `Cloudinary is not configured on the server: ${missing.join(", ")} missing from .env.local` },
      { status: 500 }
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "ecommerce-products";

  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, apiSecret);

  return NextResponse.json({
    signature,
    timestamp,
    folder,
    apiKey,
    cloudName,
  });
}
