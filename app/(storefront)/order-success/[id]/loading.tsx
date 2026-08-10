import { OrderSummarySkeleton } from "@/components/ui/Skeleton";

export default function OrderSuccessLoading() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <OrderSummarySkeleton />
    </main>
  );
}
