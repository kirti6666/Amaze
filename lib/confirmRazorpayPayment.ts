import { connectDB } from "@/lib/db";
import { Order, Product, Coupon, User } from "@/models";
import { sendEmail } from "@/lib/email";
import { sendOrderEmailWithInvoice } from "@/lib/invoice/email";
import { orderConfirmationEmail } from "@/lib/emailTemplates";

/**
 * Applies the side effects of a CONFIRMED Razorpay payment: decrements stock,
 * increments coupon usage, marks the order paid. Called from both
 * /api/payments/razorpay/verify (the browser callback) and
 * /api/payments/razorpay/webhook (the server-to-server backup path) —
 * idempotent by design, since either one might fire first, or both might fire.
 */
export async function confirmRazorpayPayment(orderId: string, razorpayPaymentId: string) {
  await connectDB();

  const order = await Order.findById(orderId);
  if (!order) return { ok: false as const, error: "Order not found" };
  if (order.paymentMethod !== "razorpay") {
    return { ok: false as const, error: "Not a Razorpay order" };
  }

  // Already processed by the other path (verify vs webhook) — safe no-op.
  if (order.paymentStatus === "paid") {
    return { ok: true as const, order };
  }

  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    if (item.variant && product.variants.length > 0) {
      const idx = product.variantCombinations.findIndex((c: any) =>
        product.variants.every(
          (v: any) => c.combination.get(v.name) === (item.variant as any)?.get?.(v.name)
        )
      );
      if (idx !== -1) {
        await Product.updateOne(
          { _id: product._id },
          { $inc: { [`variantCombinations.${idx}.stock`]: -item.quantity } }
        );
      }
    } else {
      await Product.updateOne({ _id: product._id }, { $inc: { stock: -item.quantity } });
    }
  }

  if (order.couponCode) {
    await Coupon.updateOne({ code: order.couponCode }, { $inc: { usedCount: 1 } });
  }

  order.paymentStatus = "paid";
  order.razorpayPaymentId = razorpayPaymentId;
  await order.save();

  // Send the order-confirmation email exactly once, on the real transition to
  // "paid". This lives here (rather than in the verify route) so it ALSO fires
  // when only the webhook confirms the payment — e.g. the shopper closed the
  // tab right after paying. The early "already paid" return above guarantees
  // the second of the two paths (verify + webhook) won't send a duplicate.
  // Awaited so it completes before the serverless function returns (an
  // un-awaited send can be dropped when the lambda freezes); sendEmail catches
  // its own errors, so this never blocks or breaks payment confirmation.
  try {
    // Account holders are looked up; guests supply an email at checkout (it's
    // optional, so it may legitimately be absent — in which case no email is
    // sent, which is correct rather than an error).
    const recipient = order.user
      ? (await User.findById(order.user))?.email
      : order.guest?.email;

    if (recipient) {
      await sendOrderEmailWithInvoice({
        orderId: order._id.toString(),
        to: recipient,
        subject: `Order Confirmed — #${order._id.toString().slice(-8)}`,
        html: orderConfirmationEmail(order as any),
      });
    }
  } catch (err) {
    console.error("[confirmRazorpayPayment] confirmation email failed:", err);
  }

  return { ok: true as const, order };
}