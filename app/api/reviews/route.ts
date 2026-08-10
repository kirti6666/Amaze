import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Review, Product } from "@/models";
import { reviewSchema } from "@/lib/validations/review";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { requireAdmin } from "@/lib/middleware/requireAdmin";
import { recomputeProductRatings } from "@/lib/recomputeProductRatings";

// Reads query params / cookies, so it's inherently dynamic — but set explicitly
// so it's never statically pre-rendered into a GET-only asset (which would 405
// non-GET methods in production).
export const dynamic = "force-dynamic";

/**
 * GET /api/reviews
 *   Public:  ?product=<id>&page=&limit=  → approved reviews for one product,
 *            plus a rating summary (average + count + star distribution).
 *   Admin:   ?all=true&status=approved|pending  → every review across the store,
 *            for the moderation screen (requires admin).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Number(searchParams.get("limit") ?? 20));
    const wantsAll = searchParams.get("all") === "true";

    await connectDB();

    // ---- Admin moderation listing ------------------------------------
    if (wantsAll) {
      const admin = await requireAdmin(req);
      if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      const status = searchParams.get("status"); // "approved" | "pending" | null
      const filter: Record<string, unknown> = {};
      if (status === "approved") filter.isApproved = true;
      if (status === "pending") filter.isApproved = false;

      const [reviews, total] = await Promise.all([
        Review.find(filter)
          .populate("user", "name email")
          .populate("product", "title slug")
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Review.countDocuments(filter),
      ]);

      return NextResponse.json({
        reviews,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    }

    // ---- Public per-product listing ----------------------------------
    const product = searchParams.get("product");
    if (!product) {
      return NextResponse.json({ error: "product is required" }, { status: 400 });
    }

    const filter = { product, isApproved: true };

    const [reviews, total, distribution] = await Promise.all([
      Review.find(filter)
        .populate("user", "name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
      Review.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(product), isApproved: true } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
      ]),
    ]);

    // Build a 1..5 star breakdown and the average.
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    for (const d of distribution) {
      counts[d._id] = d.count;
      sum += d._id * d.count;
    }
    const average = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;

    return NextResponse.json({
      reviews,
      summary: { average, count: total, distribution: counts },
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("List reviews error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * POST /api/reviews  (auth) — create or update the caller's review for a product.
 * A user gets exactly one review per product (enforced by a unique index), so we
 * upsert: submitting again edits their existing review rather than erroring.
 */
export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();

    // Guard against reviews for missing/inactive products.
    const productExists = await Product.exists({ _id: parsed.data.product, isActive: true });
    if (!productExists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const review = await Review.findOneAndUpdate(
      { product: parsed.data.product, user: user.id },
      {
        product: parsed.data.product,
        user: user.id,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
        // New/edited reviews are visible by default; admin can hide via moderation.
        isApproved: true,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const { ratingsAverage, ratingsCount } = await recomputeProductRatings(parsed.data.product);

    const populated = await Review.findById(review._id).populate("user", "name").lean();

    return NextResponse.json(
      { review: populated, ratingsAverage, ratingsCount },
      { status: 201 }
    );
  } catch (err: unknown) {
    // Unique-index race: treat a duplicate as a benign already-reviewed case.
    if (typeof err === "object" && err !== null && (err as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "You have already reviewed this product" }, { status: 409 });
    }
    console.error("Create review error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
