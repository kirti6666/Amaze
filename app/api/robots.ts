import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXTAUTH_URL ??
  "http://localhost:3000";

/**
 * robots.txt (Next.js App Router convention → served at /robots.txt).
 * Allows crawling of storefront pages, blocks private/admin/API/account areas,
 * and points crawlers at the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/account", "/checkout", "/cart"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
