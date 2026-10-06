import Link from "next/link";
import { WishlistButton } from "./WishlistButton";
import { Price } from "./Price";

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

export function ProductCard({ product, currency = "₹" }: ProductCardProps) {
  const hasDiscount = Boolean(
    product.discountPrice && product.discountPrice < product.price
  );
  const off = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="product-card refined-card group"
    >
      <div className="card-media">
        <WishlistButton productId={product._id} className="card-wishlist absolute right-2 top-2 z-10" />

        {hasDiscount && (
          <span className="card-discount">
            SAVE {off}%
          </span>
        )}

        {product.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.title}
            loading="lazy"
            className="card-image"
          />
        ) : (
          <div className="dose flex h-full w-full items-center justify-center text-[11px] uppercase tracking-widest text-muted/40">
            No image
          </div>
        )}
      </div>

      <div className="card-body">
        {product.category?.name && (
          <p className="card-category">
            {product.category.name}
          </p>
        )}

        <h3 className="card-title line-clamp-2">
          {product.title}
        </h3>

        <div className="card-prices">
          <Price
            className="card-price"
            symbol={currency}
            amount={hasDiscount ? product.discountPrice! : product.price}
          />
          {hasDiscount && (
            <Price className="card-original-price" symbol={currency} amount={product.price} />
          )}
        </div>
      </div>
    </Link>
  );
}
