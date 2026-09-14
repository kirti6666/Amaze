import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Product } from "@/models";
import { ProductDetailClient } from "@/components/storefront/ProductDetailClient";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ProductReviews } from "@/components/storefront/ProductReviews";
import { IProduct } from "@/models/Product";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  await connectDB();
  const p = await Product.findOne({ slug: params.slug, isActive: true })
    .select("title description images").lean<{ title: string; description: string; images: string[] }>();
  if (!p) return { title: "Product not found" };
  return {
    title: p.title,
    description: p.description?.slice(0, 160),
    openGraph: { title: p.title, images: p.images?.[0] ? [p.images[0]] : [] },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  await connectDB();

  const product = await Product.findOne({ slug: params.slug, isActive: true })
    .populate("category", "name slug")
    .lean<IProduct>();

  if (!product) notFound();

  const categoryId = (product as { category: { _id: unknown } }).category?._id;
  const productId = (product as { _id: unknown })._id;

  const related = categoryId
    ? await Product.find({
        category: categoryId,
        _id: { $ne: productId },
        isActive: true,
      })
        .limit(4)
        .lean()
    : [];

  return (
    <main className="product-page mx-auto max-w-7xl px-5 py-10 md:px-8">
      <ProductDetailClient product={JSON.parse(JSON.stringify(product))} />
      <ProductReviews productId={String((product as { _id: unknown })._id)} />
      {related.length > 0 && (
        <section className="detail-related mt-10">
          <h2 className="text-xl font-bold mb-6">You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={String(p._id)} product={JSON.parse(JSON.stringify(p))} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
