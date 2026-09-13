import Link from "next/link";
import { Heart, UserRound, Search } from "lucide-react";
import { getServerUser } from "@/lib/middleware/getServerUser";
import { getSiteSettings } from "@/lib/site-settings";
import { storefrontAppearance } from "./appearance";
import { CartLink } from "./CartLink";
import { LogoutButton } from "./LogoutButton";
import { BrandLogo } from "./BrandLogo";
import { MobileNav } from "./MobileNav";

export async function Header() {
  const [user, saved] = await Promise.all([getServerUser(), getSiteSettings()]);
  const { brand, header } = storefrontAppearance(saved);
  return (
    <header className="store-header sticky top-0 z-30 border-b border-hairline bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8 md:py-5">
        <Link href="/" className="shrink-0" aria-label={brand.storeName}>
          <BrandLogo src={brand.logoUrl} name={brand.storeName} />
        </Link>
        <nav aria-label="Main navigation" className="hidden flex-1 flex-wrap items-center justify-center gap-x-6 gap-y-3 px-4 text-sm font-medium lg:flex">
          <Link href="/" className="hover:text-primary">Home</Link>
          {header.navLinks.map((l, i) => (
            <Link key={i} href={l.href || "#"} className="hover:text-primary">{l.label === "Shop" ? "All Products" : l.label}</Link>
          ))}
          <Link href="/#categories" className="hover:text-primary">Shop By Category</Link>
        </nav>
        <div className="hidden items-center gap-4 lg:flex">
          <Link href="/shop" aria-label="Search products" className="header-icon"><Search size={21} strokeWidth={1.6} /></Link>
          <Link href="/wishlist" aria-label="Wishlist" className="header-icon"><Heart size={21} strokeWidth={1.6} /></Link>
          <Link href={user ? (user.role === "admin" ? "/admin" : "/account") : "/login"}
            aria-label={user ? (user.role === "admin" ? "Admin" : "My Account") : "Login"} className="header-icon">
            <UserRound size={21} strokeWidth={1.6} />
          </Link>
          <CartLink />
          {user && <LogoutButton />}
        </div>
        <MobileNav navLinks={[
          { label: "Home", href: "/" },
          ...header.navLinks.map(l => ({label: l.label === "Shop" ? "All Products" : l.label, href: l.href || "#"})),
          { label: "Shop By Category", href: "/#categories" },
          { label: "Wishlist", href: "/wishlist" },
        ]} user={user ? {role: user.role} : null} />
      </div>
    </header>
  );
}
