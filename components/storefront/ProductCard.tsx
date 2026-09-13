import Link from "next/link";
import { WishlistButton } from "./WishlistButton";

interface ProductCardProps {
  product: {
    _id: string;
    title: string;
    slug: string;
    price: number;
    discountPrice?: number;
    images: string[];
    category?: { name: string } | null;
    tags?: string[];
  };
  /** Currency symbol from Site Settings; defaults to â‚¹ so existing call sites keep working. */
  currency?: string;
}

export function ProductCard({ product, currency = "â‚¹" }: ProductCardProps) {
  const hasDiscount = Boolean(
    product.discountPrice && product.discountPrice < product.price
  );
  const off = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="product-card group flex h-full flex-col overflow-hidden rounded-xl bg-background transition-all duration-300"
    >
      <div className="relative aspect-square overflow-hidden bg-surface">
        <WishlistButton productId={product._id} className="absolute right-2 top-2 z-10" />

        {hasDiscount && (
          <span className="absolute bottom-3 left-0 z-10 rounded-r bg-accent px-3 py-1 text-[11px] font-bold text-white">
            SAVE {off}%
          </span>
        )}

        {product.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="dose flex h-full w-full items-center justify-center text-[11px] uppercase tracking-widest text-muted/40">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 text-center md:p-5">
        {product.category?.name && (
          <p className="mb-2 text-[11px] text-muted">
            {product.category.name}
          </p>
        )}

        <h3 className="line-clamp-2 text-sm font-bold leading-snug transition-colors group-hover:text-primary md:text-base">
          {product.title}
        </h3>

        <div className="mt-auto flex flex-wrap items-baseline justify-center gap-2 pt-3">
          <span className="text-base font-bold text-primary">
            {currency}
            {hasDiscount ? product.discountPrice : product.price}
          </span>
          {hasDiscount && (
            <span className="text-xs font-medium text-muted line-through">
              {currency}
              {product.price}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
