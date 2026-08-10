import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models";
import { requireAuth } from "@/lib/middleware/requireAuth";

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(50, Number(searchParams.get("limit") ?? 20));
    const status = searchParams.get("status");

    // Customers only ever see their own orders; admins can see everything.
    const filter: Record<string, unknown> = user.role === "admin" ? {} : { user: user.id };
    if (status) filter.orderStatus = status;

    let query = Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    // Admins need to see who placed each order; customers already know it's theirs.
    if (user.role === "admin") {
      query = query.populate("user", "name email");
    }

    const [orders, total] = await Promise.all([query.lean(), Order.countDocuments(filter)]);

    return NextResponse.json({
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("List orders error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * Order creation is no longer possible on this route.
 *
 * This handler existed to place Cash on Delivery orders. COD has been removed —
 * the store is prepaid only — so every order is now created inside
 * /api/payments/razorpay/create-order, which builds the order and the Razorpay
 * order together and only marks it paid once the signature is verified.
 *
 * The route is kept (rather than deleted) so that any client still calling it —
 * a stale tab, a cached bundle, a bookmarked API call — gets an explicit,
 * readable refusal instead of a 404 that looks like a deploy went wrong. GET
 * above is unaffected and still lists a customer's orders.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Cash on Delivery is no longer available. Please complete payment online to place your order.",
      code: "COD_DISABLED",
    },
    { status: 410 }
  );
}
