"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Save } from "lucide-react";
import { SingleImageUpload } from "@/components/admin/SingleImageUpload";
import type { SiteSettingsData } from "@/lib/site-settings";
import { CardListSkeleton, Skeleton } from "@/components/ui/Skeleton";

/* ------------------------------------------------------------------ *
 * Immutable nested-path helpers
 * Lets every field just call set("home.hero.title", value) or
 * set(["footer","columns",0,"links",1,"label"], value) without hand-writing
 * spread updates for deeply nested state.
 * ------------------------------------------------------------------ */
type PathSeg = string | number;
type Path = string | PathSeg[];

function toSegs(path: Path): PathSeg[] {
  return Array.isArray(path) ? path : path.split(".");
}

function setByPath<T>(obj: T, path: Path, value: unknown): T {
  const segs = toSegs(path);
  if (segs.length === 0) return value as T;
  const [head, ...rest] = segs;
  const clone: any = Array.isArray(obj) ? [...(obj as any)] : { ...(obj as any) };
  clone[head as any] = rest.length ? setByPath(clone[head as any], rest, value) : value;
  return clone;
}

/* ------------------------------------------------------------------ *
 * Small field primitives (match the app's plain-Tailwind admin style)
 * ------------------------------------------------------------------ */
function Text({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border px-3 py-2"
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <textarea
        value={value ?? ""}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border px-3 py-2"
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-md border px-3 py-2"
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`shrink-0 w-11 h-6 rounded-full transition relative ${value ? "bg-primary" : "bg-gray-300"
          }`}
        aria-pressed={value}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${value ? "left-[22px]" : "left-0.5"
            }`}
        />
      </button>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 rounded border cursor-pointer"
        />
        <input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-md border px-3 py-2 font-mono text-sm"
        />
      </div>
    </div>
  );
}

/** Card wrapper for a repeatable list item, with reorder + delete controls. */
function ItemCard({
  index,
  total,
  onMove,
  onRemove,
  children,
}: {
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border p-4 space-y-3 bg-gray-50/50">
      <div className="flex justify-end gap-1">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => onMove(index, index - 1)}
          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
          title="Move up"
        >
          <ArrowUp size={15} />
        </button>
        <button
          type="button"
          disabled={index === total - 1}
          onClick={() => onMove(index, index + 1)}
          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
          title="Move down"
        >
          <ArrowDown size={15} />
        </button>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1 text-red-500 hover:text-red-700"
          title="Remove"
        >
          <Trash2 size={15} />
        </button>
      </div>
      {children}
    </div>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-sm rounded-md border border-dashed px-3 py-2 text-gray-600 hover:border-gray-500"
    >
      <Plus size={15} /> {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */

const TABS = [
  "Branding",
  "SEO",
  "Theme",
  "Commerce",
  "Announcement",
  "Homepage",
  "Navigation",
  "Footer",
  "Contact & Social",
] as const;
type Tab = (typeof TABS)[number];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettingsData | null>(null);
  const [tab, setTab] = useState<Tab>("Branding");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings))
      .catch(() => setMessage({ type: "err", text: "Failed to load settings" }));
  }, []);

  // Generic setter usable by every field: set("home.hero.title", value)
  const set = (path: Path, value: unknown) =>
    setSettings((prev) => (prev ? setByPath(prev, path, value) : prev));

  // Array helpers ---------------------------------------------------
  const pushItem = (path: Path, item: unknown) =>
    setSettings((prev) => {
      if (!prev) return prev;
      const segs = toSegs(path);
      const current = (getByPath(prev, segs) as unknown[]) ?? [];
      return setByPath(prev, segs, [...current, item]);
    });

  const removeItem = (path: Path, index: number) =>
    setSettings((prev) => {
      if (!prev) return prev;
      const segs = toSegs(path);
      const current = [...((getByPath(prev, segs) as unknown[]) ?? [])];
      current.splice(index, 1);
      return setByPath(prev, segs, current);
    });

  const moveItem = (path: Path, from: number, to: number) =>
    setSettings((prev) => {
      if (!prev) return prev;
      const segs = toSegs(path);
      const current = [...((getByPath(prev, segs) as unknown[]) ?? [])];
      if (to < 0 || to >= current.length) return prev;
      const [moved] = current.splice(from, 1);
      current.splice(to, 0, moved);
      return setByPath(prev, segs, current);
    });

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error || "Failed to save" });
        return;
      }
      setSettings(data.settings);
      setMessage({ type: "ok", text: "Settings saved. Refresh the storefront to see changes." });
    } catch {
      setMessage({ type: "err", text: "Something went wrong" });
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-8 w-40" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  const s = settings;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Site Settings</h1>
          <p className="text-sm text-gray-400">
            Everything the storefront shows — branding, homepage, navigation, footer, commerce.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 disabled:opacity-50"
        >
          <Save size={16} /> {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      {message && (
        <p
          className={`mb-4 text-sm rounded-md px-3 py-2 ${message.type === "ok"
            ? "bg-green-50 text-green-700"
            : "bg-red-50 text-red-600"
            }`}
        >
          {message.text}
        </p>
      )}

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 border-b mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm border-b-2 -mb-px ${tab === t
              ? "border-primary font-medium"
              : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ------------------------- BRANDING ------------------------- */}
      {tab === "Branding" && (
        <div className="space-y-5">
          <Text label="Store name" value={s.brand.storeName} onChange={(v) => set("brand.storeName", v)} />
          <Text label="Tagline" value={s.brand.tagline} onChange={(v) => set("brand.tagline", v)} />
          <SingleImageUpload
            label="Logo (optional — falls back to the store name text)"
            value={s.brand.logoUrl}
            onChange={(v) => set("brand.logoUrl", v)}
          />
          <SingleImageUpload
            label="Favicon (optional)"
            value={s.brand.faviconUrl}
            onChange={(v) => set("brand.faviconUrl", v)}
          />
        </div>
      )}

      {/* ------------------------- SEO ------------------------------ */}
      {tab === "SEO" && (
        <div className="space-y-5">
          <Text
            label="Meta title"
            value={s.seo.metaTitle}
            onChange={(v) => set("seo.metaTitle", v)}
            hint="Shown in the browser tab and search results."
          />
          <TextArea
            label="Meta description"
            value={s.seo.metaDescription}
            onChange={(v) => set("seo.metaDescription", v)}
          />
        </div>
      )}

      {/* ------------------------- THEME ---------------------------- */}
      {tab === "Theme" && (
        <div className="space-y-5">
          <p className="text-sm text-gray-500">
            Every colour on the storefront resolves to one of these. They&apos;re
            injected as CSS variables at page load, so a change here updates the
            whole site without a redeploy.
          </p>

          <div>
            <h3 className="font-semibold mb-3">Brand</h3>
            <div className="grid grid-cols-2 gap-4">
              <ColorField
                label="Primary (buttons, links)"
                value={s.theme.primaryColor}
                onChange={(v) => set("theme.primaryColor", v)}
              />
              <ColorField
                label="Primary text (on primary)"
                value={s.theme.primaryForeground}
                onChange={(v) => set("theme.primaryForeground", v)}
              />
              <ColorField
                label="Accent (badges, emphasis)"
                value={s.theme.accentColor}
                onChange={(v) => set("theme.accentColor", v)}
              />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Surfaces &amp; text</h3>
            <div className="grid grid-cols-2 gap-4">
              <ColorField
                label="Page background"
                value={s.theme.backgroundColor}
                onChange={(v) => set("theme.backgroundColor", v)}
              />
              <ColorField
                label="Card / panel surface"
                value={s.theme.surfaceColor}
                onChange={(v) => set("theme.surfaceColor", v)}
              />
              <ColorField
                label="Body text"
                value={s.theme.foregroundColor}
                onChange={(v) => set("theme.foregroundColor", v)}
              />
              <ColorField
                label="Muted text"
                value={s.theme.mutedColor}
                onChange={(v) => set("theme.mutedColor", v)}
              />
              <ColorField
                label="Borders / hairlines"
                value={s.theme.borderColor}
                onChange={(v) => set("theme.borderColor", v)}
              />
            </div>
          </div>

          <div className="pt-2">
            <p className="text-sm font-medium mb-2">Preview</p>
            <div
              className="rounded-md p-5"
              style={{
                background: s.theme.backgroundColor,
                border: `1px solid ${s.theme.borderColor}`,
              }}
            >
              <div
                className="rounded-md p-4"
                style={{
                  background: s.theme.surfaceColor,
                  border: `1px solid ${s.theme.borderColor}`,
                }}
              >
                <p style={{ color: s.theme.foregroundColor }} className="font-semibold">
                  Product title
                </p>
                <p style={{ color: s.theme.mutedColor }} className="text-sm mt-1">
                  Supporting text in the muted colour
                </p>
                <span
                  className="inline-block rounded-md px-5 py-2.5 font-medium mt-3 text-sm"
                  style={{
                    background: s.theme.primaryColor,
                    color: s.theme.primaryForeground,
                  }}
                >
                  Shop Now
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------- COMMERCE ------------------------- */}
      {tab === "Commerce" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Text
              label="Currency symbol"
              value={s.commerce.currencySymbol}
              onChange={(v) => set("commerce.currencySymbol", v)}
            />
            <Text
              label="Currency code"
              value={s.commerce.currencyCode}
              onChange={(v) => set("commerce.currencyCode", v)}
            />
          </div>
          <p className="rounded-md border p-4 text-sm">Free shipping on all products. No minimum order value.</p>
          <Toggle
            label="Cash on Delivery"
            hint="Allow customers to place COD orders."
            value={s.commerce.codEnabled}
            onChange={(v) => set("commerce.codEnabled", v)}
          />
          <Toggle
            label="PayPlus (online payments)"
            hint="Show the Pay Online option at checkout."
            value={s.commerce.payplusEnabled}
            onChange={(v) => set("commerce.payplusEnabled", v)}
          />
        </div>
      )}

      {/* ------------------------- ANNOUNCEMENT -------------------- */}
      {tab === "Announcement" && (
        <div className="space-y-5">
          <Toggle
            label="Show announcement bar"
            hint="A thin bar pinned above the header."
            value={s.announcement.enabled}
            onChange={(v) => set("announcement.enabled", v)}
          />
          <Text
            label="Text"
            value={s.announcement.text}
            onChange={(v) => set("announcement.text", v)}
            placeholder="Free shipping on orders over ₹999!"
          />
          <Text
            label="Link (optional)"
            value={s.announcement.link}
            onChange={(v) => set("announcement.link", v)}
            placeholder="/shop"
          />
        </div>
      )}

      {/* ------------------------- HOMEPAGE ------------------------ */}
      {tab === "Homepage" && (
        <div className="space-y-8">
          <section className="space-y-4">
            <h3 className="font-semibold">Hero section</h3>
            <Text label="Title" value={s.home.hero.title} onChange={(v) => set("home.hero.title", v)} />
            <Text
              label="Subtitle"
              value={s.home.hero.subtitle}
              onChange={(v) => set("home.hero.subtitle", v)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Text
                label="Button text"
                value={s.home.hero.ctaText}
                onChange={(v) => set("home.hero.ctaText", v)}
              />
              <Text
                label="Button link"
                value={s.home.hero.ctaLink}
                onChange={(v) => set("home.hero.ctaLink", v)}
              />
            </div>
            <SingleImageUpload
              label="Hero background image (optional)"
              aspect="banner"
              value={s.home.hero.backgroundImage}
              onChange={(v) => set("home.hero.backgroundImage", v)}
            />
          </section>

          <section className="space-y-4">
            <h3 className="font-semibold">Section headings</h3>
            <div className="grid grid-cols-2 gap-4">
              <Text
                label="Categories heading"
                value={s.home.categoriesHeading}
                onChange={(v) => set("home.categoriesHeading", v)}
              />
              <Text
                label="Featured heading"
                value={s.home.featuredHeading}
                onChange={(v) => set("home.featuredHeading", v)}
              />
            </div>
          </section>

          <section className="space-y-5">
            <div>
              <h3 className="font-semibold">Product rails</h3>
              <p className="text-xs text-gray-400 mt-1">
                The three horizontal scrollers on the homepage. Turn one off to
                hide it without deleting anything.
              </p>
            </div>

            <div className="rounded-md border p-4 space-y-3">
              <Toggle
                label="Show featured collection rail"
                value={s.home.combos.enabled}
                onChange={(v) => set("home.combos.enabled", v)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Text
                  label="Heading"
                  value={s.home.combos.heading}
                  onChange={(v) => set("home.combos.heading", v)}
                />
                <Text
                  label="Subheading"
                  value={s.home.combos.subheading}
                  onChange={(v) => set("home.combos.subheading", v)}
                />
              </div>
              <Text
                label="Featured collection category slug"
                hint="Products in this category fill the rail. Must match the category's slug exactly."
                value={s.home.comboCategorySlug}
                onChange={(v) => set("home.comboCategorySlug", v)}
                placeholder="fashion-and-beauty"
              />
            </div>

            <div className="rounded-md border p-4 space-y-3">
              <Toggle
                label="Show Bestsellers rail"
                hint="Tick 'Bestseller' on a product to include it here."
                value={s.home.bestsellers.enabled}
                onChange={(v) => set("home.bestsellers.enabled", v)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Text
                  label="Heading"
                  value={s.home.bestsellers.heading}
                  onChange={(v) => set("home.bestsellers.heading", v)}
                />
                <Text
                  label="Subheading"
                  value={s.home.bestsellers.subheading}
                  onChange={(v) => set("home.bestsellers.subheading", v)}
                />
              </div>
            </div>

            <div className="rounded-md border p-4 space-y-3">
              <Toggle
                label="Show Special Offers rail"
                hint="Fills automatically with discounted products, biggest saving first."
                value={s.home.offers.enabled}
                onChange={(v) => set("home.offers.enabled", v)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Text
                  label="Heading"
                  value={s.home.offers.heading}
                  onChange={(v) => set("home.offers.heading", v)}
                />
                <Text
                  label="Subheading"
                  value={s.home.offers.subheading}
                  onChange={(v) => set("home.offers.subheading", v)}
                />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold">Feature highlights</h3>
            <p className="text-xs text-gray-400">
              The small trust strip (e.g. Fast Shipping / Secure Payments). Icon is any{" "}
              <a href="https://lucide.dev/icons" target="_blank" rel="noreferrer" className="underline">
                Lucide icon
              </a>{" "}
              name like <code>Truck</code>.
            </p>
            {s.home.highlights.map((h, i) => (
              <ItemCard
                key={i}
                index={i}
                total={s.home.highlights.length}
                onMove={(f, t) => moveItem("home.highlights", f, t)}
                onRemove={(idx) => removeItem("home.highlights", idx)}
              >
                <div className="grid grid-cols-3 gap-3">
                  <Text label="Icon" value={h.icon} onChange={(v) => set(["home", "highlights", i, "icon"], v)} />
                  <Text label="Title" value={h.title} onChange={(v) => set(["home", "highlights", i, "title"], v)} />
                  <Text
                    label="Subtitle"
                    value={h.subtitle}
                    onChange={(v) => set(["home", "highlights", i, "subtitle"], v)}
                  />
                </div>
              </ItemCard>
            ))}
            <AddButton
              label="Add highlight"
              onClick={() => pushItem("home.highlights", { icon: "", title: "", subtitle: "" })}
            />
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold">Promo banners</h3>
            <p className="text-xs text-gray-400">Full-width promotional banners rendered under the categories grid.</p>
            {s.home.banners.map((b, i) => (
              <ItemCard
                key={i}
                index={i}
                total={s.home.banners.length}
                onMove={(f, t) => moveItem("home.banners", f, t)}
                onRemove={(idx) => removeItem("home.banners", idx)}
              >
                <SingleImageUpload
                  label="Banner image"
                  aspect="banner"
                  value={b.image}
                  onChange={(v) => set(["home", "banners", i, "image"], v)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Text label="Heading" value={b.heading} onChange={(v) => set(["home", "banners", i, "heading"], v)} />
                  <Text
                    label="Subheading"
                    value={b.subheading}
                    onChange={(v) => set(["home", "banners", i, "subheading"], v)}
                  />
                </div>
                <Text label="Link" value={b.link} onChange={(v) => set(["home", "banners", i, "link"], v)} />
              </ItemCard>
            ))}
            <AddButton
              label="Add banner"
              onClick={() =>
                pushItem("home.banners", { image: "", heading: "", subheading: "", link: "" })
              }
            />
          </section>
        </div>
      )}

      {/* ------------------------- NAVIGATION ---------------------- */}
      {tab === "Navigation" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Links shown in the storefront header (besides Cart and account).</p>
          {s.header.navLinks.map((l, i) => (
            <ItemCard
              key={i}
              index={i}
              total={s.header.navLinks.length}
              onMove={(f, t) => moveItem("header.navLinks", f, t)}
              onRemove={(idx) => removeItem("header.navLinks", idx)}
            >
              <div className="grid grid-cols-2 gap-3">
                <Text label="Label" value={l.label} onChange={(v) => set(["header", "navLinks", i, "label"], v)} />
                <Text label="Href" value={l.href} onChange={(v) => set(["header", "navLinks", i, "href"], v)} />
              </div>
            </ItemCard>
          ))}
          <AddButton label="Add nav link" onClick={() => pushItem("header.navLinks", { label: "", href: "" })} />
        </div>
      )}

      {/* ------------------------- FOOTER -------------------------- */}
      {tab === "Footer" && (
        <div className="space-y-6">
          <TextArea label="About text" value={s.footer.about} onChange={(v) => set("footer.about", v)} />
          <Text
            label="Copyright text"
            value={s.footer.copyrightText}
            onChange={(v) => set("footer.copyrightText", v)}
            hint="Use {year} to insert the current year automatically."
          />

          <div className="space-y-3">
            <h3 className="font-semibold">Footer columns</h3>
            {s.footer.columns.map((col, ci) => (
              <ItemCard
                key={ci}
                index={ci}
                total={s.footer.columns.length}
                onMove={(f, t) => moveItem("footer.columns", f, t)}
                onRemove={(idx) => removeItem("footer.columns", idx)}
              >
                <Text
                  label="Column title"
                  value={col.title}
                  onChange={(v) => set(["footer", "columns", ci, "title"], v)}
                />
                <div className="space-y-2 pl-3 border-l">
                  {col.links.map((lnk, li) => (
                    <div key={li} className="flex items-end gap-2">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <Text
                          label="Label"
                          value={lnk.label}
                          onChange={(v) => set(["footer", "columns", ci, "links", li, "label"], v)}
                        />
                        <Text
                          label="Href"
                          value={lnk.href}
                          onChange={(v) => set(["footer", "columns", ci, "links", li, "href"], v)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(["footer", "columns", ci, "links"], li)}
                        className="p-2 text-red-500 hover:text-red-700"
                        title="Remove link"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                  <AddButton
                    label="Add link"
                    onClick={() => pushItem(["footer", "columns", ci, "links"], { label: "", href: "" })}
                  />
                </div>
              </ItemCard>
            ))}
            <AddButton
              label="Add column"
              onClick={() => pushItem("footer.columns", { title: "", links: [] })}
            />
          </div>
        </div>
      )}

      {/* ------------------------- CONTACT & SOCIAL ---------------- */}
      {tab === "Contact & Social" && (
        <div className="space-y-6">
          <section className="space-y-4">
            <h3 className="font-semibold">Contact</h3>
            <div className="grid grid-cols-2 gap-4">
              <Text label="Email" value={s.contact.email} onChange={(v) => set("contact.email", v)} />
              <Text label="Phone" value={s.contact.phone} onChange={(v) => set("contact.phone", v)} />
            </div>
            <TextArea label="Address" value={s.contact.address} onChange={(v) => set("contact.address", v)} rows={2} />
          </section>
          <section className="space-y-4">
            <h3 className="font-semibold">Social links</h3>
            <div className="grid grid-cols-2 gap-4">
              <Text label="Facebook" value={s.social.facebook} onChange={(v) => set("social.facebook", v)} />
              <Text label="Instagram" value={s.social.instagram} onChange={(v) => set("social.instagram", v)} />
              <Text label="Twitter / X" value={s.social.twitter} onChange={(v) => set("social.twitter", v)} />
              <Text label="YouTube" value={s.social.youtube} onChange={(v) => set("social.youtube", v)} />
            </div>
          </section>
        </div>
      )}

      <div className="mt-8 pt-6 border-t">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 disabled:opacity-50"
        >
          <Save size={16} /> {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

/** Read a value at a nested path (mirror of setByPath, used by array helpers). */
function getByPath(obj: unknown, path: Path): unknown {
  const segs = toSegs(path);
  return segs.reduce<any>((acc, seg) => (acc == null ? acc : acc[seg as any]), obj);
}
