"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";

interface WishlistButtonProps {
  productId: string;
  /**
   * "overlay" — a floating circular heart, meant to sit on top of a product
   *             card image (position it with a wrapping `relative` container).
   * "inline"  — a bordered button with a label, for the product detail page.
   */
  variant?: "overlay" | "inline";
  className?: string;
}

export function WishlistButton({ productId, variant = "overlay", className = "" }: WishlistButtonProps) {
  const load = useWishlistStore((s) => s.load);
  const toggle = useWishlistStore((s) => s.toggle);
  // Subscribe to the id set so the heart re-renders when it changes anywhere.
  const active = useWishlistStore((s) => s.ids.has(productId));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  async function onClick(e: React.MouseEvent) {
    // Cards wrap the whole thing in a <Link>; don't navigate when hitting the heart.
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      // Never throws now, and never redirects: guests save to localStorage and
      // the list merges into their account if they sign up later.
      await toggle(productId);
    } finally {
      setBusy(false);
    }
  }

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-pressed={active}
        className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm transition disabled:opacity-50 ${
          active ? "border-danger text-danger bg-danger-bg" : "hover:bg-surface"
        } ${className}`}
      >
        <Heart size={16} className={active ? "fill-red-500 text-danger" : ""} />
        {active ? "Saved" : "Save to wishlist"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={active}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      className={`grid place-items-center h-9 w-9 rounded-full bg-surface/90 shadow-sm backdrop-blur transition hover:bg-surface disabled:opacity-50 ${className}`}
    >
      <Heart size={18} className={active ? "fill-red-500 text-danger" : "text-muted"} />
    </button>
  );
}
