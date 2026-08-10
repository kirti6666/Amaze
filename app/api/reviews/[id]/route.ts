import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Review } from "@/models";
import { requireAdmin } from "@/lib/middleware/requireAdmin";
import { logAdminAction, getClientIp } from "@/lib/middleware/logAdminAction";
import { recomputeProductRatings } from "@/lib/recomputeProductRatings";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/reviews/[id]  (admin) — approve or hide a review.
 * Body: { isApproved: boolean }. Recomputes the product's rating afterwards,
 * since hiding/showing a review changes the approved-only average.
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    if (typeof body.isApproved !== "boolean") {
      return NextResponse.json({ error: "isApproved (boolean) is required" }, { status: 400 });
    }

    await connectDB();

    const review = await Review.findById(params.id);
    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    const before = review.isApproved;
    review.isApproved = body.isApproved;
    await review.save();

    const { ratingsAverage, ratingsCount } = await recomputeProductRatings(
      review.product.toString()
    );

    await logAdminAction({
      adminId: admin.id,
      action: "REVIEW_MODERATE",
      targetType: "Review",
      targetId: review._id.toString(),
      changes: { before: { isApproved: before }, after: { isApproved: review.isApproved } },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ review, ratingsAverage, ratingsCount });
  } catch (err) {
    console.error("Moderate review error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * DELETE /api/reviews/[id]  (admin) — permanently remove a review, then
 * recompute the product's rating.
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await connectDB();

    const review = await Review.findByIdAndDelete(params.id);
    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    const { ratingsAverage, ratingsCount } = await recomputeProductRatings(
      review.product.toString()
    );

    await logAdminAction({
      adminId: admin.id,
      action: "REVIEW_MODERATE",
      targetType: "Review",
      targetId: review._id.toString(),
      changes: { deleted: { rating: review.rating, comment: review.comment } },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, ratingsAverage, ratingsCount });
  } catch (err) {
    console.error("Delete review error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
