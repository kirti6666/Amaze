"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "./ImageUploader";
import { VariantBuilder, VariantAttribute, VariantCombination } from "./VariantBuilder";

interface Category {
  _id: string;
  name: string;
}

interface InitialProductData {
  title?: string;
  description?: string;
  category?: string | { _id: string };
  price?: number;
  discountPrice?: number;
  sku?: string;
  stock?: number;
  tags?: string[];
  images?: string[];
  isFeatured?: boolean;
  isBestseller?: boolean;
  isActive?: boolean;
  variants?: VariantAttribute[];
  variantCombinations?: VariantCombination[];
}

interface ProductFormProps {
  categories: Category[];
  initialData?: InitialProductData;
  productId?: string;
}

export function ProductForm({ categories, initialData, productId }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(productId);

  const initialCategoryId =
    typeof initialData?.category === "object"
      ? initialData.category._id
      : initialData?.category ?? "";

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [category, setCategory] = useState(initialCategoryId);
  const [price, setPrice] = useState(initialData?.price?.toString() ?? "");
  const [discountPrice, setDiscountPrice] = useState(
    initialData?.discountPrice?.toString() ?? ""
  );
  const [sku, setSku] = useState(initialData?.sku ?? "");
  const [stock, setStock] = useState(initialData?.stock ?? 0);
  const [tags, setTags] = useState((initialData?.tags ?? []).join(", "));
  const [images, setImages] = useState<string[]>(initialData?.images ?? []);
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);
  const [isBestseller, setIsBestseller] = useState(initialData?.isBestseller ?? false);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const [hasVariants, setHasVariants] = useState((initialData?.variants?.length ?? 0) > 0);
  const [variants, setVariants] = useState<VariantAttribute[]>(initialData?.variants ?? []);
  const [combinations, setCombinations] = useState<VariantCombination[]>(
    initialData?.variantCombinations ?? []
  );

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!category) {
      setError("Please select a category");
      return;
    }
    if (images.length === 0) {
      setError("Please upload at least one image");
      return;
    }
    if (hasVariants && combinations.length === 0) {
      setError("Add at least one variant attribute, or turn off variants");
      return;
    }

    setSaving(true);

    const payload = {
      title,
      description,
      category,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      sku: sku || undefined,
      images,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      isFeatured,
      isBestseller,
      isActive,
      variants: hasVariants ? variants : [],
      variantCombinations: hasVariants ? combinations : [],
      stock: hasVariants ? 0 : Number(stock),
    };

    try {
      const res = await fetch(isEdit ? `/api/products/${productId}` : "/api/products", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save product");
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Price (₹)</label>
          <input
            required
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Discount Price (₹)</label>
          <input
            type="number"
            min={0}
            value={discountPrice}
            onChange={(e) => setDiscountPrice(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">SKU</label>
          <input
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Images</label>
        <ImageUploader images={images} onChange={setImages} />
      </div>

      <div className="border-t pt-4">
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={hasVariants}
            onChange={(e) => setHasVariants(e.target.checked)}
          />
          <span className="font-medium text-sm">
            This product has variants (size, color, etc.)
          </span>
        </label>

        {hasVariants ? (
          <VariantBuilder
            variants={variants}
            combinations={combinations}
            onVariantsChange={setVariants}
            onCombinationsChange={setCombinations}
          />
        ) : (
          <div>
            <label className="block text-sm font-medium mb-1">Stock</label>
            <input
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              className="w-32 rounded-md border px-3 py-2"
            />
          </div>
        )}
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
          />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isBestseller}
            onChange={(e) => setIsBestseller(e.target.checked)}
          />
          Bestseller
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Active (visible in store)
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-primary text-primary-foreground px-6 py-2 font-medium disabled:opacity-50"
      >
        {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
      </button>
    </form>
  );
}
