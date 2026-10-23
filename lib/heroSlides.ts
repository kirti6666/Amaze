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
    image: "/hero/amaze-hero-desktop.webp",
    mobile: "/hero/amaze-hero-mobile.webp",
    alt: "Everything you need. One amazing market. Fashion, electronics, home and living and beauty, all in one place. 100% secure payments, free delivery across India, dedicated support.",
  },
];

/** Milliseconds each slide holds before advancing. */
export const HERO_AUTOPLAY_MS = 5000;
