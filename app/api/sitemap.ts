import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import { Product, Category } from "@/models";

/**
 * Dynamic sitemap (Next.js App Router convention → served at /sitemap.xml).
 * Includes static routes plus every active product and category.
 *
 * Base URL resolves from NEXT_PUBLIC_SITE_URL, then NEXTAUTH_URL, then a
 * localhost fallback — set NEXT_PUBLIC_SITE_URL in production for correct links.
 */
const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXTAUTH_URL ??
  "http://localhost:3000";

export const revalidate = 3600; // rebuild at most hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/shop",
    "/login",
    "/register",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    await connectDB();

    const [products, categories] = await Promise.all([
      Product.find({ isActive: true }).select("slug updatedAt").lean(),
      Category.find({ isActive: true }).select("slug updatedAt").lean(),
    ]);

    const productRoutes: MetadataRoute.Sitemap = products.map((p: any) => ({
      url: `${BASE_URL}/product/${p.slug}`,
      lastModified: p.updatedAt ?? new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((c: any) => ({
      url: `${BASE_URL}/category/${c.slug}`,
      lastModified: c.updatedAt ?? new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch (err) {
    // If the DB is unreachable at build/request time, still return static routes
    // rather than failing the whole sitemap.
    console.error("Sitemap generation error:", err);
    return staticRoutes;
  }
}
