import Link from "next/link";
import {
  IndianRupee,
  ShoppingBag,
  Users,
  Package,
  Star,
  AlertTriangle,
  FolderTree,
  Settings as SettingsIcon,
  BarChart3,
  ScrollText,
  ArrowRight,
  Wallet,
  Ticket,
  FileText,
} from "lucide-react";
import { getServerUser } from "@/lib/middleware/getServerUser";
import { connectDB } from "@/lib/db";
import { Order, Product, User, Review } from "@/models";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

interface DashboardStats {
  revenue: number;
  totalOrders: number;
  pendingOrders: number;
  customers: number;
  products: number;
  pendingReviews: number;
  lowStock: number;
  recentOrders: {
    _id: string;
    total: number;
    orderStatus: string;
    createdAt: string;
    user?: { name?: string; email?: string } | null;
  }[];
}

/**
 * Reads the handful of numbers the landing dashboard shows. Wrapped in a single
 * try/catch that falls back to zeros/empties, so a DB hiccup renders a calm
 * empty dashboard rather than erroring the admin home.
 */
async function getStats(): Promise<DashboardStats> {
  try {
    await connectDB();

    const [revenueAgg, totalOrders, pendingOrders, customers, products, pendingReviews, lowStock, recent] =
      await Promise.all([
        Order.aggregate([
          { $match: { paymentStatus: "paid" } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]),
        Order.countDocuments({}),
        Order.countDocuments({ orderStatus: { $in: ["placed", "processing"] } }),
        User.countDocuments({ role: "customer" }),
        Product.countDocuments({}),
        Review.countDocuments({ isApproved: false }),
        Product.countDocuments({ variants: { $size: 0 }, stock: { $lte: 5 }, isActive: true }),
        Order.find({})
          .populate("user", "name email")
          .select("total orderStatus createdAt user")
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      ]);

    return {
      revenue: revenueAgg[0]?.total ?? 0,
      totalOrders,
      pendingOrders,
      customers,
      products,
      pendingReviews,
      lowStock,
      recentOrders: JSON.parse(JSON.stringify(recent ?? [])),
    };
  } catch (err) {
    console.error("Admin dashboard stats error:", err);
    return {
      revenue: 0,
      totalOrders: 0,
      pendingOrders: 0,
      customers: 0,
      products: 0,
      pendingReviews: 0,
      lowStock: 0,
      recentOrders: [],
    };
  }
}

const STATUS_COLORS: Record<string, string> = {
  placed: "bg-gray-100 text-gray-600",
  processing: "bg-yellow-100 text-yellow-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

function StatCard({
  icon,
  label,
  value,
  href,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  href?: string;
  accent?: string;
}) {
  const inner = (
    <div className="rounded-xl border p-5 h-full transition hover:shadow-sm hover:border-gray-300">
      <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
        <span className={accent}>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default async function AdminDashboard() {
  const [user, stats, settings] = await Promise.all([
    getServerUser(),
    getStats(),
    getSiteSettings(),
  ]);
  const currency = settings.commerce.currencySymbol;
  const firstName = user?.email?.split("@")[0] ?? "Admin";

  const quickLinks = [
    { href: "/admin/products", label: "Products", icon: <Package size={18} /> },
    { href: "/admin/categories", label: "Categories", icon: <FolderTree size={18} /> },
    { href: "/admin/coupons", label: "Coupons", icon: <Ticket size={18} /> },
    { href: "/admin/orders", label: "Orders", icon: <ShoppingBag size={18} /> },
    { href: "/admin/invoices", label: "Invoicing", icon: <FileText size={18} /> },
    { href: "/admin/reviews", label: "Reviews", icon: <Star size={18} /> },
    { href: "/admin/analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
    { href: "/admin/activity-log", label: "Activity Log", icon: <ScrollText size={18} /> },
    { href: "/admin/settings", label: "Settings", icon: <SettingsIcon size={18} /> },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold capitalize">Welcome back, {firstName}</h1>
          <p className="text-sm text-gray-400">
            Here&apos;s what&apos;s happening in your store today.
          </p>
        </div>
        <Link
          href="/admin/analytics"
          className="inline-flex items-center gap-1.5 text-sm rounded-md border px-3 py-2 hover:bg-gray-50"
        >
          <BarChart3 size={15} /> Full analytics
        </Link>
      </div>

      {/* Attention banner — only when there's something to act on */}
      {(stats.pendingOrders > 0 || stats.pendingReviews > 0 || stats.lowStock > 0) && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          <p className="font-medium mb-1 flex items-center gap-2">
            <AlertTriangle size={15} /> Needs your attention
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-yellow-700">
            {stats.pendingOrders > 0 && (
              <Link href="/admin/orders" className="hover:underline">
                {stats.pendingOrders} order{stats.pendingOrders > 1 ? "s" : ""} to process &rarr;
              </Link>
            )}
            {stats.pendingReviews > 0 && (
              <Link href="/admin/reviews" className="hover:underline">
                {stats.pendingReviews} review{stats.pendingReviews > 1 ? "s" : ""} to moderate &rarr;
              </Link>
            )}
            {stats.lowStock > 0 && (
              <Link href="/admin/analytics" className="hover:underline">
                {stats.lowStock} product{stats.lowStock > 1 ? "s" : ""} low on stock &rarr;
              </Link>
            )}
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          icon={<Wallet size={14} />}
          label="Revenue (paid)"
          value={`${currency}${stats.revenue.toLocaleString("en-IN")}`}
          accent="text-green-500"
        />
        <StatCard icon={<ShoppingBag size={14} />} label="Orders" value={stats.totalOrders} href="/admin/orders" />
        <StatCard icon={<Users size={14} />} label="Customers" value={stats.customers} />
        <StatCard icon={<Package size={14} />} label="Products" value={stats.products} href="/admin/products" />
        <StatCard
          icon={<Star size={14} />}
          label="Reviews to moderate"
          value={stats.pendingReviews}
          href="/admin/reviews"
          accent="text-yellow-500"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs text-gray-400 hover:text-gray-700 inline-flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400">No orders yet.</p>
          ) : (
            <ul className="divide-y">
              {stats.recentOrders.map((o) => (
                <li key={o._id} className="flex items-center justify-between py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{o.user?.name ?? "Unknown"}</p>
                    <p className="text-xs text-gray-400">
                      #{o._id.slice(-8)} &middot; {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[o.orderStatus] ?? "bg-gray-100"
                        }`}
                    >
                      {o.orderStatus}
                    </span>
                    <span className="text-sm font-semibold w-16 text-right">{currency}{o.total}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick links */}
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold mb-4">Manage</h2>
          <div className="grid grid-cols-2 gap-2">
            {quickLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm hover:bg-gray-50 hover:border-gray-300 transition"
              >
                <span className="text-gray-500">{l.icon}</span>
                <span>{l.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
