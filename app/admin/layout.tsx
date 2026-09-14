import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getServerUser } from "@/lib/middleware/getServerUser";
import { LogoutButton } from "@/components/storefront/LogoutButton";
import { AdminNav } from "@/components/admin/AdminNav";

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
      <aside className="flex w-64 shrink-0 flex-col justify-between border-r p-6">
        <div>
          <h2 className="mb-1 text-lg font-bold">Admin Panel</h2>
          <p className="mb-6 truncate text-xs text-[#6b7280]" title={user.email}>
            {user.email}
          </p>
          <AdminNav />
        </div>

        {/* The storefront header used to supply the only way out of the admin
            panel. It no longer wraps these pages, so the shell owns both the
            way back to the shop and the way to sign out. */}
        <div className="mt-6 space-y-1 border-t pt-4 text-sm">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-[#374151] transition-colors hover:bg-[#F3F4F6]"
          >
            <ExternalLink size={15} className="shrink-0" />
            View store
          </Link>
          <LogoutButton className="w-full rounded-xl px-4 py-2 text-left text-red-600 transition-colors hover:bg-red-50" />
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-8">{children}</main>
    </div>
  );
}
