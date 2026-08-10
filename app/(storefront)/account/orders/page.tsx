import Link from "next/link";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Order } from "@/models";
import { getServerUser } from "@/lib/middleware/getServerUser";

const STATUS_COLORS: Record<string, string> = {
  placed: "bg-surface text-muted",
  processing: "bg-warning-bg text-warning",
  shipped: "bg-info-bg text-info",
  delivered: "bg-success-bg text-success",
  cancelled: "bg-danger-bg text-danger",
};

export const dynamic = "force-dynamic";

export default async function OrderHistoryPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  await connectDB();
  const orders = await Order.find({ user: user.id }).sort({ createdAt: -1 }).lean();

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted mb-4">You haven&apos;t placed any orders yet.</p>
          <Link href="/shop" className="text-primary underline">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={String(order._id)}
              href={`/account/orders/${order._id}`}
              className="block border rounded-md p-4 text-sm hover:shadow-sm transition"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-muted">
                    #{String(order._id).slice(-8)}
                  </p>
                  <p className="text-muted text-xs mt-1">
                    {new Date(order.createdAt as unknown as string).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{order.total}</p>
                  <span
                    className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${
                      STATUS_COLORS[order.orderStatus] ?? "bg-surface"
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </div>
              </div>
              <p className="text-muted mt-2">
                {order.items.map((item: any, i: number) => item.title).join(", ")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
