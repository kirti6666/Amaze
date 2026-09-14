/**
 * Seed script — populates the DB with the Tiger catalogue:
 *  - 1 admin user (single-admin setup, per BLUEPRINT.md)
 *  - 6 goal-based categories
 *  - 12 products + 5 combo stacks
 *  - Site settings (brand, theme, hero copy, homepage rails)
 *  - 1 sample coupon
 *
 * Run with: npm run seed
 * Requires MONGODB_URI to be set in .env.local
 *
 * WARNING: clears existing Category/Product/Coupon/admin-User data before
 * reseeding. Safe for local/dev use only — never run against production data.
 */

import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import mongoose from "mongoose";
import { LIGHT_THEME } from "../lib/theme-presets";
import bcrypt from "bcryptjs";
import { User, Category, Product, Coupon, SiteSettings } from "../models";
import { CATEGORIES, PRODUCTS, COMBOS } from "./catalog";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set. Add it to .env.local before seeding.");
  process.exit(1);
}

const BRAND = "Tiger";

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);

  console.log("Clearing existing seed data...");
  await Product.deleteMany({});
  await Category.deleteMany({});
  await User.deleteMany({ role: "admin" });
  await Coupon.deleteMany({});
  await SiteSettings.deleteMany({});

  // --- Admin user ---
  const hashedPassword = await bcrypt.hash("ChangeMe123!", 10);
  const admin = await User.create({
    name: `${BRAND} Admin`,
    email: "admin@example.com",
    password: hashedPassword,
    provider: "credentials",
    role: "admin",
  });
  console.log(`Admin created: ${admin.email}`);

  // --- Categories ---
  console.log("Creating categories...");
  const categoryDocs = await Category.insertMany(
    CATEGORIES.map((c) => ({ ...c, parentCategory: null, isActive: true }))
  );
  // slug -> ObjectId, so catalog entries can reference categories by slug.
  const catId = new Map(categoryDocs.map((c: any) => [c.slug, c._id]));

  // --- Products + combos ---
  console.log("Creating products and combos...");
  const all = [...PRODUCTS, ...COMBOS].map((p) => {
    const category = catId.get(p.category);
    if (!category) throw new Error(`Unknown category slug "${p.category}" on ${p.sku}`);
    return {
      title: p.title,
      slug: p.slug,
      description: p.description,
      images: [], // no photography yet — the storefront renders a styled empty state
      category,
      price: p.price,
      discountPrice: p.discountPrice,
      sku: p.sku,
      stock: p.stock,
      variants: [],
      variantCombinations: [],
      tags: p.tags,
      isFeatured: p.isFeatured ?? false,
      isBestseller: p.isBestseller ?? false,
      isActive: true,
    };
  });
  await Product.insertMany(all);

  // --- Site settings ---
  console.log("Creating site settings...");
  await SiteSettings.create({
    singletonKey: "site",
    brand: {
      storeName: BRAND,
      tagline: "Clinical doses. Published lab reports.",
      logoUrl: "",
      faviconUrl: "",
    },
    seo: {
      metaTitle: `${BRAND} — Clinically Dosed Supplements for Men`,
      metaDescription:
        "Ayurvedic and nutraceutical supplements at clinically studied doses. Every batch third-party tested at an NABL-accredited lab. Plain, discreet packaging.",
    },
    theme: { ...LIGHT_THEME },
    commerce: {
      currencySymbol: "₹",
      currencyCode: "INR",
      shippingFee: 0,
      freeShippingThreshold: 0,
      codEnabled: false,
      razorpayEnabled: true,
    },
    announcement: {
      enabled: true,
      text: "Delivery across India · Free delivery on all orders · Plain, unmarked packaging",
      link: "/shop",
    },
    home: {
      hero: {
        title: "Unleash Your Inner Power",
        subtitle:
          "Premium herbal formula for men's vitality. Clinical doses, published lab reports, plain packaging.",
        ctaText: "Shop Now",
        ctaLink: "/shop",
        backgroundImage: "/hero/hero-banner.jpg",
      },
      categoriesHeading: "Shop by Goal",
      featuredHeading: "Featured",
      highlights: [
        { icon: "FlaskConical", title: "Lab Tested", subtitle: "NABL-accredited labs" },
        { icon: "Scale", title: "Clinical Doses", subtitle: "Printed on the front" },
        { icon: "PackageOpen", title: "Plain Packaging", subtitle: "Discreet, unmarked" },
        { icon: "Truck", title: "Free Delivery", subtitle: "On all orders" },
      ],
      banners: [],
      combos: {
        enabled: true,
        heading: "Combos & Stacks",
        subheading: "Multi-product protocols with no duplicated ingredients.",
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
      comboCategorySlug: "combos-stacks",
    },
    header: {
      navLinks: [
        { label: "Shop", href: "/shop" },
        { label: "Combos", href: "/category/combos-stacks" },
        { label: "Stamina", href: "/category/stamina-energy" },
        { label: "Fertility", href: "/category/fertility" },
      ],
    },
    footer: {
      about:
        "Clinically dosed Ayurvedic and nutraceutical supplements. Every batch third-party tested for heavy metals and adulterants.",
      columns: [
        {
          title: "Shop",
          links: [
            { label: "All Products", href: "/shop" },
            { label: "Combos & Stacks", href: "/category/combos-stacks" },
            { label: "Strength & Vitality", href: "/category/strength-vitality" },
            { label: "Stamina & Energy", href: "/category/stamina-energy" },
          ],
        },
        {
          title: "Account",
          links: [
            { label: "My Account", href: "/account" },
            { label: "Orders", href: "/account/orders" },
            { label: "Wishlist", href: "/account/wishlist" },
            { label: "Cart", href: "/cart" },
          ],
        },
      ],
      copyrightText: `© {year} ${BRAND}. All rights reserved. These products are not intended to diagnose, treat, cure or prevent any disease.`,
    },
    contact: { email: "", phone: "", address: "" },
    social: { facebook: "", instagram: "", twitter: "", youtube: "" },
  });

  // --- Coupon ---
  await Coupon.create({
    code: "WELCOME10",
    discountType: "percent",
    value: 10,
    minOrderValue: 500,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    usageLimit: 1000,
    usedCount: 0,
    isActive: true,
  });

  const featured = all.filter((p) => p.isFeatured).length;
  const best = all.filter((p) => p.isBestseller).length;
  console.log("---");
  console.log(
    `Seed complete: ${CATEGORIES.length} categories, ${PRODUCTS.length} products, ` +
      `${COMBOS.length} combos (${featured} featured, ${best} bestsellers), settings, 1 coupon.`
  );
  console.log("Admin login: admin@example.com / ChangeMe123!");
  console.log("---");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
