import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { connectDB } from "@/lib/db";
import { Product, Category } from "@/models";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ProductRail } from "@/components/storefront/ProductRail";
import { HeroSlider } from "@/components/storefront/HeroSlider";
import { getSiteSettings } from "@/lib/site-settings";

// Always fetch fresh data for now — we can add caching/ISR once the catalog is stable.
export const dynamic = "force-dynamic";

/**
 * Goal slug -> Lucide icon. Kept in code rather than on the Category model so
 * the schema stays untouched; a new category falls back to a neutral dot until
 * it's added here.
 */
const GOAL_ICONS: Record<string, string> = {
  "strength-vitality": "Flame",
  "stamina-energy": "Zap",
  "mens-wellness": "HeartPulse",
  "sleep-recovery": "Moon",
  fertility: "Sprout",
  "combos-stacks": "Layers",
};

/** Resolve a Lucide icon by name (from settings), falling back to a dot. */
function Icon({
  name,
  className,
  size = 20,
}: {
  name: string;
  className?: string;
  size?: number;
}) {
  const Cmp = (LucideIcons as Record<string, any>)[name] ?? LucideIcons.Circle;
  return <Cmp className={className} size={size} strokeWidth={1.6} />;
}

/**
 * Mongoose lean() docs carry ObjectIds and Dates, which can't cross the
 * Server -> Client Component boundary. Round-tripping through JSON strips them
 * to plain values. Returns `any` by design: the caller's prop type is the
 * contract we actually want checked, not Mongoose's inferred document shape.
 */
function plain<T = any>(v: unknown): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

const PRODUCT_FIELDS = "title slug price discountPrice images category tags";

export default async function HomePage() {
  await connectDB();
  const settings = await getSiteSettings();
  const { home, commerce } = settings;
  const hero = home.hero;
  const currency = commerce.currencySymbol;

  // Resolve the combos category first — the combos rail filters on it, and the
  // goals grid excludes it (bundles get their own rail, not a goal tile).
  const comboCat: any = await Category.findOne({
    slug: home.comboCategorySlug,
  })
    .select("_id")
    .lean();
  const comboId = comboCat?._id ?? null;

  const [goals, combos, bestsellers, offers, featured] = await Promise.all([
    Category.find({
      isActive: true,
      parentCategory: null,
      ...(comboId ? { _id: { $ne: comboId } } : {}),
    })
      .sort({ name: 1 })
      .lean(),

    comboId && home.combos.enabled
      ? Product.find({ isActive: true, category: comboId })
          .select(PRODUCT_FIELDS)
          .populate("category", "name slug")
          .sort({ price: -1 })
          .limit(12)
          .lean()
      : [],

    home.bestsellers.enabled
      ? Product.find({ isActive: true, isBestseller: true })
          .select(PRODUCT_FIELDS)
          .populate("category", "name slug")
          .limit(12)
          .lean()
      : [],

    // "Offers" = genuinely discounted, ranked by absolute saving so the rail
    // leads with the biggest number rather than an arbitrary order.
    home.offers.enabled
      ? Product.aggregate([
          {
            $match: {
              isActive: true,
              discountPrice: { $gt: 0 },
              $expr: { $lt: ["$discountPrice", "$price"] },
            },
          },
          { $addFields: { saving: { $subtract: ["$price", "$discountPrice"] } } },
          { $sort: { saving: -1 } },
          { $limit: 12 },
          {
            $lookup: {
              from: "categories",
              localField: "category",
              foreignField: "_id",
              as: "category",
            },
          },
          { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        ])
      : [],

    Product.find({ isActive: true, isFeatured: true })
      .select(PRODUCT_FIELDS)
      .populate("category", "name slug")
      .limit(8)
      .lean(),
  ]);

  return (
    <main className="bg-background">
      {/* ── Hero ─────────────────────────────────────────────────────────
          Each banner has its headline, CTA and badges baked into the artwork,
          so the slider adds no overlay text on desktop — anything on top would
          collide with what's already there.

          Mobile can't show the wide crop: at 2.28:1 the baked-in type would be
          ~4px tall. So the phone gets a square crop framed on the products
          (handled inside HeroSlider), with the headline and CTA rendered as
          real text beneath it. Same message, actually readable, and the text
          stays selectable and translatable.

          Slides are configured in lib/heroSlides.ts. */}
      <section className="relative border-b border-hairline bg-background">
        <div className="relative">
          <HeroSlider fallbackHref={hero.ctaLink || "/shop"} />
          {/* Fades the square crop into the copy below it on phones. Sits over
              the dots but takes no pointer events, so they stay tappable. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background to-transparent md:hidden" />
        </div>

        {/* Mobile — real text under the slider */}
        <div className="md:hidden">
          <div className="-mt-8 flex flex-col items-center px-5 pb-12 text-center">
            <div className="mb-6 inline-flex items-center gap-2.5 border border-hairline bg-surface/80 px-4 py-1.5 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="dose text-[10px] uppercase tracking-[0.2em] text-muted">
                Third-party tested · Every batch
              </span>
            </div>

            <h1 className="text-balance font-display text-[2.5rem] font-extrabold leading-[0.92] tracking-tightest">
              {hero.title}
            </h1>

            {hero.subtitle && (
              <p className="mt-5 max-w-sm text-pretty text-[14.5px] leading-relaxed text-muted">
                {hero.subtitle}
              </p>
            )}

            <div className="mt-8 flex w-full flex-col gap-3">
              <Link
                href={hero.ctaLink || "/shop"}
                className="inline-flex w-full items-center justify-center gap-2 bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground"
              >
                {hero.ctaText || "Shop the range"}
                <LucideIcons.ArrowRight size={16} />
              </Link>
              <Link
                href="/shop"
                className="inline-flex w-full items-center justify-center gap-2 border border-hairline px-8 py-4 text-sm font-semibold"
              >
                <LucideIcons.FileText size={16} />
                See lab reports
              </Link>
            </div>

            <div className="mt-10 grid w-full max-w-sm grid-cols-3 divide-x divide-hairline border-t border-hairline">
              {[
                ["6000", "mg citrulline", "per serving"],
                ["100%", "batches", "lab tested"],
                ["0", "proprietary", "blends"],
              ].map(([figure, l1, l2]) => (
                <div key={figure} className="flex flex-col items-center gap-2 px-2 py-6">
                  <span className="dose text-2xl font-semibold leading-none text-primary">
                    {figure}
                  </span>
                  <span className="text-center text-[10.5px] leading-[1.35] text-muted">
                    {l1}
                    <br />
                    {l2}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust strip ─────────────────────────────────────────────────── */}
      {home.highlights.length > 0 && (
        <section className="border-b border-hairline bg-surface">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-hairline md:grid-cols-4">
            {home.highlights.map((h, i) => (
              <div
                key={i}
                className={`flex min-h-[80px] items-center gap-3 px-4 py-4 md:justify-center ${
                  i < 2 ? "border-b border-hairline md:border-b-0" : ""
                }`}
              >
                {/* Fixed box pins the glyph to the title's baseline; the cell's
                    min-height keeps all four equal even if a subtitle wraps. */}
                <span className="flex h-[18px] shrink-0 items-center self-start">
                  <Icon name={h.icon} className="text-primary" size={17} />
                </span>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold leading-[18px]">
                    {h.title}
                  </p>
                  {h.subtitle && (
                    <p className="mt-0.5 text-[11px] leading-[1.35] text-muted">
                      {h.subtitle}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Shop by Goal ──────────────────────────────────────────────────
          A compact icon strip rather than tiles: five goals on one line costs
          about 120px of height instead of 400px, so a visitor reaches the
          products without scrolling past a wall of boxes. */}
      {goals.length > 0 && (
        <section className="border-b border-hairline">
          <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
            <div className="mb-6 flex items-center justify-center gap-3">
              <span className="h-px w-6 bg-primary" />
              <h2 className="dose text-[11px] uppercase tracking-[0.2em] text-muted">
                {home.categoriesHeading}
              </h2>
              <span className="h-px w-6 bg-primary" />
            </div>

            {/* Scrolls horizontally on small screens instead of wrapping to a
                second row, which would defeat the point of the compact strip. */}
            <div className="rail -mx-5 flex justify-start gap-2 overflow-x-auto px-5 md:mx-0 md:justify-center md:gap-4 md:px-0">
              {goals.map((cat: any) => (
                <Link
                  key={String(cat._id)}
                  href={`/category/${cat.slug}`}
                  className="group flex w-[88px] shrink-0 flex-col items-center gap-2.5 py-2 md:w-[132px]"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-hairline bg-surface transition-all duration-300 group-hover:border-primary group-hover:bg-primary/10 md:h-16 md:w-16">
                    <Icon
                      name={GOAL_ICONS[cat.slug] ?? "Circle"}
                      size={24}
                      className="text-muted transition-colors group-hover:text-primary"
                    />
                  </span>
                  <span className="text-center text-[11px] font-medium leading-tight transition-colors group-hover:text-primary md:text-xs">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured grid ───────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
          <div className="mb-4 h-[3px] w-10 bg-primary" />
          <h2 className="mb-8 font-display text-2xl font-bold tracking-tightest md:text-4xl">
            {home.featuredHeading}
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {featured.map((p: any) => (
              <ProductCard key={String(p._id)} product={plain(p)} currency={currency} />
            ))}
          </div>
        </section>
      )}

      {/* ── Bestsellers rail ─────────────────────────────────────────── */}
      {home.bestsellers.enabled && (
        <ProductRail
          accent
          heading={home.bestsellers.heading}
          subheading={home.bestsellers.subheading}
          products={plain(bestsellers)}
          currency={currency}
          viewAllHref="/shop"
        />
      )}

      

      {/* ── Combos rail ─────────────────────────────────────────────────── */}
      {home.combos.enabled && (
        <div className="border-t border-hairline bg-surface/40">
          <ProductRail
            accent
            heading={home.combos.heading}
            subheading={home.combos.subheading}
            products={plain(combos)}
            currency={currency}
            viewAllHref={`/category/${home.comboCategorySlug}`}
          />
        </div>
      )}

      {/* ── Promo banners ───────────────────────────────────────────────── */}
      {home.banners.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-12 md:px-8">
          <div className="grid gap-4 md:grid-cols-2">
            {home.banners.map((b, i) => {
              const featuredBanner = i === 0 && home.banners.length % 2 === 1;
              const inner = (
                <div
                  className={`group relative overflow-hidden border border-hairline ${
                    featuredBanner ? "md:col-span-2 aspect-[16/6]" : "aspect-[16/9]"
                  }`}
                >
                  {b.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={b.image}
                      alt={b.heading}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-surface" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                    {b.heading && (
                      <h3 className="font-display text-2xl font-bold tracking-tightest md:text-3xl">
                        {b.heading}
                      </h3>
                    )}
                    {b.subheading && (
                      <p className="mt-1 max-w-md text-sm text-muted">{b.subheading}</p>
                    )}
                    {b.link && (
                      <span className="mt-4 inline-flex w-fit items-center gap-1.5 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all group-hover:gap-2.5">
                        Shop now
                        <LucideIcons.ArrowRight size={15} />
                      </span>
                    )}
                  </div>
                </div>
              );
              return b.link ? (
                <Link key={i} href={b.link}>
                  {inner}
                </Link>
              ) : (
                <div key={i}>{inner}</div>
              );
            })}
          </div>
        </section>
      )}

      {home.offers.enabled && (
        <div className="border-t border-hairline bg-surface/40">
          <ProductRail
            accent
            heading={home.offers.heading}
            subheading={home.offers.subheading}
            products={plain(offers)}
            currency={currency}
            viewAllHref="/shop"
          />
        </div>
      )}

      
    </main>
  );
}
