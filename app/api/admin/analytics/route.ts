import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order, Product, User, Review } from "@/models";
import { requireAdmin } from "@/lib/middleware/requireAdmin";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/analytics  (admin) — dashboard metrics.
 *
 * "Revenue" counts orders whose payment has actually been captured
 * (paymentStatus = "paid"); COD orders that are still pending payment are
 * excluded so the number reflects real money in, not just orders placed.
 */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await connectDB();

    const now = new Date();
    const since = new Date(now);
    since.setDate(since.getDate() - 29); // 30-day window (inclusive)
    since.setHours(0, 0, 0, 0);

    const [
      revenueAgg,
      totalOrders,
      ordersByStatusAgg,
      dailyRevenueAgg,
      topProductsAgg,
      customerCount,
      productCount,
      pendingReviews,
      lowStock,
      recentOrders,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),
      Order.countDocuments({}),
      Order.aggregate([{ $group: { _id: "$orderStatus", count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { paymentStatus: "paid", createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            title: { $first: "$items.title" },
            units: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          },
        },
        { $sort: { units: -1 } },
        { $limit: 5 },
      ]),
      User.countDocuments({ role: "customer" }),
      Product.countDocuments({}),
      Review.countDocuments({ isApproved: false }),
      Product.find({ variants: { $size: 0 }, stock: { $lte: 5 }, isActive: true })
        .select("title stock slug")
        .sort({ stock: 1 })
        .limit(10)
        .lean(),
      Order.find({})
        .populate("user", "name email")
        .select("total orderStatus paymentStatus paymentMethod createdAt user")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // Fill the daily series so every day in the window has a bar (even zeros).
    const revenueByDay = new Map<string, { revenue: number; orders: number }>();
    for (const d of dailyRevenueAgg) {
      revenueByDay.set(d._id, { revenue: d.revenue, orders: d.orders });
    }
    const dailySeries: { date: string; revenue: number; orders: number }[] = [];
    for (let i = 0; i < 30; i++) {
      const day = new Date(since);
      day.setDate(since.getDate() + i);
      const key = day.toISOString().slice(0, 10);
      const entry = revenueByDay.get(key) ?? { revenue: 0, orders: 0 };
      dailySeries.push({ date: key, ...entry });
    }

    const ordersByStatus: Record<string, number> = {};
    for (const s of ordersByStatusAgg) ordersByStatus[s._id] = s.count;

    return NextResponse.json({
      kpis: {
        revenue: revenueAgg[0]?.total ?? 0,
        paidOrders: revenueAgg[0]?.count ?? 0,
        totalOrders,
        customers: customerCount,
        products: productCount,
        pendingReviews,
      },
      ordersByStatus,
      dailySeries,
      topProducts: topProductsAgg.map((p) => ({
        productId: String(p._id),
        title: p.title,
        units: p.units,
        revenue: p.revenue,
      })),
      lowStock,
      recentOrders,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
