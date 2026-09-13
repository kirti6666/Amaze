/**
 * Supplied Amaze Markets artwork. Desktop and portrait mobile banners contain
 * their own copy; render without overlays and retain the admin CTA destination.
 * Add additional image/mobile pairs here to use the existing carousel.
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
    image: "/brand/amaze-desktop.png",
    mobile: "/brand/amaze-mobile.png",
    alt: "Everything you need, one amazing market. Fashion, electronics, home and living, beauty — all in one place. Shop now at Amaze Markets.",
  },
];

/** Milliseconds each slide holds before advancing. */
export const HERO_AUTOPLAY_MS = 5000;
