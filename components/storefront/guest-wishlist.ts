export interface WishlistProduct {
  _id: string;
  title: string;
  slug: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category?: { name: string } | null;
  isActive?: boolean;
}

/** Resolve guest favourites with the public API; never load inactive products. */
export async function loadGuestWishlist(ids: string[], signal?: AbortSignal): Promise<WishlistProduct[]> {
  const saved: WishlistProduct[] = [];
  for (let start = 0; start < ids.length; start += 6) {
    const batch = await Promise.all(ids.slice(start, start + 6).map(async id => {
      const response = await fetch(`/api/products/${encodeURIComponent(id)}`, { signal });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error("Could not load your saved products. Please try again.");
      const { product } = await response.json();
      return product?.isActive ? product as WishlistProduct : null;
    }));
    saved.push(...batch.filter((p): p is WishlistProduct => p !== null));
  }
  return saved;
}
