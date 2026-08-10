import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Coupon } from "@/models";
import { couponUpdateSchema } from "@/lib/validations/coupon";
import { requireAdmin } from "@/lib/middleware/requireAdmin";
import { logAdminAction, getClientIp } from "@/lib/middleware/logAdminAction";

export const dynamic = "force-dynamic";

/** GET /api/coupons/[id]  (admin) — one coupon. */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await connectDB();
    const coupon = await Coupon.findById(params.id).lean();
    if (!coupon) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    return NextResponse.json({ coupon });
  } catch (err) {
    console.error("Get coupon error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * PUT /api/coupons/[id]  (admin) — update any subset of fields. If the code
 * changes, uniqueness is re-checked against OTHER coupons.
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = couponUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();

    const before = await Coupon.findById(params.id);
    if (!before) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });

    if (parsed.data.code && parsed.data.code !== before.code) {
      const clash = await Coupon.findOne({ code: parsed.data.code, _id: { $ne: params.id } });
      if (clash) {
        return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 409 });
      }
    }

    const coupon = await Coupon.findByIdAndUpdate(params.id, parsed.data, { new: true });

    await logAdminAction({
      adminId: admin.id,
      action: "COUPON_UPDATE",
      targetType: "Coupon",
      targetId: params.id,
      changes: { updatedFields: parsed.data },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ coupon });
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && (err as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 409 });
    }
    console.error("Update coupon error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

/** DELETE /api/coupons/[id]  (admin). */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await connectDB();
    const coupon = await Coupon.findByIdAndDelete(params.id);
    if (!coupon) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });

    await logAdminAction({
      adminId: admin.id,
      action: "COUPON_DELETE",
      targetType: "Coupon",
      targetId: params.id,
      changes: { deleted: { code: coupon.code } },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete coupon error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
