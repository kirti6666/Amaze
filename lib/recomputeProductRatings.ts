import { connectDB } from "@/lib/db";
import { Review, Product } from "@/models";
import mongoose from "mongoose";

/**
 * Recomputes and persists a product's ratingsAverage + ratingsCount from its
 * APPROVED reviews only. Called after any review create/update/moderate/delete
 * so the denormalized fields on Product stay in sync with the source-of-truth
 * Review collection.
 *
 * Kept as a single shared helper (rather than duplicated in each route) so the
 * "approved only" rule and rounding live in exactly one place.
 */
export async function recomputeProductRatings(productId: string): Promise<{
  ratingsAverage: number;
  ratingsCount: number;
}> {
  await connectDB();

  const _id = new mongoose.Types.ObjectId(productId);

  const [agg] = await Review.aggregate([
    { $match: { product: _id, isApproved: true } },
    {
      $group: {
        _id: "$product",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const ratingsCount = agg?.count ?? 0;
  // Round the average to one decimal (e.g. 4.3) for clean display.
  const ratingsAverage = agg ? Math.round(agg.avg * 10) / 10 : 0;

  await Product.findByIdAndUpdate(productId, { ratingsAverage, ratingsCount });

  return { ratingsAverage, ratingsCount };
}
