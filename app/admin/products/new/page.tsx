import { connectDB } from "@/lib/db";
import { Category } from "@/models";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  await connectDB();
  const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New Product</h1>
      <ProductForm categories={JSON.parse(JSON.stringify(categories))} />
    </div>
  );
}
