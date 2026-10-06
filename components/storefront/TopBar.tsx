import { Mail, Phone, Truck } from "lucide-react";
import { getSiteSettings } from "@/lib/site-settings";
import { storefrontAppearance } from "./appearance";
import { CurrencySwitcher } from "./CurrencySwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";

/**
 * Slim utility bar above the main header (desktop only — on phones the same
 * controls live at the bottom of the slide-in menu). Left: store contact
 * details from Site Settings, or a delivery promise when none are set.
 * Right: language and currency pickers.
 */
export async function TopBar() {
  const { contact } = storefrontAppearance(await getSiteSettings());

  return (
    <div className="store-topbar hidden border-b border-hairline lg:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-8 py-1.5 text-xs text-muted">
        <div className="flex items-center gap-5">
          {contact.phone || contact.email ? (
            <>
              {contact.phone && (
                <a href={`tel:${contact.phone.replace(/\s+/g, "")}`} className="flex items-center gap-1.5 hover:text-primary">
                  <Phone size={13} aria-hidden="true" /> {contact.phone}
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 hover:text-primary">
                  <Mail size={13} aria-hidden="true" /> {contact.email}
                </a>
              )}
            </>
          ) : (
            <span className="flex items-center gap-1.5">
              <Truck size={13} aria-hidden="true" /> Free delivery on all orders across India
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <CurrencySwitcher />
        </div>
      </div>
    </div>
  );
}
