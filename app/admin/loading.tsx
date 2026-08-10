// Admin section loading skeleton.
export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 bg-gray-100 rounded mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded" />
        ))}
      </div>
    </div>
  );
}
