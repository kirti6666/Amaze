import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { getSiteSettings } from "@/lib/site-settings";

/**
 * Storefront footer — entirely driven by Site Settings (about text, link
 * columns, contact details, social links, copyright). Add/remove/reorder any
 * of it from /admin/settings → Footer / Contact & Social.
 *
 * Deliberately compact: link columns go 2-up on mobile rather than stacking,
 * which is what makes a 4-column footer tower on a phone. Headings are set as
 * small mono labels instead of body-weight headings so they read as structure
 * without claiming vertical space.
 */
export async function Footer() {
  const settings = await getSiteSettings();
  const { brand, footer, contact, social } = settings;

  const socials = [
    { url: social.facebook, Icon: Facebook, label: "Facebook" },
    { url: social.instagram, Icon: Instagram, label: "Instagram" },
    { url: social.twitter, Icon: Twitter, label: "Twitter" },
    { url: social.youtube, Icon: Youtube, label: "YouTube" },
  ].filter((s) => s.url.trim());

  const copyright = (footer.copyrightText || "").replace(
    "{year}",
    String(new Date().getFullYear())
  );

  const hasContact = contact.email || contact.phone || contact.address;
  const heading = "dose mb-3 text-[10px] uppercase tracking-[0.16em] text-muted";
  const linkCls = "text-[12.5px] text-muted transition-colors hover:text-foreground";

  return (
    <footer className="border-t border-hairline bg-surface">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-8 px-5 py-10 md:grid-cols-4 md:gap-x-8 md:px-8">
        {/* Brand — spans the full width on mobile so the columns below pair up */}
        <div className="col-span-2 md:col-span-1">
          <p className="font-display text-lg font-extrabold tracking-tightest">
            {brand.storeName}
          </p>
          {footer.about && (
            <p className="mt-2 max-w-xs text-[12.5px] leading-[1.6] text-muted">
              {footer.about}
            </p>
          )}
          {socials.length > 0 && (
            <div className="mt-4 flex gap-4">
              {socials.map(({ url, Icon, label }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="text-muted transition-colors hover:text-primary"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          )}
        </div>

        {footer.columns.map((col, i) => (
          <div key={i}>
            {col.title && <p className={heading}>{col.title}</p>}
            <ul className="space-y-1.5">
              {col.links.map((lnk, j) => (
                <li key={j}>
                  <Link href={lnk.href || "#"} className={linkCls}>
                    {lnk.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {hasContact && (
          <div>
            <p className={heading}>Contact</p>
            <ul className="space-y-1.5 text-[12.5px] text-muted">
              {contact.email && (
                <li className="flex items-center gap-2">
                  <Mail size={13} className="shrink-0" />
                  <span className="truncate">{contact.email}</span>
                </li>
              )}
              {contact.phone && (
                <li className="flex items-center gap-2">
                  <Phone size={13} className="shrink-0" />
                  {contact.phone}
                </li>
              )}
              {contact.address && (
                <li className="flex items-start gap-2">
                  <MapPin size={13} className="mt-0.5 shrink-0" />
                  <span className="leading-[1.5]">{contact.address}</span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {copyright && (
        <div className="border-t border-hairline">
          <p className="mx-auto max-w-7xl px-5 py-3.5 text-center text-[10.5px] leading-[1.5] text-muted md:px-8">
            {copyright}
          </p>
        </div>
      )}
    </footer>
  );
}
