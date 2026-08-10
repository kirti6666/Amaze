"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
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
  /** Red rule above the heading — used to mark the primary rail on a page. */
  accent?: boolean;
}

/**
 * A horizontally scrolling product rail.
 *
 * Mobile: native touch scrolling with CSS scroll-snap (see `.rail` in
 * globals.css) — cards are ~72vw so the next one always peeks in, which is what
 * tells a thumb there's more to swipe.
 *
 * Desktop: the same scroller plus arrow buttons. Arrows are hidden from screen
 * readers because the rail is already reachable and scrollable by keyboard;
 * they're a pointer affordance, not a second navigation path.
 */
export function ProductRail({
  heading,
  subheading,
  products,
  currency = "₹",
  viewAllHref,
  accent = false,
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
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Heading row */}
        <div className="mb-6 flex items-end justify-between gap-6">
          <div className="min-w-0">
            {accent && <div className="mb-4 h-[3px] w-10 bg-primary" />}
            <h2 className="font-display text-2xl md:text-4xl font-bold tracking-tightest">
              {heading}
            </h2>
            {subheading && (
              <p className="mt-2 max-w-xl text-sm text-muted">{subheading}</p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="mr-1 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                View all
                <ArrowRight size={15} />
              </Link>
            )}
            <button
              type="button"
              onClick={() => nudge(-1)}
              disabled={atStart}
              aria-hidden="true"
              tabIndex={-1}
              className={arrowBase}
            >
              <ChevronLeft size={17} />
            </button>
            <button
              type="button"
              onClick={() => nudge(1)}
              disabled={atEnd}
              aria-hidden="true"
              tabIndex={-1}
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
        className="rail flex gap-4 overflow-x-auto px-5 pb-2 md:gap-5 md:px-8"
        role="region"
        aria-label={heading}
        tabIndex={0}
      >
        <div className="hidden shrink-0 md:block md:w-[max(0px,calc((100vw-80rem)/2))]" />
        {products.map((p) => (
          <div
            key={p._id}
            className="w-[72vw] shrink-0 sm:w-[46vw] md:w-[290px] lg:w-[268px]"
          >
            <ProductCard product={p} currency={currency} />
          </div>
        ))}
        <div className="w-1 shrink-0 md:w-[max(0px,calc((100vw-80rem)/2))]" />
      </div>
    </section>
  );
}
