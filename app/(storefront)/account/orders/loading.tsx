import { CardListSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function AccountOrdersLoading() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <Skeleton className="h-8 w-40 mb-6" />
      <CardListSkeleton count={4} />
    </main>
  );
}
