import Link from "next/link";
import { Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";

/**
 * Store guarantees shown on the homepage (full strip) and product pages
 * (compact). Every claim here is backed by something real — keep it that way:
 *  - Secure payments: HTTPS + PCI-DSS payment gateway (card data never touches us)
 *  - Free delivery: lib/site-settings applyFreeShipping() makes every order free
 *  - 7-day returns: /policies/return-refund-policy
 *  - Support: /contact
 * If a policy changes, update the matching badge.
 */
const BADGES = [
  { Icon: ShieldCheck, title: "100% Secure Payments", text: "Encrypted checkout via trusted gateways", href: "/policies/privacy-policy" },
  { Icon: Truck, title: "Free Delivery", text: "On every order, across India", href: "/policies/shipping-policy" },
  { Icon: RotateCcw, title: "Easy 7-Day Returns", text: "Hassle-free returns & refunds", href: "/policies/return-refund-policy" },
  { Icon: Headphones, title: "Dedicated Support", text: "Real people, here to help", href: "/contact" },
];

export function TrustBadges({ variant = "strip" }: { variant?: "strip" | "compact" }) {
  return (
    <ul className={`trust-badges trust-badges--${variant}`} aria-label="Our promise">
      {BADGES.map(({ Icon, title, text, href }) => (
        <li key={title}>
          <Link href={href}>
            <span className="trust-icon"><Icon size={variant === "strip" ? 24 : 18} aria-hidden="true" /></span>
            <span>
              <strong>{title}</strong>
              <small>{text}</small>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
