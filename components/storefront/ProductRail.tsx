"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCard";

interface RailProduct {
  _id: string;
  title: string;
  slug: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category?: { name: string } | null;
  tags?: string[];
}

interface ProductRailProps {
  heading: string;
  subheading?: string;
  products: RailProduct[];
  currency?: string;
  /** Optional "see all" destination shown next to the heading. */
  viewAllHref?: string;
}

/**
 * A horizontally scrolling product rail.
 *
 * Native touch scrolling with two cards on mobile and four on desktop.
 *
 * Desktop: the same scroller plus arrow buttons. Both the arrows and the rail are keyboard accessible.
 */
export function ProductRail({
  heading,
  subheading,
  products,
  currency = "₹",
  viewAllHref,
}: ProductRailProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // Track scroll position so arrows can disable at the ends rather than
  // sitting there looking clickable when they'd do nothing.
  const sync = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft >= max - 2);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  // Scroll by one viewport-width of cards, so a click always lands on a
  // card edge rather than mid-card.
  const nudge = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  if (products.length === 0) return null;

  const arrowBase =
    "hidden md:grid h-9 w-9 place-items-center rounded-full border border-hairline bg-surface transition-colors disabled:opacity-30 disabled:cursor-default hover:enabled:border-primary hover:enabled:text-primary";

  return (
    <section className="product-rail py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Heading row */}
        <div className="relative mb-8 flex items-center justify-center gap-6 text-center">
          <div className="min-w-0">

            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              {heading}
            </h2>
            {subheading && (
              <p className="mt-2 max-w-xl text-sm text-muted">{subheading}</p>
            )}
          </div>

          <div className="absolute right-0 hidden shrink-0 items-center gap-2 xl:flex">
            <button
              type="button"
              onClick={() => nudge(-1)}
              disabled={atStart}
              aria-label="Previous products"
              className={arrowBase}
            >
              <ChevronLeft size={17} />
            </button>
            <button
              type="button"
              onClick={() => nudge(1)}
              disabled={atEnd}
              aria-label="Next products"
              className={arrowBase}
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* Scroller. Padding matches the container so the first card lines up
          with the heading, while cards can still bleed off the right edge. */}
      <div
        ref={scroller}
        className="rail mx-auto flex max-w-7xl gap-4 overflow-x-auto px-5 pb-5 md:gap-6 md:px-8"
        role="region"
        aria-label={heading}
        tabIndex={0}
      >

        {products.map((p) => (
          <div
            key={p._id}
            className="w-[calc((100%-1rem)/2)] shrink-0 md:w-[calc((100%-4.5rem)/4)]"
          >
            <ProductCard product={p} currency={currency} />
          </div>
        ))}

      </div>
      {viewAllHref && <div className="mt-5 text-center"><Link href={viewAllHref} className="inline-flex min-w-36 justify-center rounded-md bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground">View all</Link></div>}
    </section>
  );
}
