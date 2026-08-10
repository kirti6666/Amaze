"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, X } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";

interface WishlistProduct {
  _id: string;
  title: string;
  slug: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category?: { name: string } | null;
}

export default function WishlistPage() {
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const toggle = useWishlistStore((s) => s.toggle);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/wishlist");
      if (res.status === 401) {
        setUnauthorized(true);
        return;
      }
      const data = await res.json();
      setProducts(data.products ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(productId: string) {
    // Optimistically drop it from the grid, then sync via the shared store.
    setProducts((prev) => prev.filter((p) => p._id !== productId));
    try {
      // If it's currently in the set, toggle removes it. Guard with a direct call.
      await fetch(`/api/wishlist?product=${productId}`, { method: "DELETE" });
      // Keep the shared heart-button state in sync without a second network call.
      if (useWishlistStore.getState().ids.has(productId)) {
        await toggle(productId);
      }
    } catch {
      // On failure, reload to resync.
      load();
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 md:px-8">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="text-danger" />
        <h1 className="text-2xl font-bold">My Wishlist</h1>
      </div>

      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : unauthorized ? (
        <p className="text-muted">
          Please{" "}
          <Link href="/login?callbackUrl=/account/wishlist" className="text-primary underline">
            log in
          </Link>{" "}
          to view your wishlist.
        </p>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted mb-4">Your wishlist is empty.</p>
          <Link
            href="/shop"
            className="inline-block rounded-md bg-primary text-primary-foreground px-5 py-2.5"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p) => {
            const hasDiscount = Boolean(p.discountPrice && p.discountPrice < p.price);
            return (
              <div key={p._id} className="group relative">
                <button
                  type="button"
                  onClick={() => remove(p._id)}
                  aria-label="Remove from wishlist"
                  className="absolute top-2 right-2 z-10 grid place-items-center h-8 w-8 rounded-full bg-surface/90 shadow-sm hover:bg-surface"
                >
                  <X size={15} />
                </button>
                <Link href={`/product/${p.slug}`} className="block">
                  <div className="aspect-square rounded-lg overflow-hidden bg-surface mb-3">
                    {p.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-muted text-sm">
                        No image
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-medium line-clamp-2">{p.title}</h3>
                  {p.category?.name && <p className="text-xs text-muted">{p.category.name}</p>}
                  <div className="mt-1 flex items-center gap-2">
                    {hasDiscount ? (
                      <>
                        <span className="font-semibold">₹{p.discountPrice}</span>
                        <span className="text-sm text-muted line-through">₹{p.price}</span>
                      </>
                    ) : (
                      <span className="font-semibold">₹{p.price}</span>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
