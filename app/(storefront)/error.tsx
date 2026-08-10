"use client";

// Storefront error boundary (Next.js App Router convention). Catches render/data
// errors in storefront routes and offers a retry instead of a blank screen.
import { useEffect } from "react";

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="max-w-xl mx-auto px-6 py-24 text-center">
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-muted mb-6">
        We hit an unexpected error loading this page. Please try again.
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-primary text-primary-foreground px-5 py-2.5"
      >
        Try again
      </button>
    </main>
  );
}
