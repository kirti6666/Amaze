import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Download } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Order } from "@/models";
import { getServerUser } from "@/lib/middleware/getServerUser";

const STEPS = ["placed", "processing", "shipped", "delivered"];

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const user = await getServerUser();
  if (!user) redirect("/login");

  await connectDB();
  const order = await Order.findById(params.id).lean();

  if (!order) notFound();
  const o = order as any;
  const isOwner = o.user?.toString() === user.id;
  if (!isOwner && user.role !== "admin") notFound();

  const isCancelled = o.orderStatus === "cancelled";
  const currentStepIndex = STEPS.indexOf(o.orderStatus);

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/account/orders" className="text-sm text-primary underline">
        ← Back to orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3 mt-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Order Details</h1>
          <p className="text-muted text-sm font-mono">#{String(o._id)}</p>
        </div>
        {/* Issues the tax invoice on first open, then always serves the same
            numbered document. Opens in a new tab so the order page is kept. */}
        <a
          href={`/api/invoices/${String(o._id)}?download=1`}
          className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-surface"
        >
          <Download size={15} /> Download Invoice
        </a>
      </div>

      {isCancelled ? (
        <div className="bg-danger-bg text-danger rounded-md p-3 text-sm mb-6">
          This order was cancelled.
        </div>
      ) : (
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((step, i) => (
            <div key={step} className="flex-1 flex flex-col items-center text-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  i <= currentStepIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-muted"
                }`}
              >
                {i + 1}
              </div>
              <span className="text-xs mt-1 capitalize text-muted">{step}</span>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-full mt-4 -translate-y-4 ${
                    i < currentStepIndex ? "bg-primary" : "bg-hairline"
                  }`}
                  style={{ marginLeft: "50%" }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="border rounded-md p-6 space-y-4">
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
            {o.paymentMethod === "payplus" ? "Online (PayPlus)" : o.paymentMethod === "razorpay" ? "Online (Razorpay)" : "Cash on Delivery"}
          </span>
          <span className="inline-block px-2 py-1 rounded-full bg-success-bg text-success text-xs ml-2">
            {o.paymentStatus === "paid" ? "Payment Confirmed" : `Payment ${o.paymentStatus}`}
          </span>
        </div>
      </div>
    </main>
  );
}
