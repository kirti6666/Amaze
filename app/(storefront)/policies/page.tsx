import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { POLICIES } from "@/lib/policies";
import { PolicyIcon } from "@/components/storefront/PolicyIcon";
import { PolicyContact } from "@/components/storefront/PolicyContact";
import { getSiteSettings } from "@/lib/site-settings";
import { storefrontAppearance } from "@/components/storefront/appearance";

export const metadata: Metadata = {
  title: "Store Policies",
  description: "Privacy, terms, shipping, returns, refunds and cancellations — everything about shopping with us.",
};

export const dynamic = "force-dynamic";

export default async function PoliciesIndexPage() {
  const { brand, contact } = storefrontAppearance(await getSiteSettings());

  return (
    <>
      <header className="policy-hero">
        <p className="policy-eyebrow">Help &amp; policies</p>
        <h1>Store Policies</h1>
        <p>
          Everything you need to know about shopping with {brand.storeName} — how we handle your data,
          deliver your orders and take care of returns, refunds and cancellations.
        </p>
      </header>

      <div className="policy-cards">
        {POLICIES.map((p) => (
          <Link key={p.slug} href={`/policies/${p.slug}`} className="policy-card">
            <span className="policy-card-icon"><PolicyIcon name={p.icon} size={22} /></span>
            <h2>{p.title}</h2>
            <p>{p.summary}</p>
            <span className="policy-card-cta">Read policy <ArrowRight size={14} aria-hidden="true" /></span>
          </Link>
        ))}
      </div>

      <PolicyContact contact={contact} />
    </>
  );
}
