import { ProductGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function CategoryLoading() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-10 md:px-8">
      <Skeleton className="h-8 w-48 mb-6" />
      <ProductGridSkeleton count={8} />
    </main>
  );
}
