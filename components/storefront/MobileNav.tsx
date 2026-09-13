"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingBag, User, LogIn } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { LogoutButton } from "./LogoutButton";

interface NavLink {
  label: string;
  href: string;
}

/**
 * The sub-`md` half of the header.
 *
 * Below ~768px there isn't room for the logo, four nav links, cart and account
 * on one line — they used to collide. So the links move into a slide-in panel
 * behind a hamburger, and only the cart stays in the bar (it's the one control
 * people reach for mid-shop and shouldn't have to open a menu to find).
 *
 * Details that matter here:
 *  - body scroll is locked while the panel is open, otherwise the page behind
 *    it scrolls under the user's finger on iOS;
 *  - the panel closes on route change, so tapping a link doesn't leave it
 *    hanging open over the new page;
 *  - Escape closes it, and the trigger carries aria-expanded/aria-controls.
 */
export function MobileNav({
  navLinks,
  user,
}: {
  navLinks: NavLink[];
  user: { role?: string } | null;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Cart count needs the same mount guard as CartLink — the persisted cart
  // only exists in the browser, so rendering it during SSR would mismatch.
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((s) => s.items);
  useEffect(() => setMounted(true), []);
  const count = mounted ? items.reduce((sum, i) => sum + i.quantity, 0) : 0;

  // Close on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock scroll + wire up Escape only while open.
  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab") {
        const items = panelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
        if (!items?.length) return;
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  return (
    <div className="flex items-center gap-1 lg:hidden">
      {/* Cart stays in the bar — the one action worth a permanent slot. */}
      <Link
        href="/cart"
        aria-label={`Cart${count > 0 ? `, ${count} items` : ""}`}
        className="relative flex h-10 w-10 items-center justify-center"
      >
        <ShoppingBag size={20} strokeWidth={1.8} />
        {count > 0 && (
          <span className="dose absolute right-0.5 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Link>

      <button
        type="button"
        onClick={() => setOpen(true)}
        ref={triggerRef}
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        className="flex h-10 w-10 items-center justify-center"
      >
        <Menu size={22} strokeWidth={1.8} />
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        id="mobile-nav-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
        className={`fixed right-0 top-0 z-50 flex h-[100dvh] w-[82%] max-w-[320px] flex-col border-l border-hairline bg-background transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <span className="dose text-[10px] uppercase tracking-[0.22em] text-muted">
            Menu
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center"
          >
            <X size={20} strokeWidth={1.8} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3" onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setOpen(false); }}>
          {navLinks.map((l, i) => (
            <Link
              key={i}
              href={l.href || "#"}
              className="flex items-center justify-between border-b border-hairline/60 px-3 py-4 text-[15px] font-medium"
            >
              {l.label}
              <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
            </Link>
          ))}

          <Link
            href="/cart"
            className="flex items-center gap-3 px-3 py-4 text-[15px] font-medium"
          >
            <ShoppingBag size={17} strokeWidth={1.8} />
            Cart
            {count > 0 && <span className="dose text-primary">({count})</span>}
          </Link>

          {user ? (
            <>
              <Link
                href={user.role === "admin" ? "/admin" : "/account"}
                className="flex items-center gap-3 px-3 py-4 text-[15px] font-medium"
              >
                <User size={17} strokeWidth={1.8} />
                {user.role === "admin" ? "Admin" : "My Account"}
              </Link>
              <div className="px-3 py-4">
                <LogoutButton className="text-[15px] font-medium text-muted" />
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-3 px-3 py-4 text-[15px] font-medium"
            >
              <LogIn size={17} strokeWidth={1.8} />
              Login
            </Link>
          )}
        </nav>

        <div className="border-t border-hairline px-5 py-4">
          <Link
            href="/shop"
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-center bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            Shop all products
          </Link>
        </div>
      </div>
    </div>
  );
}
