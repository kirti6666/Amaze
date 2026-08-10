// Shown while the shop page streams in (Next.js App Router convention file).
export default function ShopLoading() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-10 md:px-8">
      <div className="h-8 w-40 bg-surface rounded animate-pulse mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square rounded-lg bg-surface mb-3" />
            <div className="h-4 w-3/4 bg-surface rounded mb-2" />
            <div className="h-4 w-1/3 bg-surface rounded" />
          </div>
        ))}
      </div>
    </main>
  );
}
