// Product detail loading skeleton.
export default function ProductLoading() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-10 md:px-8">
      <div className="grid md:grid-cols-2 gap-10 animate-pulse">
        <div className="aspect-square rounded-lg bg-surface" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 bg-surface rounded" />
          <div className="h-6 w-1/4 bg-surface rounded" />
          <div className="h-4 w-full bg-surface rounded" />
          <div className="h-4 w-5/6 bg-surface rounded" />
          <div className="h-11 w-40 bg-surface rounded mt-6" />
        </div>
      </div>
    </main>
  );
}
