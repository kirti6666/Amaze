import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { requireAuth } from "@/lib/middleware/requireAuth";

export const dynamic = "force-dynamic";

/**
 * GET /api/wishlist  (auth)
 *   ?ids=true  → just the array of product ids (lightweight; used by the heart
 *                buttons to know which products are already saved).
 *   default    → the user's wishlisted products, populated for card rendering.
 */
export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();

    const idsOnly = new URL(req.url).searchParams.get("ids") === "true";

    if (idsOnly) {
      const doc = await User.findById(user.id).select("wishlist").lean<{ wishlist: unknown[] }>();
      const ids = (doc?.wishlist ?? []).map((id) => String(id));
      return NextResponse.json({ ids });
    }

    const doc = await User.findById(user.id)
      .select("wishlist")
      .populate({
        path: "wishlist",
        // Only surface products that still exist and are active.
        match: { isActive: true },
        select: "title slug price discountPrice images category ratingsAverage ratingsCount",
        populate: { path: "category", select: "name slug" },
      })
      .lean<{ wishlist: unknown[] }>();

    return NextResponse.json({ products: doc?.wishlist ?? [] });
  } catch (err) {
    console.error("Get wishlist error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * POST /api/wishlist  (auth) — add a product. Body: { productId }.
 * $addToSet keeps it idempotent (adding twice is a no-op).
 */
export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    await connectDB();
    await User.findByIdAndUpdate(user.id, { $addToSet: { wishlist: productId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Add to wishlist error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * DELETE /api/wishlist?product=<id>  (auth) — remove a product from the wishlist.
 */
export async function DELETE(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const productId = new URL(req.url).searchParams.get("product");
    if (!productId) {
      return NextResponse.json({ error: "product is required" }, { status: 400 });
    }

    await connectDB();
    await User.findByIdAndUpdate(user.id, { $pull: { wishlist: productId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Remove from wishlist error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
