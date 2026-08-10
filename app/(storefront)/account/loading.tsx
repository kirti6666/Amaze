import { Skeleton } from "@/components/ui/Skeleton";

export default function AccountLoading() {
  return (
    <main className="p-12 space-y-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-4 w-52" />
      <div className="flex gap-4 mt-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-20" />
      </div>
    </main>
  );
}
