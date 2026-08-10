import Link from "next/link";
import { getServerUser } from "@/lib/middleware/getServerUser";
import { getSiteSettings } from "@/lib/site-settings";
import { CartLink } from "./CartLink";
import { LogoutButton } from "./LogoutButton";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";

export async function Header() {
  const [user, settings] = await Promise.all([getServerUser(), getSiteSettings()]);
  const { brand, header } = settings;

  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* Container matches the site's canonical shell — max-w-7xl px-5 md:px-8
          — the same one the homepage sections, product rails and footer use.
          It was max-w-6xl px-5 md:px-6, which put the logo 64px inside the
          content axis of everything below it. */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 md:px-8 md:py-4">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label={brand.storeName}>
          {brand.logoUrl ? (
            // An uploaded logo in Site Settings still wins — the drawn lockup is
            // the fallback, not an override.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brand.logoUrl}
              alt={brand.storeName}
              className="h-8 w-auto object-contain md:h-9"
            />
          ) : (
            <Logo
              storeName={brand.storeName}
              // Only the first clause — the full tagline is a sentence, and at
              // lockup size anything longer than ~2 words overruns the wordmark.
              tagline={brand.tagline?.split(".")[0]}
              markClassName="h-8 w-8 md:h-9 md:w-9"
              wordClassName="text-[21px] md:text-2xl"
            />
          )}
        </Link>

        {/* Desktop nav — unchanged behaviour, just gated to md and up. */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {header.navLinks.map((l, i) => (
            <Link key={i} href={l.href || "#"} className="hover:underline">
              {l.label}
            </Link>
          ))}
          <CartLink />
          {user ? (
            <>
              <Link
                href={user.role === "admin" ? "/admin" : "/account"}
                className="hover:underline"
              >
                {user.role === "admin" ? "Admin" : "My Account"}
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link href="/login" className="hover:underline">
              Login
            </Link>
          )}
        </nav>

        {/* Mobile — same destinations, moved behind a hamburger so the labels
            stop colliding with the logo on narrow screens. */}
        <MobileNav
          navLinks={header.navLinks.map((l) => ({
            label: l.label,
            href: l.href || "#",
          }))}
          user={user ? { role: user.role } : null}
        />
      </div>
    </header>
  );
}
