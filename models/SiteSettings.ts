import { Schema, models, model } from "mongoose";
import { LIGHT_THEME } from "@/lib/theme-presets";

/**
 * SiteSettings — a SINGLETON document that holds every piece of site-wide,
 * admin-editable content/config for the storefront. There is only ever ONE
 * of these (identified by `singletonKey: "site"`), so the whole CMS is just
 * "read this one doc, edit this one doc".
 *
 * Design choices:
 *  - Grouped into logical sections (brand, seo, theme, commerce, home, ...)
 *    so the admin form can render one tab per section.
 *  - Sub-documents use `_id: false` — these are plain config blobs, not
 *    separately-addressable records, so they don't need their own ids.
 *  - Nothing here is "required": getSiteSettings() always merges the stored
 *    doc over DEFAULT_SETTINGS, so a missing field can never break a page.
 */

// ---- Sub-schemas (repeatable list items) -------------------------------

const LinkSchema = new Schema(
  {
    label: { type: String, default: "" },
    href: { type: String, default: "" },
  },
  { _id: false }
);

const FooterColumnSchema = new Schema(
  {
    title: { type: String, default: "" },
    links: { type: [LinkSchema], default: [] },
  },
  { _id: false }
);

const HighlightSchema = new Schema(
  {
    icon: { type: String, default: "" }, // lucide icon name, e.g. "Truck"
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
  },
  { _id: false }
);

const BannerSchema = new Schema(
  {
    image: { type: String, default: "" },
    heading: { type: String, default: "" },
    subheading: { type: String, default: "" },
    link: { type: String, default: "" },
  },
  { _id: false }
);

// ---- Section sub-schemas -----------------------------------------------

const BrandSchema = new Schema(
  {
    storeName: { type: String, default: "Amaze Markets" },
    tagline: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
    faviconUrl: { type: String, default: "" },
  },
  { _id: false }
);

const SeoSchema = new Schema(
  {
    metaTitle: { type: String, default: "E-Commerce Store" },
    metaDescription: { type: String, default: "" },
  },
  { _id: false }
);

const ThemeSchema = new Schema(
  {
    // `primary` drives buttons/links (existing behaviour, unchanged contract).
    primaryColor: { type: String, default: LIGHT_THEME.primaryColor },
    primaryForeground: { type: String, default: LIGHT_THEME.primaryForeground },
    // Extended tokens. All optional with defaults, so any existing settings
    // doc keeps working — getSiteSettings() merges these in automatically.
    backgroundColor: { type: String, default: LIGHT_THEME.backgroundColor }, // page canvas
    surfaceColor: { type: String, default: LIGHT_THEME.surfaceColor }, // cards, raised panels
    foregroundColor: { type: String, default: LIGHT_THEME.foregroundColor }, // primary text
    mutedColor: { type: String, default: LIGHT_THEME.mutedColor }, // secondary text
    borderColor: { type: String, default: LIGHT_THEME.borderColor }, // hairlines
    accentColor: { type: String, default: LIGHT_THEME.accentColor }, // badges, emphasis
  },
  { _id: false }
);

const CommerceSchema = new Schema(
  {
    currencySymbol: { type: String, default: "₹" },
    currencyCode: { type: String, default: "INR" },
    shippingFee: { type: Number, default: 0 },
    freeShippingThreshold: { type: Number, default: 0 },
    // COD removed — the store is prepaid only. Left in the schema (rather than
    // dropped) so existing documents keep validating and the decision stays
    // reversible from Admin → Settings → Commerce if that ever changes.
    codEnabled: { type: Boolean, default: false },
    payplusEnabled: { type: Boolean, default: true },
    razorpayEnabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const AnnouncementSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    text: { type: String, default: "" },
    link: { type: String, default: "" },
  },
  { _id: false }
);

const HeroSchema = new Schema(
  {
    title: { type: String, default: "Everything you need, one amazing market" },
    subtitle: { type: String, default: "Quality products, fair prices, fast shipping." },
    ctaText: { type: String, default: "Shop Now" },
    ctaLink: { type: String, default: "/shop" },
    backgroundImage: { type: String, default: "" },
  },
  { _id: false }
);

/**
 * A homepage product rail (horizontal scroller). Each rail is independently
 * toggleable and re-titleable from the admin panel, so marketing can turn
 * "Special Offers" on for a sale weekend without a deploy.
 */
const SectionSchema = new Schema(
  {
    enabled: { type: Boolean, default: true },
    heading: { type: String, default: "" },
    subheading: { type: String, default: "" },
  },
  { _id: false }
);

const HomeSchema = new Schema(
  {
    hero: { type: HeroSchema, default: () => ({}) },
    categoriesHeading: { type: String, default: "Shop By Category" },
    featuredHeading: { type: String, default: "Trending Now" },
    highlights: { type: [HighlightSchema], default: [] },
    banners: { type: [BannerSchema], default: [] },
    // Product rails, rendered in this order beneath the category grid.
    combos: {
      type: SectionSchema,
      default: () => ({
        enabled: true,
        heading: "Featured Collection",
        subheading: "Explore more of your favourites.",
      }),
    },
    bestsellers: {
      type: SectionSchema,
      default: () => ({
        enabled: true,
        heading: "Bestsellers",
        subheading: "What most people start with.",
      }),
    },
    offers: {
      type: SectionSchema,
      default: () => ({
        enabled: true,
        heading: "Special Offers",
        subheading: "Biggest savings across the range.",
      }),
    },
    /** Slug of the category treated as bundles. Drives the Combos rail. */
    comboCategorySlug: { type: String, default: "fashion-and-beauty" },
  },
  { _id: false }
);

const HeaderSchema = new Schema(
  {
    navLinks: { type: [LinkSchema], default: [] },
  },
  { _id: false }
);

const FooterSchema = new Schema(
  {
    about: { type: String, default: "" },
    columns: { type: [FooterColumnSchema], default: [] },
    copyrightText: { type: String, default: "" },
  },
  { _id: false }
);

const ContactSchema = new Schema(
  {
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
  },
  { _id: false }
);

const SocialSchema = new Schema(
  {
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    twitter: { type: String, default: "" },
    youtube: { type: String, default: "" },
  },
  { _id: false }
);

// ---- Root schema --------------------------------------------------------

const SiteSettingsSchema = new Schema(
  {
    // Guarantees a single row; PUT upserts against this key.
    singletonKey: { type: String, default: "site", unique: true, index: true },

    brand: { type: BrandSchema, default: () => ({}) },
    seo: { type: SeoSchema, default: () => ({}) },
    theme: { type: ThemeSchema, default: () => ({}) },
    commerce: { type: CommerceSchema, default: () => ({}) },
    announcement: { type: AnnouncementSchema, default: () => ({}) },
    home: { type: HomeSchema, default: () => ({}) },
    header: { type: HeaderSchema, default: () => ({}) },
    footer: { type: FooterSchema, default: () => ({}) },
    contact: { type: ContactSchema, default: () => ({}) },
    social: { type: SocialSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default models.SiteSettings || model("SiteSettings", SiteSettingsSchema);
