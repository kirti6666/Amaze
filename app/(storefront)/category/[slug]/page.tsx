import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Product, Category } from "@/models";
import { ProductCard } from "@/components/storefront/ProductCard";
import { getSiteSettings } from "@/lib/site-settings";
import { InferSchemaType } from "mongoose";
import { ICategory } from "@/models/Category";

interface CategoryPageProps {
  params: { slug: string };
  searchParams: { page?: string };
}

type CategoryType = InferSchemaType<typeof Category>;


const PAGE_SIZE = 12;

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  await connectDB();
  const { commerce } = await getSiteSettings();
  const currency = commerce.currencySymbol;

  const category = await Category.findOne({ slug: params.slug, isActive: true }).lean<ICategory>();
  if (!category) notFound();

  const categoryId = (category as { _id: unknown })._id;
  const page = Math.max(1, Number(searchParams.page ?? 1));

  const [products, total] = await Promise.all([
    Product.find({ category: categoryId, isActive: true })
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    Product.countDocuments({ category: categoryId, isActive: true }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 md:px-8">
      <div className="collection-heading"><h1>{(category as { name: string }).name}</h1><p>{total} products</p></div>

      {products.length === 0 ? (
        <p className="text-muted">No products in this category yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => (
              <ProductCard key={String(p._id)} product={JSON.parse(JSON.stringify(p))} currency={currency} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <a
                  key={n}
                  href={`/category/${params.slug}?page=${n}`}
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
