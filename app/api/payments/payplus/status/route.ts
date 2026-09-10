import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models";
import { resolveCheckoutIdentity, guestOwnsOrder } from "@/lib/checkoutIdentity";
import { reconcilePayplusPayment } from "@/lib/confirmPayplusPayment";

export async function POST(req: NextRequest) {
  try {
    const identity = await resolveCheckoutIdentity(req);
    if (!identity) return NextResponse.json({ error: "Please sign in or verify your contact details again." }, { status: 401 });
    const { orderId } = await req.json();
    if (typeof orderId !== "string" || !/^[a-f\d]{24}$/i.test(orderId)) return NextResponse.json({ error: "Invalid order." }, { status: 400 });
    await connectDB();
    const order = await Order.findById(orderId);
    const owns = order && (identity.kind === "user" ? order.user?.toString() === identity.user.id : guestOwnsOrder(order.guest, identity));
    if (!owns || order.paymentMethod !== "payplus") return NextResponse.json({ error: "Order not found." }, { status: 404 });
    const status = await reconcilePayplusPayment(orderId);
    return NextResponse.json({ status });
  } catch {
    return NextResponse.json({ error: "We could not check payment yet. Please try again. If you paid, do not pay again." }, { status: 502 });
  }
}
