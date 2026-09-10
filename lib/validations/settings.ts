import { z } from "zod";

/**
 * Validates the full settings object sent by the admin form. Every field has a
 * default so a partial payload still parses cleanly — the form always posts the
 * whole object, but being lenient keeps the API robust against version drift.
 */

const linkSchema = z.object({
  label: z.string().default(""),
  href: z.string().default(""),
});

const footerColumnSchema = z.object({
  title: z.string().default(""),
  links: z.array(linkSchema).default([]),
});

const highlightSchema = z.object({
  icon: z.string().default(""),
  title: z.string().default(""),
  subtitle: z.string().default(""),
});

const bannerSchema = z.object({
  image: z.string().default(""),
  heading: z.string().default(""),
  subheading: z.string().default(""),
  link: z.string().default(""),
});

/** A toggleable homepage product rail (combos / bestsellers / offers). */
const sectionSchema = z.object({
  enabled: z.boolean().default(true),
  heading: z.string().default(""),
  subheading: z.string().default(""),
});

export const settingsSchema = z.object({
  brand: z
    .object({
      storeName: z.string().trim().min(1, "Store name is required").default("Store"),
      tagline: z.string().default(""),
      logoUrl: z.string().default(""),
      faviconUrl: z.string().default(""),
    })
    .default({}),
  seo: z
    .object({
      metaTitle: z.string().default("E-Commerce Store"),
      metaDescription: z.string().default(""),
    })
    .default({}),
  theme: z
    .object({
      primaryColor: z.string().default("#D91F2A"),
      primaryForeground: z.string().default("#FFFFFF"),
      backgroundColor: z.string().default("#0A0A0B"),
      surfaceColor: z.string().default("#141416"),
      foregroundColor: z.string().default("#FAFAF8"),
      mutedColor: z.string().default("#8A8A92"),
      borderColor: z.string().default("#26262A"),
      accentColor: z.string().default("#D91F2A"),
    })
    .default({}),
  commerce: z
    .object({
      currencySymbol: z.string().default("₹"),
      currencyCode: z.string().default("INR"),
      shippingFee: z.coerce.number().transform(() => 0).default(0),
      freeShippingThreshold: z.coerce.number().transform(() => 0).default(0),
      codEnabled: z.boolean().default(true),
      payplusEnabled: z.boolean().default(true),
      razorpayEnabled: z.boolean().default(true),
    })
    .default({}),
  announcement: z
    .object({
      enabled: z.boolean().default(false),
      text: z.string().default(""),
      link: z.string().default(""),
    })
    .default({}),
  home: z
    .object({
      hero: z
        .object({
          title: z.string().default(""),
          subtitle: z.string().default(""),
          ctaText: z.string().default(""),
          ctaLink: z.string().default(""),
          backgroundImage: z.string().default(""),
        })
        .default({}),
      categoriesHeading: z.string().default("Shop by Goal"),
      featuredHeading: z.string().default("Featured"),
      highlights: z.array(highlightSchema).default([]),
      banners: z.array(bannerSchema).default([]),
      combos: sectionSchema.default({}),
      bestsellers: sectionSchema.default({}),
      offers: sectionSchema.default({}),
      comboCategorySlug: z.string().default("combos-stacks"),
    })
    .default({}),
  header: z
    .object({
      navLinks: z.array(linkSchema).default([]),
    })
    .default({}),
  footer: z
    .object({
      about: z.string().default(""),
      columns: z.array(footerColumnSchema).default([]),
      copyrightText: z.string().default(""),
    })
    .default({}),
  contact: z
    .object({
      email: z.string().default(""),
      phone: z.string().default(""),
      address: z.string().default(""),
    })
    .default({}),
  social: z
    .object({
      facebook: z.string().default(""),
      instagram: z.string().default(""),
      twitter: z.string().default(""),
      youtube: z.string().default(""),
    })
    .default({}),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
