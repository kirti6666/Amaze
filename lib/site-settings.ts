import { connectDB } from "@/lib/db";
import { SiteSettings } from "@/models";
import { LIGHT_THEME } from "@/lib/theme-presets";

/**
 * Shared TypeScript shape for the CMS settings. This is the single source of
 * truth the admin form, the API, and every storefront component agree on.
 */
export interface NavLink {
  label: string;
  href: string;
}
export interface FooterColumn {
  title: string;
  links: NavLink[];
}
export interface Highlight {
  icon: string;
  title: string;
  subtitle: string;
}
export interface Banner {
  image: string;
  heading: string;
  subheading: string;
  link: string;
}
/** A toggleable homepage product rail. */
export interface HomeSection {
  enabled: boolean;
  heading: string;
  subheading: string;
}

export interface SiteSettingsData {
  brand: {
    storeName: string;
    tagline: string;
    logoUrl: string;
    faviconUrl: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  theme: {
    primaryColor: string;
    primaryForeground: string;
    backgroundColor: string;
    surfaceColor: string;
    foregroundColor: string;
    mutedColor: string;
    borderColor: string;
    accentColor: string;
  };
  commerce: {
    currencySymbol: string;
    currencyCode: string;
    shippingFee: number;
    freeShippingThreshold: number;
    codEnabled: boolean;
    payplusEnabled: boolean;
    razorpayEnabled: boolean;
  };
  announcement: {
    enabled: boolean;
    text: string;
    link: string;
  };
  home: {
    hero: {
      title: string;
      subtitle: string;
      ctaText: string;
      ctaLink: string;
      backgroundImage: string;
    };
    categoriesHeading: string;
    featuredHeading: string;
    highlights: Highlight[];
    banners: Banner[];
    combos: HomeSection;
    bestsellers: HomeSection;
    offers: HomeSection;
    comboCategorySlug: string;
  };
  header: {
    navLinks: NavLink[];
  };
  footer: {
    about: string;
    columns: FooterColumn[];
    copyrightText: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
  };
}

/**
 * The fallback content used when the DB has no settings yet (fresh install),
 * or when a stored doc is missing a newly-added field. These defaults mirror
 * the values that were previously hardcoded in the storefront, so the site
 * looks identical before the admin touches anything.
 */
export const DEFAULT_SETTINGS: SiteSettingsData = {
  brand: {
    storeName: "Amaze Markets",
    tagline: "Quality products, fair prices, fast shipping.",
    logoUrl: "/brand/amaze-logo.png",
    faviconUrl: "",
  },
  seo: {
    metaTitle: "Amaze Markets | Everything you need, one amazing market",
    metaDescription: "Shop everyday essentials, fashion, home, beauty and more at Amaze Markets.",
  },
  theme: { ...LIGHT_THEME },
  commerce: {
    currencySymbol: "₹",
    currencyCode: "INR",
    shippingFee: 0,
    freeShippingThreshold: 0,
    codEnabled: false,
    payplusEnabled: true,
    razorpayEnabled: true,
  },
  announcement: {
    enabled: false,
    text: "",
    link: "",
  },
  home: {
    hero: {
      title: "Everything you need, one amazing market",
      subtitle: "Quality products, fair prices, fast shipping.",
      ctaText: "Shop Now",
      ctaLink: "/shop",
      backgroundImage: "",
    },
    categoriesHeading: "Shop By Category",
    featuredHeading: "Trending Now",
    highlights: [],
    banners: [],
    combos: {
      enabled: true,
      heading: "Featured Collection",
      subheading: "Explore more of your favourites.",
    },
    bestsellers: {
      enabled: true,
      heading: "Bestsellers",
      subheading: "What most people start with.",
    },
    offers: {
      enabled: true,
      heading: "Special Offers",
      subheading: "Biggest savings across the range.",
    },
    comboCategorySlug: "fashion-and-beauty",
  },
  header: {
    navLinks: [{ label: "Shop", href: "/shop" }],
  },
  footer: {
    about: "Quality products, fair prices, fast shipping.",
    columns: [
      {
        title: "Shop",
        links: [
          { label: "All Products", href: "/shop" },
          { label: "Cart", href: "/cart" },
        ],
      },
      {
        title: "Account",
        links: [
          { label: "My Account", href: "/account" },
          { label: "Orders", href: "/account" },
        ],
      },
    ],
    copyrightText: "© {year} Amaze Markets. All rights reserved.",
  },
  contact: {
    email: "",
    phone: "",
    address: "",
  },
  social: {
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
  },
};

/** True for plain `{}` objects — used to decide what to deep-merge vs. copy. */
function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Deep-merge `stored` over `defaults`. Objects merge key-by-key; arrays and
 * scalars from `stored` replace the default entirely (so an admin who clears
 * all nav links really gets zero nav links, not the defaults back).
 */
export function mergeSettings<T>(defaults: T, stored: unknown): T {
  if (!isPlainObject(defaults) || !isPlainObject(stored)) return defaults;
  const out: Record<string, unknown> = { ...(defaults as Record<string, unknown>) };

  for (const key of Object.keys(defaults as Record<string, unknown>)) {
    const dVal = (defaults as Record<string, unknown>)[key];
    const sVal = stored[key];
    if (sVal === undefined || sVal === null) {
      out[key] = dVal;
    } else if (isPlainObject(dVal) && isPlainObject(sVal)) {
      out[key] = mergeSettings(dVal, sVal);
    } else {
      out[key] = sVal;
    }
  }
  return out as T;
}

/**
 * Reads the singleton settings doc, creating it with defaults on first call,
 * and always returns a plain, fully-populated SiteSettingsData object (defaults
 * merged under whatever is stored). Safe to call from any Server Component,
 * layout, or route handler.
 */
export function applyFreeShipping(settings: SiteSettingsData): SiteSettingsData {
  return {
    ...settings,
    commerce: { ...settings.commerce, shippingFee: 0, freeShippingThreshold: 0 },
    announcement: {
      ...settings.announcement,
      text: settings.announcement.text.replace(/free delivery above ₹[\d,]+/gi, "Free delivery on all orders"),
    },
    home: {
      ...settings.home,
      highlights: settings.home.highlights.map((item) => item.icon === "Truck" && /free delivery/i.test(item.title)
        ? { ...item, subtitle: "On all orders" } : item),
    },
  };
}

export async function getSiteSettings(): Promise<SiteSettingsData> {
  try {
    await connectDB();
    let doc = await SiteSettings.findOne({ singletonKey: "site" }).lean();
    if (!doc) {
      const created = await SiteSettings.create({ singletonKey: "site", ...DEFAULT_SETTINGS });
      doc = created.toObject();
    }
    return applyFreeShipping(mergeSettings(DEFAULT_SETTINGS, doc as unknown));
  } catch (err) {
    // Never let a settings/DB hiccup take down a page — fall back to defaults.
    console.error("getSiteSettings failed, using defaults:", err);
    return applyFreeShipping(DEFAULT_SETTINGS);
  }
}

/** Format a numeric amount with the configured currency symbol, e.g. "₹499". */
export function formatPrice(amount: number, symbol = "₹"): string {
  return `${symbol}${amount}`;
}
