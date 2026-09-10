import { NextRequest, NextResponse } from "next/server";
import { verifyPayplusSignature } from "@/lib/payplus";
import { connectDB } from "@/lib/db";
import { Order } from "@/models";
import { reconcilePayplusPayment } from "@/lib/confirmPayplusPayment";

export async function POST(req: NextRequest) {
  const secret = process.env.PAYPLUS_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook unavailable" }, { status: 503 });
  const raw = await req.text();
  if (!verifyPayplusSignature(raw, req.headers.get("x-payplus-signature"), secret)) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  try {
    const event = JSON.parse(raw);
    if (event.event !== "payin.success") return NextResponse.json({ success: true });
    if (event.status !== "success" || typeof event.merchantOrderId !== "string" || !/^[a-f\d]{24}$/i.test(event.merchantOrderId)) return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    await connectDB();
    const order = await Order.findById(event.merchantOrderId);
    if (!order || order.paymentMethod !== "payplus") return NextResponse.json({ success: true });
    if (order.payplusOrderId !== event.orderId) throw new Error("Order mismatch");
    const status = await reconcilePayplusPayment(event.merchantOrderId);
    if (status !== "paid" && status !== "refunded") throw new Error("Payment not yet confirmed");
    return NextResponse.json({ success: true });
  } catch {
    // Non-2xx asks PayPlus to retry rather than silently dropping confirmation.
    return NextResponse.json({ error: "Payment confirmation pending; retry required" }, { status: 503 });
  }
}
