import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { AnnouncementBar } from "@/components/storefront/AnnouncementBar";

/**
 * Storefront chrome lives here rather than in the root layout, so that it wraps
 * only the shopper-facing routes in this route group. /admin sits outside the
 * group and therefore renders without the announcement marquee, the shop header
 * and the marketing footer — the admin panel supplies its own shell instead.
 *
 * The flex column keeps the footer pinned below the fold on short pages.
 */
export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="storefront flex min-h-screen flex-col">
      <AnnouncementBar />
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
