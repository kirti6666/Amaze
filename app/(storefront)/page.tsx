import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Product, Category } from "@/models";
import { ProductCard } from "@/components/storefront/ProductCard";
import { HeroSlider } from "@/components/storefront/HeroSlider";
import { getSiteSettings } from "@/lib/site-settings";
import { storefrontAppearance } from "@/components/storefront/appearance";
import { homeCategories, beautyPreviews } from "@/components/storefront/home-content";

export const dynamic = "force-dynamic";
const fields = "title slug price discountPrice images category tags";
const plain = (value: unknown) => JSON.parse(JSON.stringify(value));
function ViewAll({ href }: { href: string }) {
  return <div className="home-view-all"><Link href={href}>View all <ArrowRight size={16} /></Link></div>;
}
export default async function HomePage() {
  await connectDB();
  const settings = storefrontAppearance(await getSiteSettings());
  const categories = await Category.find({ isActive: true }).select("_id slug").lean();
  const legacySlugs = ["strength-vitality", "stamina-energy", "mens-wellness", "sleep-recovery", "fertility", "combos-stacks"];
  const legacyIds = categories.filter(c => legacySlugs.includes(c.slug)).map(c => c._id);
  const beautyCategory = categories.find(c => c.slug === "fashion-and-beauty");
  const [featured, beauty] = await Promise.all([
    Product.find({ isActive: true, isFeatured: true, category: { $nin: legacyIds } }).select(fields).populate("category", "name slug").limit(4).lean(),
    beautyCategory ? Product.find({ isActive: true, category: beautyCategory._id }).select(fields).populate("category", "name slug").limit(4).lean() : [],
  ]);
  return <main className="store-home bg-background">
    <section aria-label="Welcome to Amaze Markets">
      <h1 className="sr-only">Everything you need, one amazing market</h1>
      <HeroSlider fallbackHref="/shop" />
    </section>
    {featured.length > 0 && <section className="home-section">
      <h2>Trending Now</h2>
      <div className="home-grid">{featured.map(p => <ProductCard key={String(p._id)} product={plain(p)} currency={settings.commerce.currencySymbol} />)}</div>
      <ViewAll href="/shop" />
    </section>}
    <section id="categories" className="home-section">
      <h2>Shop By Category</h2>
      <div className="home-grid category-grid">
        {homeCategories.map(c => <Link key={c.slug} href={`/shop?category=${c.slug}`} className="category-tile">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.image} alt={c.name} loading="lazy" width={400} height={400} />
          <div><span>{c.name}</span><ArrowRight size={20} aria-hidden="true" /></div>
        </Link>)}
      </div>
    </section>
    <section className="home-section beauty-section">
      <h2>Skin &amp; Beauty Essentials</h2>
      <div className="home-grid">
        {beauty.length > 0 ? beauty.map(p => <ProductCard key={String(p._id)} product={plain(p)} currency={settings.commerce.currencySymbol} />) : beautyPreviews.map(p => <article key={p.title} className="beauty-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.image} alt={p.title} loading="lazy" width={400} height={400} />
          <div><h3>{p.title}</h3><span>Coming soon</span></div>
        </article>)}
      </div>
      {beauty.length > 0 && <ViewAll href="/shop?category=fashion-and-beauty" />}
    </section>
  </main>;
}
