import { OrderSummarySkeleton } from "@/components/ui/Skeleton";

export default function OrderDetailLoading() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <OrderSummarySkeleton />
    </main>
  );
}
