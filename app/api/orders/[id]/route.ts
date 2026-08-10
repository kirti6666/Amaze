import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order, User } from "@/models";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { requireAdmin } from "@/lib/middleware/requireAdmin";
import { logAdminAction, getClientIp } from "@/lib/middleware/logAdminAction";
import { sendEmail } from "@/lib/email";
import { orderStatusUpdateEmail } from "@/lib/emailTemplates";
import { IOrder } from "@/models/Order";

const VALID_ORDER_STATUSES = ["placed", "processing", "shipped", "delivered", "cancelled"];
const VALID_PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();

    const order = await Order.findById(params.id).lean<IOrder>();
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isOwner = (order as { user: unknown }).user?.toString() === user.id;
    if (!isOwner && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (err) {
    console.error("Get order error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { orderStatus, paymentStatus } = body;

    if (orderStatus && !VALID_ORDER_STATUSES.includes(orderStatus)) {
      return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
    }
    if (paymentStatus && !VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
    }
    if (!orderStatus && !paymentStatus) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findById(params.id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const before = { orderStatus: order.orderStatus, paymentStatus: order.paymentStatus };

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    await order.save();

    await logAdminAction({
      adminId: admin.id,
      action: "ORDER_STATUS_UPDATE",
      targetType: "Order",
      targetId: params.id,
      changes: {
        before,
        after: { orderStatus: order.orderStatus, paymentStatus: order.paymentStatus },
      },
      ipAddress: getClientIp(req),
    });

    // Only notify the customer on an order-status change (shipped/delivered/etc.) —
    // a payment-status-only correction isn't something they need an email about.
    if (orderStatus) {
      const customer = await User.findById(order.user);
      if (customer?.email) {
        sendEmail({
          to: customer.email,
          subject: `Order Update — now "${order.orderStatus}"`,
          html: orderStatusUpdateEmail(order),
        });
      }
    }

    return NextResponse.json({ order });
  } catch (err) {
    console.error("Update order error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
