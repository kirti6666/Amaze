/**
 * Hero carousel slides.
 *
 * Kept in code rather than Site Settings deliberately: each slide is a piece of
 * artwork with its headline, badges and CTA already baked into the image, so
 * there's no copy for an admin to edit — swapping a slide means swapping a
 * file. To change the rotation, drop new images into /public/hero/slides and
 * edit this list.
 *
 * Each entry needs both crops:
 *  - `image`   — the full 2.29:1 banner, shown from `md` up.
 *  - `mobile`  — a 1:1 crop framed on the product, shown below `md`. The wide
 *                banner at phone width would render its baked-in headline about
 *                four pixels tall, so the phone gets the crop plus real text
 *                underneath instead.
 *
 * `alt` describes the artwork for screen readers and is also the image's
 * fallback text, so write it as a sentence, not a keyword list.
 */

export interface HeroSlide {
  image: string;
  mobile: string;
  alt: string;
  /** Where the slide links. Falls back to the hero CTA link from Site Settings. */
  href?: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    image: "/hero/slides/slide-1.jpg",
    mobile: "/hero/slides/slide-1-mobile.jpg",
    alt: "Tiger Horse Power Capsule — premium herbal formula for men's vitality, 60 capsules with 10+ potent herbs.",
    href: "/shop",
  },
  {
    image: "/hero/slides/slide-2.jpg",
    mobile: "/hero/slides/slide-2-mobile.jpg",
    alt: "Complete performance combo — Stamina Powder, Ashwagandha KSM-66 and Sperm Count & Motility.",
    href: "/category/combos-stacks",
  },
  {
    image: "/hero/slides/slide-3.jpg",
    mobile: "/hero/slides/slide-3-mobile.jpg",
    alt: "Our top items — Erection Support, Pure Impact Stamina Powder and Horse Power Capsule.",
    href: "/shop",
  },
];

/** Milliseconds each slide holds before advancing. */
export const HERO_AUTOPLAY_MS = 5000;
