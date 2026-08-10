import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Category, Product } from "@/models";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  await connectDB();
  const [categories, product] = await Promise.all([
    Category.find({ isActive: true }).sort({ name: 1 }).lean(),
    Product.findById(params.id).lean(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ProductForm
        categories={JSON.parse(JSON.stringify(categories))}
        initialData={JSON.parse(JSON.stringify(product))}
        productId={params.id}
      />
    </div>
  );
}
