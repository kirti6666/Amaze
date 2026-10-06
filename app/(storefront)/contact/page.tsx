import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Mail, MapPin, PackageSearch, Phone, RotateCcw, Truck, CircleX } from "lucide-react";
import { getSiteSettings } from "@/lib/site-settings";
import { storefrontAppearance } from "@/components/storefront/appearance";
import { ContactForm } from "@/components/storefront/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Questions about an order, a product, delivery or returns? Get in touch with our team.",
};

export const dynamic = "force-dynamic";

const QUICK_HELP = [
  { href: "/account/orders", label: "Track my order", Icon: PackageSearch },
  { href: "/policies/shipping-policy", label: "Delivery times", Icon: Truck },
  { href: "/policies/return-refund-policy", label: "Returns & refunds", Icon: RotateCcw },
  { href: "/policies/cancellation-policy", label: "Cancel an order", Icon: CircleX },
];

export default async function ContactPage() {
  const { contact } = storefrontAppearance(await getSiteSettings());

  return (
    <main className="info-page">
      <header className="policy-hero">
        <p className="policy-eyebrow">We&apos;re here to help</p>
        <h1>Contact Us</h1>
        <p>Questions about an order, a product, delivery or returns? Send us a message and our team will get back to you.</p>
      </header>

      <div className="contact-layout">
        <aside className="contact-side">
          {(contact.email || contact.phone || contact.address) && (
            <ul className="contact-cards">
              {contact.email && (
                <li>
                  <span className="contact-card-icon"><Mail size={20} aria-hidden="true" /></span>
                  <div><p>Email us</p><a href={`mailto:${contact.email}`}>{contact.email}</a></div>
                </li>
              )}
              {contact.phone && (
                <li>
                  <span className="contact-card-icon"><Phone size={20} aria-hidden="true" /></span>
                  <div><p>Call us</p><a href={`tel:${contact.phone.replace(/\s+/g, "")}`}>{contact.phone}</a></div>
                </li>
              )}
              {contact.address && (
                <li>
                  <span className="contact-card-icon"><MapPin size={20} aria-hidden="true" /></span>
                  <div><p>Visit / write to us</p><address>{contact.address}</address></div>
                </li>
              )}
            </ul>
          )}

          <div className="contact-quick">
            <h2>Quick help</h2>
            <ul>
              {QUICK_HELP.map(({ href, label, Icon }) => (
                <li key={href}>
                  <Link href={href}>
                    <Icon size={17} aria-hidden="true" />
                    <span>{label}</span>
                    <ChevronRight size={16} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="contact-main" aria-labelledby="contact-form-title">
          <h2 id="contact-form-title">Send us a message</h2>
          <p>Fill in the form and we&apos;ll reply by email. Include your order number if it&apos;s about an order.</p>
          <ContactForm fallbackEmail={contact.email} fallbackPhone={contact.phone} />
        </section>
      </div>
    </main>
  );
}
