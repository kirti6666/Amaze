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

  if (!process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json(
      { error: "Cloudinary is not configured on the server yet" },
      { status: 500 }
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "ecommerce-products";

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET
  );

  return NextResponse.json({
    signature,
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
}
