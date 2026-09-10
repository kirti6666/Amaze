"use client";

import { useEffect, useState } from "react";
import { CardListSkeleton } from "@/components/ui/Skeleton";
import { useCurrency } from "@/lib/useCurrency";
import { symbol } from "zod/v4";


interface OrderItem {
  title: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  user: { name: string; email: string } | null;
  // Guest orders carry contact details inline instead of a user reference.
  guest?: { name?: string; phone?: string; email?: string } | null;
  isGuest?: boolean;
  items: OrderItem[];
  total: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
}

const ORDER_STATUSES = ["placed", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

const STATUS_COLORS: Record<string, string> = {
  placed: "bg-gray-100 text-gray-600",
  processing: "bg-yellow-100 text-yellow-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const { symbol: currency } = useCurrency();

  async function loadOrders() {
    setLoading(true);
    const params = new URLSearchParams({ limit: "100" });
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/orders?${params.toString()}`);
    const data = await res.json();
    setOrders(data.orders ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function updateStatus(id: string, field: "orderStatus" | "paymentStatus", value: string) {
    setSavingId(id);
    await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    await loadOrders();
    setSavingId(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <CardListSkeleton count={5} />
      ) : orders.length === 0 ? (
        <p className="text-gray-400">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order._id} className="border rounded-md p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-gray-400">#{order._id.slice(-8)}</p>
                  <p className="font-medium">
                    {order.user?.name ?? order.guest?.name ?? "Unknown"}
                    {!order.user && (
                      <span className="ml-2 rounded bg-gray-200 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-gray-700">
                        Guest
                      </span>
                    )}
                  </p>
                  <p className="text-gray-500">
                    {order.user?.email ?? order.guest?.email ?? order.guest?.phone}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold">{currency}{order.total}</p>
                  <p className="text-gray-400 text-xs">
                    {order.paymentMethod === "payplus" ? "PayPlus" : order.paymentMethod === "razorpay" ? "Razorpay" : "COD"}
                  </p>
                  <a
                    href={`/api/invoices/${order._id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary underline mt-1 inline-block"
                  >
                    Invoice
                  </a>
                </div>
              </div>

              <div className="mt-2 text-gray-500">
                {order.items.map((item, i) => (
                  <span key={i}>
                    {item.title} × {item.quantity}
                    {i < order.items.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[order.orderStatus] ?? "bg-gray-100"}`}
                >
                  {order.orderStatus}
                </span>

                <select
                  value={order.orderStatus}
                  disabled={savingId === order._id}
                  onChange={(e) => updateStatus(order._id, "orderStatus", e.target.value)}
                  className="rounded-md border px-2 py-1 text-xs"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <select
                  value={order.paymentStatus}
                  disabled={savingId === order._id}
                  onChange={(e) => updateStatus(order._id, "paymentStatus", e.target.value)}
                  className="rounded-md border px-2 py-1 text-xs"
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      payment: {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
