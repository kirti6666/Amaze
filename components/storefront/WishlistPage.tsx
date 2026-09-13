"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCurrency } from "@/lib/useCurrency";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { ProductCard } from "./ProductCard";

import { loadGuestWishlist, type WishlistProduct } from "./guest-wishlist";

export function WishlistPage() {
  const ids = useWishlistStore(s => s._ids);
  const load = useWishlistStore(s => s.load);
  const { symbol } = useCurrency();
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [guest, setGuest] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    async function fetchWishlist() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/wishlist", { signal });
        if (res.status !== 401) {
          if (!res.ok) throw new Error("Could not load your wishlist. Please try again.");
          const data = await res.json();
          if (!signal.aborted) { setGuest(false); setProducts((data.products ?? []).filter((product: WishlistProduct) => ids.includes(product._id))); }
          return;
        }
        setGuest(true);
        const saved = await loadGuestWishlist(ids, signal);
        if (!signal.aborted) setProducts(saved);
      } catch (err) {
        if (!signal.aborted) setError(err instanceof Error ? err.message : "Could not load your wishlist.");
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    }
    void fetchWishlist();
    return () => controller.abort();
  }, [ids, retry]);

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 md:px-8">
      <div className="collection-heading">
        <Heart className="mx-auto mb-3 text-primary" size={28} />
        <h1>My Wishlist</h1>
        <p>{guest ? "Your favourites, saved on this device. No account needed." : "All your favourites in one place."}</p>
      </div>
      {loading ? <ProductGridSkeleton count={4} /> : error ? (
        <div role="alert" className="py-12 text-center"><p className="text-danger">{error}</p><button onClick={() => setRetry(n => n + 1)} className="mt-4 rounded-md border px-5 py-2">Try again</button></div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center">
          <p className="mb-5 text-muted">Your wishlist is empty. Tap a heart to save something you love.</p>
          <Link href="/shop" className="inline-flex rounded-md bg-primary px-7 py-3 font-semibold text-primary-foreground">Explore products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {products.map(product => <ProductCard key={product._id} product={product} currency={symbol} />)}
        </div>
      )}
    </main>
  );
}
