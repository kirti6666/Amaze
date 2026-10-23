import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, MapPin, Package, ShoppingBag, ChevronRight } from "lucide-react";
import { getServerUser } from "@/lib/middleware/getServerUser";

const LINKS = [
  { href: "/account/orders", Icon: Package, title: "Orders", text: "Track orders and download invoices" },
  { href: "/account/addresses", Icon: MapPin, title: "Addresses", text: "Save delivery addresses for checkout" },
  { href: "/account/wishlist", Icon: Heart, title: "Wishlist", text: "Products you have saved for later" },
  { href: "/cart", Icon: ShoppingBag, title: "Cart", text: "Review items and continue to checkout" },
];

export default async function AccountPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  return (
    <main className="account-page">
      <div className="account-hero">
        <span className="account-avatar" aria-hidden="true">{user.email.charAt(0).toUpperCase()}</span>
        <div>
          <h1 className="page-title">My Account</h1>
          <p>{user.email}</p>
        </div>
      </div>

      <ul className="account-links">
        {LINKS.map(({ href, Icon, title, text }) => (
          <li key={href}>
            <Link href={href}>
              <span className="account-link-icon"><Icon size={22} aria-hidden="true" /></span>
              <span className="account-link-text"><strong>{title}</strong><small>{text}</small></span>
              <ChevronRight size={18} aria-hidden="true" className="account-link-arrow" />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
