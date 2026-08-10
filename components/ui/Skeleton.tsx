// Reusable skeleton loaders. Pure presentational markup (no hooks / no "use client"),
// so these can be used BOTH inside server `loading.tsx` files AND inside client
// pages' own loading state. All animate via Tailwind's `animate-pulse`.

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-surface ${className}`} />;
}

/** A single product card placeholder (image + two text lines). */
export function ProductCardSkeleton() {
  return (
    <div>
      <div className="aspect-square rounded-lg bg-surface animate-pulse mb-3" />
      <div className="h-4 w-3/4 bg-surface rounded animate-pulse mb-2" />
      <div className="h-4 w-1/3 bg-surface rounded animate-pulse" />
    </div>
  );
}

/** A responsive grid of product card placeholders. */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Admin table placeholder (header row + N body rows). */
export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full border rounded-md overflow-hidden">
      <div className="flex bg-surface border-b">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="flex-1 p-3">
            <div className="h-3 w-2/3 bg-hairline rounded animate-pulse" />
          </div>
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex border-b last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="flex-1 p-3">
              <div className="h-4 w-3/4 bg-surface rounded animate-pulse" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Stacked "card" placeholders — for admin order/review lists. */
export function CardListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-md p-4">
          <div className="flex justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 bg-surface rounded animate-pulse" />
              <div className="h-4 w-40 bg-surface rounded animate-pulse" />
              <div className="h-3 w-32 bg-surface rounded animate-pulse" />
            </div>
            <div className="h-6 w-20 bg-surface rounded-full animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Product detail placeholder (gallery + info column). */
export function ProductDetailSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-10">
      <div className="aspect-square rounded-lg bg-surface animate-pulse" />
      <div className="space-y-4">
        <div className="h-8 w-2/3 bg-surface rounded animate-pulse" />
        <div className="h-6 w-1/4 bg-surface rounded animate-pulse" />
        <div className="h-4 w-full bg-surface rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-surface rounded animate-pulse" />
        <div className="h-4 w-4/6 bg-surface rounded animate-pulse" />
        <div className="h-11 w-44 bg-surface rounded animate-pulse mt-6" />
      </div>
    </div>
  );
}

/** Order summary placeholder (order-success / order detail pages). */
export function OrderSummarySkeleton() {
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="h-7 w-48 bg-surface rounded animate-pulse" />
      <div className="border rounded-md p-4 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-40 bg-surface rounded animate-pulse" />
            <div className="h-4 w-16 bg-surface rounded animate-pulse" />
          </div>
        ))}
        <div className="border-t pt-3 flex justify-between">
          <div className="h-5 w-20 bg-surface rounded animate-pulse" />
          <div className="h-5 w-24 bg-surface rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/** Generic vertical list of text-line placeholders. */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 bg-surface rounded animate-pulse" />
      ))}
    </div>
  );
}

/** Analytics dashboard placeholder (KPI cards + chart blocks). */
export function AnalyticsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="h-3 w-20 bg-surface rounded animate-pulse mb-3" />
            <div className="h-7 w-16 bg-surface rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border p-5">
        <div className="h-40 bg-surface rounded animate-pulse" />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-48 border rounded-lg bg-surface animate-pulse" />
        <div className="h-48 border rounded-lg bg-surface animate-pulse" />
      </div>
    </div>
  );
}
