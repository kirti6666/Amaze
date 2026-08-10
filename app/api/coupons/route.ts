import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Coupon } from "@/models";
import { couponCreateSchema } from "@/lib/validations/coupon";
import { requireAdmin } from "@/lib/middleware/requireAdmin";
import { logAdminAction, getClientIp } from "@/lib/middleware/logAdminAction";

// Always run on the server per request (never statically pre-rendered).
export const dynamic = "force-dynamic";

/**
 * GET /api/coupons  (admin) — every coupon with full details (usage, status),
 * for the admin management screen. Admin-only because it exposes usage limits
 * and inactive/expired codes; the storefront uses /api/coupons/available.
 */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await connectDB();
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ coupons });
  } catch (err) {
    console.error("List coupons error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * POST /api/coupons  (admin) — create a coupon. Codes are unique (uppercased),
 * so a duplicate returns 409.
 */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = couponCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();

    const existing = await Coupon.findOne({ code: parsed.data.code });
    if (existing) {
      return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 409 });
    }

    const coupon = await Coupon.create(parsed.data);

    await logAdminAction({
      adminId: admin.id,
      action: "COUPON_CREATE",
      targetType: "Coupon",
      targetId: coupon._id.toString(),
      changes: {
        after: {
          code: coupon.code,
          discountType: coupon.discountType,
          value: coupon.value,
        },
      },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (err: unknown) {
    // Safety net for the unique index if two creates race.
    if (typeof err === "object" && err !== null && (err as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 409 });
    }
    console.error("Create coupon error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
