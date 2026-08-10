"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface ShopFiltersProps {
  categories: Category[];
  currentCategory?: string;
  currentSearch?: string;
  currentSort?: string;
}

export function ShopFilters({
  categories,
  currentCategory,
  currentSearch,
  currentSort,
}: ShopFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch ?? "");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // reset pagination whenever a filter changes
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParam("search", search);
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm w-56"
        />
        <button type="submit" className="rounded-md border px-3 py-2 text-sm">
          Search
        </button>
      </form>

      <select
        value={currentCategory ?? ""}
        onChange={(e) => updateParam("category", e.target.value)}
        className="rounded-md border px-3 py-2 text-sm"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c._id} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        value={currentSort ?? "newest"}
        onChange={(e) => updateParam("sort", e.target.value)}
        className="rounded-md border px-3 py-2 text-sm"
      >
        <option value="newest">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  );
}
