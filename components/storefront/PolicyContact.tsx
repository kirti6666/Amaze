import { Mail, MapPin, MessageCircleQuestion, Phone } from "lucide-react";
import type { SiteSettingsData } from "@/lib/site-settings";

/** "Still have questions?" card closing each policy page, fed from Site Settings → Contact. */
export function PolicyContact({ contact }: { contact: SiteSettingsData["contact"] }) {
  const hasContact = contact.email || contact.phone || contact.address;

  return (
    <section className="policy-contact" aria-labelledby="policy-contact-title">
      <span className="policy-contact-icon"><MessageCircleQuestion size={22} aria-hidden="true" /></span>
      <div>
        <h2 id="policy-contact-title">Still have questions?</h2>
        <p>Our support team is happy to help with orders, deliveries, returns and refunds.</p>
        {hasContact && (
          <ul>
            {contact.email && (
              <li><Mail size={15} aria-hidden="true" /><a href={`mailto:${contact.email}`}>{contact.email}</a></li>
            )}
            {contact.phone && (
              <li><Phone size={15} aria-hidden="true" /><a href={`tel:${contact.phone.replace(/\s+/g, "")}`}>{contact.phone}</a></li>
            )}
            {contact.address && (
              <li><MapPin size={15} aria-hidden="true" /><span>{contact.address}</span></li>
            )}
          </ul>
        )}
      </div>
    </section>
  );
}
