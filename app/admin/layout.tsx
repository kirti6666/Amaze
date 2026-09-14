import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/middleware/getServerUser";
// import { LogoutButton } from "@/components/storefront/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerUser();
  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  return (
    <div
      className="admin-shell flex min-h-screen bg-background text-foreground"
      style={
        {
          // The admin panel deliberately keeps its own light palette. Resetting
          // the theme variables here isolates it from Site Settings, so changing
          // the storefront colours can never restyle the admin.
          "--background": "#ffffff",
          "--surface": "#ffffff",
          "--foreground": "#111827",
          "--muted": "#6b7280",
          "--border": "#e5e7eb",
          "--primary": "#111827",
          "--primary-foreground": "#ffffff",
          "--accent": "#111827",
        } as React.CSSProperties
      }
    >
      <aside className="w-64 border-r p-6 flex flex-col justify-between">
        <div>
          <h2 className="font-bold text-lg mb-6">Admin Panel</h2>
          <nav className="space-y-0.5 text-sm">
            <a
              href="/admin"
              className="block px-4 py-2 bg-[#111827] hover:bg-[#1F2937] text-white rounded-xl"
            >
              Dashboard
            </a>
            <a href="/admin/products" className="block px-4 py-2 bg-[#111827] hover:bg-[#1F2937] text-white rounded-xl">
              Products
            </a>
            <a href="/admin/categories" className="block px-4 py-2 bg-[#111827] hover:bg-[#1F2937] text-white rounded-xl">
              Categories
            </a>
            <a href="/admin/coupons" className="block px-4 py-2 bg-[#111827] hover:bg-[#1F2937] text-white rounded-xl">
              Coupons
            </a>
            <a href="/admin/orders" className="block px-4 py-2 bg-[#111827] hover:bg-[#1F2937] text-white rounded-xl">
              Orders
            </a>
            <a href="/admin/invoices" className="block px-4 py-2 bg-[#111827] hover:bg-[#1F2937] text-white rounded-xl">
              Invoicing
            </a>
            <a href="/admin/analytics" className="block px-4 py-2 bg-[#111827] hover:bg-[#1F2937] text-white rounded-xl">
              Analytics
            </a>
            <a href="/admin/reviews" className="block px-4 py-2 bg-[#111827] hover:bg-[#1F2937] text-white rounded-xl">
              Reviews
            </a>
            <a href="/admin/activity-log" className="block px-4 py-2 bg-[#111827] hover:bg-[#1F2937] text-white rounded-xl">
              Activity Log
            </a>
            <a href="/admin/settings" className="block px-4 py-2 bg-[#111827] hover:bg-[#1F2937] text-white rounded-xl">
              Settings
            </a>
          </nav>
        </div>
        {/* <LogoutButton className="text-sm text-left hover:underline text-red-500" /> */}
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
