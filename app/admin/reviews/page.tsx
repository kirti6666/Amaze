"use client";

import { useEffect, useState } from "react";
import { Star, Trash2, Eye, EyeOff } from "lucide-react";
import { CardListSkeleton } from "@/components/ui/Skeleton";

interface Review {
  _id: string;
  rating: number;
  comment?: string;
  isApproved: boolean;
  createdAt: string;
  user?: { name: string; email: string } | null;
  product?: { title: string; slug: string } | null;
}

const FILTERS = [
  { key: "", label: "All" },
  { key: "approved", label: "Visible" },
  { key: "pending", label: "Hidden" },
] as const;

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams({ all: "true", limit: "100" });
    if (filter) params.set("status", filter);
    const res = await fetch(`/api/reviews?${params.toString()}`);
    const data = await res.json();
    setReviews(data.reviews ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function setApproved(id: string, isApproved: boolean) {
    setBusyId(id);
    await fetch(`/api/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved }),
    });
    await load();
    setBusyId(null);
  }

  async function remove(id: string) {
    if (!confirm("Delete this review permanently?")) return;
    setBusyId(id);
    await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    await load();
    setBusyId(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reviews</h1>
        <div className="flex gap-1 text-sm">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-md border ${
                filter === f.key ? "bg-primary text-primary-foreground" : "hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <CardListSkeleton count={5} />
      ) : reviews.length === 0 ? (
        <p className="text-gray-400">No reviews found.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r._id} className="border rounded-md p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          size={14}
                          className={n <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                        />
                      ))}
                    </span>
                    {!r.isApproved && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="font-medium mt-1">{r.product?.title ?? "Unknown product"}</p>
                  <p className="text-gray-500">
                    {r.user?.name ?? "Anonymous"} · {r.user?.email}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {r.isApproved ? (
                    <button
                      onClick={() => setApproved(r._id, false)}
                      disabled={busyId === r._id}
                      className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-50"
                      title="Hide from storefront"
                    >
                      <EyeOff size={14} /> Hide
                    </button>
                  ) : (
                    <button
                      onClick={() => setApproved(r._id, true)}
                      disabled={busyId === r._id}
                      className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-50"
                      title="Show on storefront"
                    >
                      <Eye size={14} /> Approve
                    </button>
                  )}
                  <button
                    onClick={() => remove(r._id)}
                    disabled={busyId === r._id}
                    className="inline-flex items-center gap-1 rounded-md border border-red-200 text-red-600 px-2.5 py-1.5 text-xs hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>

              {r.comment && <p className="text-gray-600 mt-2 border-t pt-2">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
