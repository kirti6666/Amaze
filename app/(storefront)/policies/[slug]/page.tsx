import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, CheckCircle2, ChevronRight } from "lucide-react";
import { POLICIES, getPolicy, type PolicyContext } from "@/lib/policies";
import { PolicyIcon } from "@/components/storefront/PolicyIcon";
import { PolicyContact } from "@/components/storefront/PolicyContact";
import { getSiteSettings } from "@/lib/site-settings";
import { storefrontAppearance } from "@/components/storefront/appearance";

interface PolicyPageProps {
  params: { slug: string };
}

// Store name and contact details come from Site Settings, so render per request
// (like the rest of the storefront) to reflect admin edits immediately.
export const dynamic = "force-dynamic";

export function generateMetadata({ params }: PolicyPageProps): Metadata {
  const policy = getPolicy(params.slug);
  if (!policy) return {};
  return { title: policy.title, description: policy.summary };
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const policy = getPolicy(params.slug);
  if (!policy) notFound();

  const { brand, contact } = storefrontAppearance(await getSiteSettings());
  const ctx: PolicyContext = { store: brand.storeName, ...contact };
  const sections = policy.sections(ctx);

  const index = POLICIES.findIndex((p) => p.slug === policy.slug);
  const next = POLICIES[(index + 1) % POLICIES.length];

  return (
    <article className="policy-article">
      <nav className="policy-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <ChevronRight size={13} aria-hidden="true" />
        <Link href="/policies">Policies</Link>
        <ChevronRight size={13} aria-hidden="true" />
        <span aria-current="page">{policy.title}</span>
      </nav>

      <header className="policy-hero">
        <span className="policy-hero-icon"><PolicyIcon name={policy.icon} size={24} /></span>
        <h1>{policy.title}</h1>
        <p>{policy.summary}</p>
        <p className="policy-updated">
          <CalendarDays size={14} aria-hidden="true" /> Last updated {policy.updated}
        </p>
      </header>

      <ul className="policy-highlights" aria-label="Key points">
        {policy.highlights(ctx).map((h) => (
          <li key={h}><CheckCircle2 size={18} aria-hidden="true" /><span>{h}</span></li>
        ))}
      </ul>

      <div className="policy-body">
        <aside className="policy-toc" aria-label="On this page">
          <p>On this page</p>
          <ol>
            {sections.map((s) => (
              <li key={s.id}><a href={`#${s.id}`}>{s.heading}</a></li>
            ))}
          </ol>
        </aside>

        <div className="policy-content">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id}>
              <h2><span className="policy-num">{String(i + 1).padStart(2, "0")}</span>{s.heading}</h2>
              {s.body.map((block, j) =>
                typeof block === "string" ? (
                  <p key={j}>{block}</p>
                ) : (
                  <ul key={j}>
                    {block.list.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                )
              )}
            </section>
          ))}
        </div>
      </div>

      <PolicyContact contact={contact} />

      {next.slug !== policy.slug && (
        <Link href={`/policies/${next.slug}`} className="policy-next">
          <span>Next policy</span>
          <strong>{next.title} <ChevronRight size={16} aria-hidden="true" /></strong>
        </Link>
      )}
    </article>
  );
}
