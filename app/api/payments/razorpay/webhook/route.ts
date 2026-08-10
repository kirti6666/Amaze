import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { Order } from "@/models";
import { confirmRazorpayPayment } from "@/lib/confirmRazorpayPayment";

/**
 * Server-to-server backup path: Razorpay calls this directly (no user
 * session involved), so it's verified with a separate webhook secret
 * (set in the Razorpay dashboard, NOT the same as RAZORPAY_KEY_SECRET) over
 * the raw request body. This covers the case where a shopper's browser
 * closes/crashes after payment but before our /verify route gets called.
 *
 * Public route — no requireAuth here by design, but every write is gated
 * behind the signature check below.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature || !process.env.RAZORPAY_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(signature);
    const isValid =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);

    if (payload.event === "payment.captured" || payload.event === "order.paid") {
      const payment = payload.payload?.payment?.entity;
      const razorpayOrderId = payment?.order_id;
      const razorpayPaymentId = payment?.id;

      if (razorpayOrderId && razorpayPaymentId) {
        await connectDB();
        const order = await Order.findOne({ razorpayOrderId });
        if (order) {
          await confirmRazorpayPayment(order._id.toString(), razorpayPaymentId);
        }
      }
    }

    // Razorpay expects a fast 200 acknowledgement regardless of what the
    // event was — unhandled event types are simply ignored.
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Razorpay webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
