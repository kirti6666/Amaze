import { Skeleton } from "@/components/ui/Skeleton";

export default function EditProductLoading() {
  return (
    <div className="space-y-4 max-w-2xl">
      <Skeleton className="h-8 w-48 mb-2" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}
