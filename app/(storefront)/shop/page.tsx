import { connectDB } from "@/lib/db";
import { Product, Category } from "@/models";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ShopFilters } from "@/components/storefront/ShopFilters";
import { getSiteSettings } from "@/lib/site-settings";

interface ShopPageProps {
  searchParams: {
    category?: string;
    search?: string;
    sort?: string;
    page?: string;
  };
}

const PAGE_SIZE = 12;

export const dynamic = "force-dynamic";

export default async function ShopPage({ searchParams }: ShopPageProps) {
  await connectDB();
  const { commerce } = await getSiteSettings();
  const currency = commerce.currencySymbol;

  const page = Math.max(1, Number(searchParams.page ?? 1));
  // Keep the original demo catalog in the database while the new import is paused.
  const legacyCategories = await Category.find({ slug: { $in: ["strength-vitality", "stamina-energy", "mens-wellness", "sleep-recovery", "fertility", "combos-stacks"] } }).select("_id").lean();
  const legacyIds = legacyCategories.map(c => c._id);
  const filter: Record<string, unknown> = { isActive: true, category: { $nin: legacyIds } };

  if (searchParams.category) {
    const cat = await Category.findOne({ slug: searchParams.category }).lean();
    filter.category = cat ? (cat as { _id: unknown })._id : null;
  }
  if (searchParams.search) {
    filter.$text = { $search: searchParams.search };
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
  };
  const sort = sortMap[searchParams.sort ?? "newest"] ?? sortMap.newest;

  const [products, total, categories] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sort)
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    Product.countDocuments(filter),
    Category.find({ isActive: true, _id: { $nin: legacyIds } }).sort({ name: 1 }).lean(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildPageUrl(n: number) {
    const params = new URLSearchParams();
    if (searchParams.category) params.set("category", searchParams.category);
    if (searchParams.search) params.set("search", searchParams.search);
    if (searchParams.sort) params.set("sort", searchParams.sort);
    params.set("page", String(n));
    return `/shop?${params.toString()}`;
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 md:px-8">
      <h1 className="sr-only">All Products</h1>

      <ShopFilters
        categories={JSON.parse(JSON.stringify(categories))}
        currentCategory={searchParams.category}
        currentSearch={searchParams.search}
        currentSort={searchParams.sort}
      />

      {products.length === 0 ? (
        <p className="text-muted mt-10">No products found.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8">
            {products.map((p) => (
              <ProductCard key={String(p._id)} product={JSON.parse(JSON.stringify(p))} currency={currency} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <a
                  key={n}
                  href={buildPageUrl(n)}
                  className={`px-3 py-1 rounded-md border text-sm ${n === page ? "bg-primary text-primary-foreground" : ""
                    }`}
                >
                  {n}
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
