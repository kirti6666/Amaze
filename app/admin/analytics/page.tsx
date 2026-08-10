"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IndianRupee, ShoppingBag, Users, Package, Star, AlertTriangle, Wallet, CircleDollarSign, DollarSign, CurrencyIcon } from "lucide-react";
import { AnalyticsSkeleton } from "@/components/ui/Skeleton";
import { useCurrency } from "@/lib/useCurrency";

interface Analytics {
  kpis: {
    revenue: number;
    paidOrders: number;
    totalOrders: number;
    customers: number;
    products: number;
    pendingReviews: number;
  };
  ordersByStatus: Record<string, number>;
  dailySeries: { date: string; revenue: number; orders: number }[];
  topProducts: { productId: string; title: string; units: number; revenue: number }[];
  lowStock: { _id: string; title: string; stock: number; slug: string }[];
  recentOrders: {
    _id: string;
    total: number;
    orderStatus: string;
    paymentMethod: string;
    createdAt: string;
    user?: { name: string; email: string } | null;
  }[];
}

const STATUS_COLORS: Record<string, string> = {
  placed: "bg-gray-400",
  processing: "bg-yellow-400",
  shipped: "bg-blue-400",
  delivered: "bg-green-500",
  cancelled: "bg-red-400",
};

function Kpi({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState("");
  const { symbol: currency } = useCurrency();

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setData(d)))
      .catch(() => setError("Failed to load analytics"));
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return <AnalyticsSkeleton />;

  const { kpis, ordersByStatus, dailySeries, topProducts, lowStock, recentOrders } = data;
  const maxRevenue = Math.max(1, ...dailySeries.map((d) => d.revenue));
  const maxUnits = Math.max(1, ...topProducts.map((p) => p.units));
  const statusTotal = Math.max(1, Object.values(ordersByStatus).reduce((a, b) => a + b, 0));
  // console.log(dailySeries)
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Analytics</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Kpi icon={<Wallet size={14} />} label="Revenue (paid)" value={`${currency}${kpis.revenue.toLocaleString("en-IN")}`} />
        <Kpi icon={<ShoppingBag size={14} />} label="Total orders" value={kpis.totalOrders} />
        <Kpi icon={<ShoppingBag size={14} />} label="Paid orders" value={kpis.paidOrders} />
        <Kpi icon={<Users size={14} />} label="Customers" value={kpis.customers} />
        <Kpi icon={<Package size={14} />} label="Products" value={kpis.products} />
        <Kpi icon={<Star size={14} />} label="Reviews to moderate" value={kpis.pendingReviews} />
      </div>

      {/* Revenue last 30 days */}
      <div className="rounded-lg border p-5">
        <h2 className="font-semibold mb-4">Revenue — last 30 days</h2>
        {dailySeries.every((d) => d.revenue === 0) ? (
          <p className="text-sm text-gray-400">No paid revenue in this window yet.</p>
        ) : (
          <div className="flex items-end gap-1 h-40">
            {dailySeries.map((d) => (
              <div key={d.date} className="flex-1 h-full group relative flex flex-col justify-end">
                <div
                  className="bg-primary/80 rounded-t hover:bg-primary transition-colors"
                  style={{
                    height: `${(d.revenue / maxRevenue) * 100}%`,
                    minHeight: d.revenue > 0 ? 2 : 0,
                  }}
                />
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap bg-black text-white text-[10px] rounded px-1.5 py-0.5 z-10">
                  {d.date.slice(5)}: {currency}{d.revenue.toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Orders by status */}
        <div className="rounded-lg border p-5">
          <h2 className="font-semibold mb-4">Orders by status</h2>
          <div className="space-y-2">
            {["placed", "processing", "shipped", "delivered", "cancelled"].map((s) => {
              const count = ordersByStatus[s] ?? 0;
              return (
                <div key={s} className="flex items-center gap-3 text-sm">
                  <span className="w-20 capitalize text-gray-500">{s}</span>
                  <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full ${STATUS_COLORS[s]}`}
                      style={{ width: `${(count / statusTotal) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-gray-600">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top products */}
        <div className="rounded-lg border p-5">
          <h2 className="font-semibold mb-4">Top products (by units sold)</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-gray-400">No sales yet.</p>
          ) : (
            <div className="space-y-2">
              {topProducts.map((p) => (
                <div key={p.productId} className="flex items-center gap-3 text-sm">
                  <span className="flex-1 truncate" title={p.title}>
                    {p.title}
                  </span>
                  <div className="w-24 h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full bg-primary/70" style={{ width: `${(p.units / maxUnits) * 100}%` }} />
                  </div>
                  <span className="w-8 text-right text-gray-600">{p.units}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Low stock */}
        <div className="rounded-lg border p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-yellow-500" /> Low stock (≤ 5)
          </h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-gray-400">Everything is well stocked.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {lowStock.map((p) => (
                <li key={p._id} className="flex justify-between">
                  <Link href={`/product/${p.slug}`} className="truncate hover:underline">
                    {p.title}
                  </Link>
                  <span className={p.stock === 0 ? "text-red-600 font-medium" : "text-yellow-700"}>
                    {p.stock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent orders */}
        <div className="rounded-lg border p-5">
          <h2 className="font-semibold mb-4">Recent orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400">No orders yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {recentOrders.map((o) => (
                <li key={o._id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{o.user?.name ?? "Unknown"}</p>
                    <p className="text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{currency}{o.total}</p>
                    <p className="text-gray-400 text-xs capitalize">{o.orderStatus}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
