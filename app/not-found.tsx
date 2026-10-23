import Link from "next/link";
import StorefrontLayout from "./(storefront)/layout";

// Unmatched URLs render at the root, outside the storefront route group, so wrap them in its chrome.
export default function NotFound() {
  return (
    <StorefrontLayout>
      <main className="max-w-xl mx-auto px-6 py-24 text-center">
        <p className="text-sm font-semibold tracking-[0.2em] text-primary">404</p>
        <h1 className="page-title mt-2 mb-2">Page not found</h1>
        <p className="text-muted mb-8">The page you are looking for has moved or no longer exists.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground">Go to homepage</Link>
          <Link href="/shop" className="rounded-md border border-hairline px-6 py-3 font-semibold">Browse products</Link>
        </div>
      </main>
    </StorefrontLayout>
  );
}
