"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HERO_SLIDES, HERO_AUTOPLAY_MS, type HeroSlide } from "@/lib/heroSlides";

/**
 * The hero carousel.
 *
 * Built as a translated track rather than cross-fading absolutely-positioned
 * layers, because a track gives the drag gesture something real to follow —
 * the slide moves with the thumb instead of snapping when the finger lifts.
 *
 * Behaviour:
 *  - advances every HERO_AUTOPLAY_MS, and the timer resets on any manual move
 *    so a slide never flips away a beat after the user chose it;
 *  - pauses on hover, on keyboard focus, and while the tab is hidden (a
 *    background tab shouldn't burn through the rotation);
 *  - drag/swipe on touch and mouse, with a distance threshold so a tap on the
 *    slide still registers as a click through to the linked page;
 *  - arrow keys work once the region has focus;
 *  - honours prefers-reduced-motion by not auto-advancing at all — manual
 *    controls stay available.
 *
 * A picture element selects the supplied portrait artwork on mobile, avoiding
 * a cropped desktop banner or downloading both images.
 */

const DRAG_THRESHOLD = 45; // px before a drag counts as a swipe rather than a tap

export function HeroSlider({
  slides = HERO_SLIDES,
  fallbackHref = "/shop",
}: {
  slides?: HeroSlide[];
  fallbackHref?: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const startX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const count = slides.length;

  const goTo = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count]
  );
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Autoplay. `index` is a dependency on purpose: every manual change
  // re-registers the interval, which is what gives the reset-on-interaction.
  useEffect(() => {
    if (count < 2 || paused || dragging || reducedMotion) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      setIndex((i) => (i + 1) % count);
    }, HERO_AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [count, paused, dragging, reducedMotion, index]);

  // ---- Drag / swipe -----------------------------------------------------
  function onPointerDown(e: React.PointerEvent) {
    // Ignore secondary buttons; let the browser keep native link dragging off.
    if (e.button !== 0) return;
    setDragging(true);
    startX.current = e.clientX;
    setDragX(0);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    setDragX(e.clientX - startX.current);
  }

  function endDrag() {
    if (!dragging) return;
    const width = containerRef.current?.offsetWidth ?? 1;
    // Either a decisive flick or a drag past a fifth of the viewport counts.
    if (Math.abs(dragX) > Math.max(DRAG_THRESHOLD, width * 0.18)) {
      dragX < 0 ? next() : prev();
    }
    setDragging(false);
    setDragX(0);
  }

  const offset = -index * 100;
  const dragPercent =
    dragging && containerRef.current
      ? (dragX / containerRef.current.offsetWidth) * 100
      : 0;

  return (
    <div
      ref={containerRef}
      // Centred and capped at the artwork's native width. Below 1920px the
      // banner fills the viewport edge to edge as intended; above it the image
      // stops growing and centres, rather than upscaling into softness on
      // ultrawide monitors.
      className="group relative mx-auto w-full max-w-[1920px] overflow-hidden bg-background"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured products"
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        endDrag();
      }}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          next();
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          prev();
        }
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      style={{ touchAction: "pan-y" }}
    >
      <div
        className="flex w-full"
        style={{
          transform: `translate3d(${offset + dragPercent}%, 0, 0)`,
          transition: dragging ? "none" : "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.image}
            className="w-full shrink-0"
            aria-hidden={i !== index}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
          >
            <Link
              href={slide.href || fallbackHref}
              tabIndex={i === index ? 0 : -1}
              // A swipe ends with a click event on the link; suppressing it
              // while a drag was in flight stops the gesture navigating away.
              onClick={(e) => {
                if (Math.abs(dragX) > 5) e.preventDefault();
              }}
              draggable={false}
              className="block select-none"
            >
              <picture>
                <source media="(max-width: 767px)" srcSet={slide.mobile} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slide.image} alt={slide.alt} draggable={false}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  width={1600} height={666}
                  className="hero-art mx-auto block h-auto w-full" />
              </picture>
            </Link>
          </div>
        ))}
      </div>

      {/* Arrows — pointer devices only; touch users have the swipe. */}
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border border-hairline bg-background/60 text-foreground opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:bg-background/85 focus-visible:opacity-100 group-hover:opacity-100 md:flex"
          >
            <ChevronLeft size={20} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border border-hairline bg-background/60 text-foreground opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:bg-background/85 focus-visible:opacity-100 group-hover:opacity-100 md:flex"
          >
            <ChevronRight size={20} strokeWidth={1.8} />
          </button>
        </>
      )}

      {/* Dots. Wider bar for the active slide rather than a colour-only change,
          so the position is readable without relying on hue. */}
      {count > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2 md:bottom-5">
          {slides.map((slide, i) => (
            <button
              key={slide.image}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className="flex h-6 items-center px-0.5"
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-7 bg-primary" : "w-1.5 bg-foreground/45"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
