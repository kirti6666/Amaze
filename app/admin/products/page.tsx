"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";

interface Product {
  _id: string;
  title: string;
  price: number;
  stock: number;
  variants: { name: string }[];
  category: { name: string } | null;
  isActive: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    setLoading(true);
    const res = await fetch("/api/products?all=true&limit=100");
    const data = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) loadProducts();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm"
        >
          + New Product
        </Link>
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : (
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-2 border-b">Title</th>
              <th className="p-2 border-b">Category</th>
              <th className="p-2 border-b">Price</th>
              <th className="p-2 border-b">Stock/Variants</th>
              <th className="p-2 border-b">Status</th>
              <th className="p-2 border-b"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-b">
                <td className="p-2">{p.title}</td>
                <td className="p-2 text-gray-500">{p.category?.name ?? "—"}</td>
                <td className="p-2">₹{p.price}</td>
                <td className="p-2">
                  {p.variants?.length > 0 ? `${p.variants.length} variant attrs` : p.stock}
                </td>
                <td className="p-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${p.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                      }`}
                  >
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-2 text-right space-x-2">
                  <Link
                    href={`/admin/products/${p._id}/edit`}
                    className="text-blue-500 hover:text-blue-700 inline-block align-middle"
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="text-red-500 hover:text-red-700 align-middle"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
