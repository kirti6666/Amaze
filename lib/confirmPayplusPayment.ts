import { connectDB } from "@/lib/db";
import { Order, Product, Coupon, User } from "@/models";
import { payplusRequest, matchesPayplusPayment } from "@/lib/payplus";
import { sendOrderEmailWithInvoice } from "@/lib/invoice/email";
import { orderConfirmationEmail } from "@/lib/emailTemplates";

// Both browser reconciliation and signed callbacks use this path. The status
// API is authoritative; neither a redirect nor a client-supplied status is proof.
export async function reconcilePayplusPayment(orderId: string) {
  const db = await connectDB();
  const initial = await Order.findById(orderId);
  if (!initial || initial.paymentMethod !== "payplus") throw new Error("PayPlus order not found");
  if (initial.paymentStatus === "paid" || initial.paymentStatus === "refunded") return initial.paymentStatus;
  const payment = await payplusRequest("status", { merchantOrderId: orderId });
  if (!matchesPayplusPayment(payment, initial)) throw new Error("PayPlus order or amount mismatch");
  if (payment.status !== "success") {
    // Do not persist failure: a delayed success callback can still reconcile.
    return payment.status === "failed" || payment.status === "canceled" ? "failed" : "pending";
  }
  const session = await db.startSession();
  let confirmed: any = null;
  try {
    await session.withTransaction(async () => {
      confirmed = null;
      const order = await Order.findById(orderId).session(session);
      if (!order || order.paymentStatus === "paid" || order.paymentStatus === "refunded") return;
      for (const item of order.items) {
        const product = await Product.findById(item.product).session(session);
        if (!product) continue;
        if (item.variant && product.variants.length) {
          const index = product.variantCombinations.findIndex((c: any) => product.variants.every((v: any) => c.combination.get(v.name) === item.variant.get(v.name)));
          if (index !== -1) await Product.updateOne({ _id: product._id }, { $inc: { [`variantCombinations.${index}.stock`]: -item.quantity } }, { session });
        } else {
          await Product.updateOne({ _id: product._id }, { $inc: { stock: -item.quantity } }, { session });
        }
      }
      if (order.couponCode) await Coupon.updateOne({ code: order.couponCode }, { $inc: { usedCount: 1 } }, { session });
      order.paymentStatus = "paid";
      order.payplusReference = payment.utr || payment.orderId;
      await order.save({ session });
      confirmed = order;
    });
  } finally { await session.endSession(); }
  if (confirmed) {
    try {
      const recipient = confirmed.user ? (await User.findById(confirmed.user))?.email : confirmed.guest?.email;
      if (recipient) await sendOrderEmailWithInvoice({ orderId, to: recipient, subject: `Order Confirmed — #${orderId.slice(-8)}`, html: orderConfirmationEmail(confirmed) });
    } catch (error) { console.error("PayPlus confirmation email failed"); }
  }
  return "paid";
}
