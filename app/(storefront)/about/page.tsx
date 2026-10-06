import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeIndianRupee, HeartHandshake, Sparkles, Users } from "lucide-react";
import { getSiteSettings } from "@/lib/site-settings";
import { storefrontAppearance } from "@/components/storefront/appearance";
import { homeCategories } from "@/components/storefront/home-content";
import { TrustBadges } from "@/components/storefront/TrustBadges";

export const metadata: Metadata = {
  title: "About Us",
  description: "Who we are, what we sell and the promise behind every order.",
};

export const dynamic = "force-dynamic";

const VALUES = [
  { Icon: Sparkles, title: "Handpicked quality", text: "Every product is chosen for how well it works and how long it lasts — not just how it looks in a photo." },
  { Icon: BadgeIndianRupee, title: "Fair, honest prices", text: "Clear prices with taxes included and free delivery on every order. No surprises at checkout." },
  { Icon: HeartHandshake, title: "Customers first", text: "Easy returns, quick refunds and real people to talk to when you need help." },
  { Icon: Users, title: "Something for everyone", text: "From the kitchen to the wardrobe to the pet bed — one trusted place for the whole family." },
];

export default async function AboutPage() {
  const { brand } = storefrontAppearance(await getSiteSettings());

  return (
    <main className="info-page">
      <header className="policy-hero about-hero">
        <p className="policy-eyebrow">About us</p>
        <h1>{brand.tagline || `Welcome to ${brand.storeName}`}</h1>
        <p>
          {brand.storeName} is an online marketplace bringing together everyday essentials, fashion,
          home, beauty, tech and more — so you can find everything you need in one place.
        </p>
      </header>

      <section className="about-section about-story">
        <div>
          <h2>Our story</h2>
          <p>
            We started {brand.storeName} with a simple idea: shopping online should be easy, affordable and
            trustworthy. Instead of hopping between a dozen websites, you should be able to find quality
            products across every part of your life in one market you can rely on.
          </p>
          <p>
            Today we curate products across home, lifestyle, wellness, kids, pets and tech — and back every
            order with free delivery, secure payments and easy returns.
          </p>
        </div>
        <div className="about-cats" aria-label="What we sell">
          {homeCategories.map((c) => (
            <Link key={c.slug} href={`/shop?category=${c.slug}`}>{c.name}</Link>
          ))}
        </div>
      </section>

      <section className="about-section">
        <h2>What we stand for</h2>
        <ul className="about-values">
          {VALUES.map(({ Icon, title, text }) => (
            <li key={title}>
              <span className="policy-card-icon"><Icon size={22} aria-hidden="true" /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="about-section">
        <h2>Our promise to you</h2>
        <TrustBadges />
      </section>

      <section className="about-cta">
        <h2>Ready to explore?</h2>
        <p>Browse the full range, or get in touch if there&apos;s anything we can help with.</p>
        <div>
          <Link href="/shop" className="about-btn about-btn--primary">Shop all products <ArrowRight size={16} aria-hidden="true" /></Link>
          <Link href="/contact" className="about-btn">Contact us</Link>
        </div>
      </section>
    </main>
  );
}
