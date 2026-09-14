"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Ticket,
  ShoppingBag,
  FileText,
  BarChart3,
  Star,
  ScrollText,
  Settings as SettingsIcon,
} from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/invoices", label: "Invoicing", icon: FileText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/activity-log", label: "Activity Log", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

/**
 * Every link used to carry the same dark "active" pill, so the sidebar never
 * showed which page you were on. Only the current section is filled now; the
 * rest stay quiet until hovered.
 *
 * /admin matches exactly — every other route starts with it, so a prefix test
 * would light up Dashboard on all ten pages.
 */
function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-0.5 text-sm">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2.5 rounded-xl px-4 py-2 transition-colors ${
              active
                ? "bg-[#111827] text-white"
                : "text-[#374151] hover:bg-[#F3F4F6]"
            }`}
          >
            <Icon size={15} className="shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
