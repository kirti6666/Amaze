import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Coupon } from "@/models";

// Recomputed per request (depends on "now" and live usage), never cached.
export const dynamic = "force-dynamic";

/**
 * GET /api/coupons/available  (public) — coupons a shopper can actually use
 * right now: active, not expired, and not usage-exhausted. Returns only
 * display-safe fields (no usedCount / internal limits).
 */
export async function GET() {
  try {
    await connectDB();

    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      expiresAt: { $gt: now },
      $expr: {
        // usageLimit 0 = unlimited; otherwise require usedCount < usageLimit.
        $or: [{ $eq: ["$usageLimit", 0] }, { $lt: ["$usedCount", "$usageLimit"] }],
      },
    })
      .select("code discountType value minOrderValue expiresAt")
      .sort({ minOrderValue: 1, value: -1 })
      .lean();

    return NextResponse.json({ coupons });
  } catch (err) {
    console.error("Available coupons error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
