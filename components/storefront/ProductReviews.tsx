"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

interface ReviewUser {
  _id: string;
  name: string;
}
interface Review {
  _id: string;
  rating: number;
  comment?: string;
  user?: ReviewUser | null;
  createdAt: string;
}
interface Summary {
  average: number;
  count: number;
  distribution: Record<number, number>;
}

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= Math.round(value) ? "fill-warning text-warning" : "text-muted"}
        />
      ))}
    </span>
  );
}

export function ProductReviews({ productId }: { productId: string }) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<Summary>({ average: 0, count: 0, distribution: {} });
  const [loading, setLoading] = useState(true);

  // Write-review form state
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?product=${productId}`);
      const data = await res.json();
      setReviews(data.reviews ?? []);
      if (data.summary) setSummary(data.summary);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function submit() {
    if (rating < 1) {
      setMessage({ type: "err", text: "Please pick a star rating." });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: productId, rating, comment }),
      });
      if (res.status === 401) {
        router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error || "Failed to submit review" });
        return;
      }
      setMessage({ type: "ok", text: "Thanks! Your review has been posted." });
      setComment("");
      setRating(0);
      await load();
    } catch {
      setMessage({ type: "err", text: "Something went wrong" });
    } finally {
      setSubmitting(false);
    }
  }

  const maxDist = Math.max(1, ...Object.values(summary.distribution || {}));

  return (
    <section className="mt-16 border-t pt-10">
      <h2 className="text-xl font-bold mb-6">Ratings & Reviews</h2>

      {/* Summary */}
      <div className="flex flex-col sm:flex-row gap-8 mb-10">
        <div className="text-center sm:text-left">
          <div className="text-4xl font-bold">{summary.average.toFixed(1)}</div>
          <Stars value={summary.average} size={18} />
          <p className="text-sm text-muted mt-1">
            {summary.count} {summary.count === 1 ? "review" : "reviews"}
          </p>
        </div>
        <div className="flex-1 max-w-sm space-y-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary.distribution?.[star] ?? 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-muted">{star}</span>
                <Star size={12} className="fill-warning text-warning" />
                <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
                  <div
                    className="h-full bg-warning"
                    style={{ width: `${(count / maxDist) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right text-muted">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write a review */}
      <div className="rounded-lg border p-5 mb-10">
        <h3 className="font-medium mb-3">Write a review</h3>
        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              className="p-0.5"
            >
              <Star
                size={24}
                className={
                  n <= (hover || rating)
                    ? "fill-warning text-warning"
                    : "text-muted"
                }
              />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Share your thoughts about this product (optional)"
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
        {message && (
          <p className={`text-sm mt-2 ${message.type === "ok" ? "text-success" : "text-danger"}`}>
            {message.text}
          </p>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="mt-3 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit review"}
        </button>
      </div>

      {/* List */}
      {loading ? (
        <p className="text-muted">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-muted">No reviews yet. Be the first to review this product!</p>
      ) : (
        <ul className="space-y-6">
          {reviews.map((r) => (
            <li key={r._id} className="border-b pb-6 last:border-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{r.user?.name ?? "Anonymous"}</span>
                <span className="text-xs text-muted">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
              <Stars value={r.rating} size={14} />
              {r.comment && <p className="text-sm text-muted mt-2">{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
