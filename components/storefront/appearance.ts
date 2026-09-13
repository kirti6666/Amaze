import type { SiteSettingsData } from "@/lib/site-settings";

/** Presentation only: translate the original Tiger preset without writing settings.
 * Custom admin values and commerce stay intact; the legacy preset gets new storefront copy.
 */
export function storefrontAppearance(settings: SiteSettingsData): SiteSettingsData {
  const legacyBrand = /^(store|tiger)$/i.test(settings.brand.storeName.trim());
  const legacyTheme = settings.theme.backgroundColor.toLowerCase() === "#0a0a0b"
    && settings.theme.primaryColor.toLowerCase() === "#d91f2a";
  return {
    ...settings,
    brand: {
      ...settings.brand,
      storeName: legacyBrand ? "Amaze Markets" : settings.brand.storeName,
      logoUrl: !settings.brand.logoUrl || settings.brand.logoUrl === "/brand/tiger-logo.svg" ? "/brand/amaze-logo.png" : settings.brand.logoUrl,
      tagline: legacyBrand ? "Everything you need, one amazing market." : settings.brand.tagline,
    },
    header: legacyBrand ? { navLinks: [{ label: "All Products", href: "/shop" }, { label: "My Orders", href: "/account/orders" }] } : settings.header,
    announcement: legacyBrand ? { ...settings.announcement, text: "Everything you need, one amazing market", link: "/shop" } : settings.announcement,
    seo: legacyBrand ? {
      ...settings.seo,
      metaTitle: "Amaze Markets | Everything you need, one amazing market",
      metaDescription: "Discover your next favourite at Amaze Markets. Explore our products and shop with easy guest checkout.",
    } : settings.seo,
    theme: legacyTheme ? {
      primaryColor: "#412b6b", primaryForeground: "#ffffff",
      backgroundColor: "#ffffff", surfaceColor: "#f6f4f8",
      foregroundColor: "#151515", mutedColor: "#6b6475",
      borderColor: "#e8e3ed", accentColor: "#ef508b",
    } : settings.theme,
    home: {
      ...settings.home,
      categoriesHeading: settings.home.categoriesHeading === "Shop by Goal" ? "Shop By Category" : settings.home.categoriesHeading,
      featuredHeading: settings.home.featuredHeading === "Featured" ? "Trending Now" : settings.home.featuredHeading,
    },
    footer: {
      ...settings.footer,
      columns: legacyBrand ? [
        { title: "Explore", links: [{ label: "All Products", href: "/shop" }, { label: "Shop By Category", href: "/#categories" }] },
        { title: "Your Account", links: [{ label: "My Account", href: "/account" }, { label: "My Orders", href: "/account/orders" }, { label: "Wishlist", href: "/wishlist" }, { label: "Cart", href: "/cart" }] },
      ] : settings.footer.columns,
      about: legacyBrand ? "Everyday essentials. Little discoveries. Everything you need, in one amazing market." : settings.footer.about,
      copyrightText: legacyBrand ? "Â© {year} Amaze Markets. All rights reserved." : settings.footer.copyrightText,
    },
  };
}
