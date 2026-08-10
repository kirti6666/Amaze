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
  /** Currency symbol from Site Settings; defaults to ₹ so existing call sites keep working. */
  currency?: string;
}

/**
 * Pulls the first dose-shaped tag (e.g. "6000mg", "KSM-66") so the card can
 * show a real specification instead of a marketing adjective. Falls back to
 * nothing rather than inventing a claim.
 */
function doseTag(tags?: string[]): string | null {
  if (!tags?.length) return null;
  // Matches "6000mg", "1.5g", "400mcg", "60% fulvic acid". The unit alternation
  // is ordered longest-first so "mcg" isn't consumed as "mg"/"g", and there's no
  // trailing \b — "%" is a non-word char, so a boundary would never assert.
  const hit = tags.find((t) => /\d+(?:\.\d+)?\s*(?:mcg|mg|g|%)/i.test(t));
  return hit ? hit.toUpperCase() : null;
}

export function ProductCard({ product, currency = "₹" }: ProductCardProps) {
  const hasDiscount = Boolean(
    product.discountPrice && product.discountPrice < product.price
  );
  const off = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;
  const dose = doseTag(product.tags);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex h-full flex-col border border-hairline bg-surface transition-colors duration-300 hover:border-primary"
    >
      <div className="relative aspect-square overflow-hidden bg-background">
        <WishlistButton productId={product._id} className="absolute right-2 top-2 z-10" />

        {hasDiscount && (
          <span className="dose absolute left-0 top-3 z-10 bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground">
            {off}% OFF
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

      <div className="flex flex-1 flex-col p-4">
        {product.category?.name && (
          <p className="dose mb-2 text-[10px] uppercase tracking-[0.16em] text-muted">
            {product.category.name}
          </p>
        )}

        <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug transition-colors group-hover:text-primary md:text-sm">
          {product.title}
        </h3>

        {/* Dose ledger — the specification, set in mono like lab data. */}
        {dose && (
          <p className="dose mt-2 text-[11px] text-primary">{dose}</p>
        )}

        <div className="mt-auto flex items-baseline gap-2 pt-4">
          <span className="dose text-base font-semibold">
            {currency}
            {hasDiscount ? product.discountPrice : product.price}
          </span>
          {hasDiscount && (
            <span className="dose text-xs text-muted line-through">
              {currency}
              {product.price}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
