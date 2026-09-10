import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Order } from "@/models";
import { cookies } from "next/headers";
import { getServerUser } from "@/lib/middleware/getServerUser";
import { verifyGuestToken, GUEST_TOKEN_COOKIE } from "@/lib/guestSession";
import { guestOwnsOrder } from "@/lib/checkoutIdentity";
import { IOrder } from "@/models/Order";

export default async function OrderSuccessPage({ params }: { params: { id: string } }) {
  // Access is granted by EITHER an account session or a verified guest token.
  // Redirecting guests to /login here would bounce someone who has just paid
  // straight into a login form they can't satisfy — they have no account.
  const user = await getServerUser();
  const guestToken = cookies().get(GUEST_TOKEN_COOKIE)?.value;
  const guest = guestToken ? await verifyGuestToken(guestToken) : null;

  if (!user && !guest) redirect("/");

  await connectDB();
  const order = await Order.findById(params.id).lean<IOrder>();

  if (!order) notFound();

  const o0 = order as { user?: unknown; guest?: { phone?: string; email?: string } };
  const isOwner = user
    ? o0.user?.toString() === user.id
    : guestOwnsOrder(o0.guest, guest ?? {});

  if (!isOwner && user?.role !== "admin") notFound();

  const o = order as any;
  if (o.paymentMethod === "payplus" && o.paymentStatus === "pending") redirect(`/payment/${params.id}`);

  return (
    <main className="max-w-2xl mx-auto px-6 py-16 text-center">
      <div className="text-5xl mb-4">✓</div>
      <h1 className="text-2xl font-bold mb-2">Order placed successfully!</h1>
      <p className="text-muted mb-8">
        Order ID: <span className="font-mono">{String(o._id)}</span>
      </p>

      <div className="border rounded-md p-6 text-left space-y-4">
        <div>
          <h2 className="font-medium mb-2">Items</h2>
          {o.items.map((item: any, i: number) => (
            <div key={i} className="flex justify-between text-sm py-1">
              <span>
                {item.title} × {item.quantity}
                {item.variant && Object.keys(item.variant).length > 0 && (
                  <span className="text-muted">
                    {" "}
                    ({Object.entries(item.variant)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(", ")})
                  </span>
                )}
              </span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        <div className="border-t pt-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{o.subtotal}</span>
          </div>
          {o.discount > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount {o.couponCode ? `(${o.couponCode})` : ""}</span>
              <span>−₹{o.discount}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{o.shippingFee === 0 ? "Free" : `₹${o.shippingFee}`}</span>
          </div>
          <div className="flex justify-between font-bold border-t pt-1 mt-1">
            <span>Total</span>
            <span>₹{o.total}</span>
          </div>
        </div>

        <div className="border-t pt-3 text-sm">
          <h2 className="font-medium mb-1">Shipping to</h2>
          <p className="text-muted">
            {o.shippingAddress.fullName}, {o.shippingAddress.line1}
            {o.shippingAddress.line2 ? `, ${o.shippingAddress.line2}` : ""},{" "}
            {o.shippingAddress.city}, {o.shippingAddress.state} - {o.shippingAddress.pincode}
          </p>
        </div>

        <div className="border-t pt-3 text-sm">
          <span className="inline-block px-2 py-1 rounded-full bg-surface text-muted text-xs">
            Payment: {o.paymentMethod === "payplus" ? "Online (PayPlus)" : o.paymentMethod === "razorpay" ? "Online (Razorpay)" : "Cash on Delivery"}
          </span>
          <span className="inline-block px-2 py-1 rounded-full bg-success-bg text-success text-xs ml-2">
            {o.paymentStatus === "paid" ? "Payment Confirmed" : "Payment Pending"}
          </span>
          <span className="inline-block px-2 py-1 rounded-full bg-info-bg text-info text-xs ml-2">
            Status: {o.orderStatus}
          </span>
        </div>
      </div>

      <Link href="/shop" className="inline-block mt-8 text-primary underline">
        Continue shopping
      </Link>
    </main>
  );
}
