import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { Order } from "@/models";
import { confirmRazorpayPayment } from "@/lib/confirmRazorpayPayment";
import {
  resolveCheckoutIdentity,
  guestOwnsOrder,
  IDENTITY_REQUIRED_MESSAGE,
} from "@/lib/checkoutIdentity";

export async function POST(req: NextRequest) {
  // Must accept guests. This route runs immediately after money has moved, so
  // rejecting a guest here would take payment and leave the order unconfirmed —
  // stock never decremented, no confirmation, and a customer who has paid.
  const identity = await resolveCheckoutIdentity(req);
  if (!identity) {
    return NextResponse.json({ error: IDENTITY_REQUIRED_MESSAGE }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findById(orderId);

    // Ownership check, per identity type. Guest orders have no `user` at all,
    // so the old `order.user.toString()` threw before it could compare.
    const ownsOrder = order
      ? identity.kind === "user"
        ? order.user?.toString() === identity.user.id
        : guestOwnsOrder(order.guest, identity)
      : false;

    if (!order || !ownsOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.razorpayOrderId !== razorpay_order_id) {
      return NextResponse.json({ error: "Order mismatch" }, { status: 400 });
    }
    if (order.paymentStatus === "paid") {
      // Already confirmed (e.g. the webhook beat this request) — treat as success.
      return NextResponse.json({ success: true, orderId: order._id });
    }

    // The Razorpay-documented verification formula: HMAC-SHA256 of
    // "razorpay_order_id|razorpay_payment_id", keyed with our secret.
    // NEVER trust the client's claim of success without this check server-side.
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(String(razorpay_signature));

    const signaturesMatch =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!signaturesMatch) {
      order.paymentStatus = "failed";
      await order.save();
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    const result = await confirmRazorpayPayment(order._id.toString(), razorpay_payment_id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, orderId: order._id });
  } catch (err) {
    console.error("Razorpay verify error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
