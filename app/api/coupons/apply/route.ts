import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Coupon } from "@/models";

/**
 * Validates a coupon against the current cart subtotal and returns the
 * discount amount — does NOT increment usedCount here (that only happens
 * once an order is actually placed, in /api/orders). This lets a shopper
 * try/remove a code freely at checkout without "spending" a use.
 */
export async function POST(req: NextRequest) {
  // No auth required. This endpoint only quotes a discount for a code and a
  // subtotal — it reserves nothing and mutates nothing. The authoritative
  // re-validation happens at order creation, so an unauthenticated quote can't
  // be used to obtain a discount that isn't real. Requiring a session here
  // would simply mean guests never see the coupon box work.

  try {
    const body = await req.json();
    const code = String(body.code ?? "").trim().toUpperCase();
    const subtotal = Number(body.subtotal ?? 0);

    if (!code) {
      return NextResponse.json({ error: "Enter a coupon code" }, { status: 400 });
    }

    await connectDB();

    const coupon = await Coupon.findOne({ code });
    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    }
    if (coupon.expiresAt < new Date()) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
    }
    if (subtotal < coupon.minOrderValue) {
      return NextResponse.json(
        { error: `Minimum order value for this coupon is ₹${coupon.minOrderValue}` },
        { status: 400 }
      );
    }

    const discount =
      coupon.discountType === "percent"
        ? Math.round((subtotal * coupon.value) / 100)
        : Math.min(coupon.value, subtotal);

    return NextResponse.json({ code: coupon.code, discount });
  } catch (err) {
    console.error("Apply coupon error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
