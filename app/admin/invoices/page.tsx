"use client";

import { useEffect, useState } from "react";
import { Save, Download, ExternalLink, Search } from "lucide-react";
import { TableSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { useCurrency } from "@/lib/useCurrency";

/* ------------------------------------------------------------------ *
 * Field primitives (match the storefront settings screen's plain style)
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
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
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
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
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
        aria-pressed={value}
        className={`shrink-0 w-11 h-6 rounded-full transition relative ${
          value ? "bg-primary" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
            value ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */

interface InvoiceRow {
  _id: string;
  order: string;
  invoiceNumber: string;
  issuedAt: string;
  buyerName: string;
  grandTotal: number;
  totalTax: number;
  placeOfSupply: string;
  isInterState: boolean;
}

const TABS = ["Seller & GSTIN", "Tax", "Numbering", "Document", "Bank", "Invoice Register"] as const;
type Tab = (typeof TABS)[number];

export default function AdminInvoicesPage() {
  const { symbol: currency } = useCurrency();
  const [settings, setSettings] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("Seller & GSTIN");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Invoice register state
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [registerTotals, setRegisterTotals] = useState({ grandTotal: 0, totalTax: 0, count: 0 });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/invoice-settings")
      .then((r) => r.json())
      .then((d) => (d.error ? setMessage({ type: "err", text: d.error }) : setSettings(d.settings)))
      .catch(() => setMessage({ type: "err", text: "Failed to load invoice settings" }));
  }, []);

  async function loadRegister() {
    setRegisterLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/invoices?${params.toString()}`);
      const data = await res.json();
      setInvoices(data.invoices ?? []);
      setRegisterTotals(data.totals ?? { grandTotal: 0, totalTax: 0, count: 0 });
    } finally {
      setRegisterLoading(false);
    }
  }

  useEffect(() => {
    if (tab === "Invoice Register") loadRegister();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  /** Update a nested settings path, e.g. set("seller", "gstin", value). */
  function set(section: string, key: string, value: unknown) {
    setSettings((prev: any) => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/invoice-settings", {
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
      setMessage({
        type: "ok",
        text: data.sequenceAdjusted
          ? `Saved. Invoice numbering was kept at ${data.sequenceAdjusted} — it can be raised but never lowered.`
          : "Invoice settings saved.",
      });
    } catch {
      setMessage({ type: "err", text: "Something went wrong" });
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-8 w-48" />
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
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Invoicing</h1>
          <p className="text-sm text-gray-400">
            Legal seller identity, GST treatment, and the numbering used on every tax invoice.
          </p>
        </div>
        {tab !== "Invoice Register" && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 disabled:opacity-50"
          >
            <Save size={16} /> {saving ? "Saving…" : "Save changes"}
          </button>
        )}
      </div>

      {message && (
        <p
          className={`mb-4 text-sm rounded-md px-3 py-2 ${
            message.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="flex flex-wrap gap-1 border-b mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm border-b-2 -mb-px ${
              tab === t ? "border-primary font-medium" : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ----------------------- SELLER ----------------------- */}
      {tab === "Seller & GSTIN" && (
        <div className="space-y-5">
          <p className="text-sm text-gray-500">
            These details are printed as the supplier on every invoice, so they should match your GST
            registration exactly.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Text label="Legal name" value={s.seller.legalName} onChange={(v) => set("seller", "legalName", v)} hint="As registered (e.g. Nova Retail Private Limited)" />
            <Text label="Trade name" value={s.seller.tradeName} onChange={(v) => set("seller", "tradeName", v)} hint="Brand name shown prominently" />
          </div>
          <Text label="Address line 1" value={s.seller.addressLine1} onChange={(v) => set("seller", "addressLine1", v)} />
          <Text label="Address line 2" value={s.seller.addressLine2} onChange={(v) => set("seller", "addressLine2", v)} />
          <div className="grid sm:grid-cols-4 gap-4">
            <Text label="City" value={s.seller.city} onChange={(v) => set("seller", "city", v)} />
            <Text label="State" value={s.seller.state} onChange={(v) => set("seller", "state", v)} />
            <Text label="State code" value={s.seller.stateCode} onChange={(v) => set("seller", "stateCode", v)} hint="2-digit GST code" />
            <Text label="PIN code" value={s.seller.pincode} onChange={(v) => set("seller", "pincode", v)} />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Text label="GSTIN" value={s.seller.gstin} onChange={(v) => set("seller", "gstin", v.toUpperCase())} hint="15 characters" />
            <Text label="PAN" value={s.seller.pan} onChange={(v) => set("seller", "pan", v.toUpperCase())} />
            <Text label="CIN" value={s.seller.cin} onChange={(v) => set("seller", "cin", v)} />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Text label="Email" value={s.seller.email} onChange={(v) => set("seller", "email", v)} />
            <Text label="Phone" value={s.seller.phone} onChange={(v) => set("seller", "phone", v)} />
            <Text label="Website" value={s.seller.website} onChange={(v) => set("seller", "website", v)} />
          </div>
          <div className="rounded-md bg-blue-50 text-blue-800 text-xs p-3">
            The <strong>state code</strong> decides the tax split: same state as the customer means
            CGST + SGST, a different state means IGST. Leave it blank and every invoice falls back to
            CGST + SGST.
          </div>
        </div>
      )}

      {/* ----------------------- TAX ----------------------- */}
      {tab === "Tax" && (
        <div className="space-y-5">
          <Toggle
            label="Charge GST"
            hint="Turn off to print invoices with no tax columns at all."
            value={s.tax.gstEnabled}
            onChange={(v) => set("tax", "gstEnabled", v)}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <NumberField label="Default GST rate (%)" value={s.tax.defaultGstRate} onChange={(v) => set("tax", "defaultGstRate", v)} hint="Applied to every product line" />
            <Text label="Default HSN / SAC code" value={s.tax.defaultHsnCode} onChange={(v) => set("tax", "defaultHsnCode", v)} hint="Printed against each product" />
          </div>
          <Toggle
            label="Product prices already include GST"
            hint="Recommended. Your checkout total does not add tax on top, so tax is extracted out of the price."
            value={s.tax.pricesIncludeTax}
            onChange={(v) => set("tax", "pricesIncludeTax", v)}
          />
          {!s.tax.pricesIncludeTax && (
            <div className="rounded-md bg-yellow-50 text-yellow-800 text-xs p-3">
              With this off, tax is added <em>on top</em> of prices, so the invoice total will be higher
              than the amount your checkout actually charged. Only use it if your catalogue prices are
              genuinely tax-exclusive.
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <Text label="Shipping HSN / SAC" value={s.tax.shippingHsnCode} onChange={(v) => set("tax", "shippingHsnCode", v)} hint="996812 = courier services" />
            <NumberField label="Shipping GST rate (%)" value={s.tax.shippingGstRate} onChange={(v) => set("tax", "shippingGstRate", v)} />
          </div>
          <Toggle
            label="Round the grand total"
            hint="Rounds to the nearest rupee and prints a round-off line."
            value={s.tax.roundOffTotal}
            onChange={(v) => set("tax", "roundOffTotal", v)}
          />
        </div>
      )}

      {/* ----------------------- NUMBERING ----------------------- */}
      {tab === "Numbering" && (
        <div className="space-y-5">
          <div className="grid sm:grid-cols-3 gap-4">
            <Text label="Prefix" value={s.numbering.prefix} onChange={(v) => set("numbering", "prefix", v)} />
            <NumberField label="Digits" value={s.numbering.padding} onChange={(v) => set("numbering", "padding", v)} hint="e.g. 5 → 00042" />
            <NumberField label="Next number" value={s.numbering.nextSequence} onChange={(v) => set("numbering", "nextSequence", v)} hint="Can be raised, never lowered" />
          </div>
          <Toggle
            label="Include financial year"
            hint="Adds the Indian FY (April–March), e.g. INV/2026-27/00042"
            value={s.numbering.includeFinancialYear}
            onChange={(v) => set("numbering", "includeFinancialYear", v)}
          />
          <Toggle
            label="Restart numbering each financial year"
            hint="Standard practice — the counter resets to 1 every April."
            value={s.numbering.resetEachFinancialYear}
            onChange={(v) => set("numbering", "resetEachFinancialYear", v)}
          />
          <div className="rounded-md border p-4">
            <p className="text-xs text-gray-400 mb-1">Next invoice will look like</p>
            <p className="font-mono font-semibold">
              {[
                s.numbering.prefix || "INV",
                s.numbering.includeFinancialYear ? "2026-27" : null,
                String(s.numbering.nextSequence || 1).padStart(Math.max(1, s.numbering.padding || 1), "0"),
              ]
                .filter(Boolean)
                .join("/")}
            </p>
          </div>
        </div>
      )}

      {/* ----------------------- DOCUMENT ----------------------- */}
      {tab === "Document" && (
        <div className="space-y-5">
          <Text label="Document title" value={s.document.title} onChange={(v) => set("document", "title", v)} hint="Printed at the top, e.g. TAX INVOICE" />
          <TextArea label="Declaration" value={s.document.declaration} onChange={(v) => set("document", "declaration", v)} hint="The standard GST self-declaration" />
          <TextArea label="Terms & conditions" value={s.document.terms} onChange={(v) => set("document", "terms", v)} />
          <TextArea label="Notes" value={s.document.notes} onChange={(v) => set("document", "notes", v)} rows={2} />
          <Text label="Footer text" value={s.document.footerText} onChange={(v) => set("document", "footerText", v)} />
          <Text label="Signature label" value={s.document.signatureLabel} onChange={(v) => set("document", "signatureLabel", v)} />
          <div className="space-y-4 pt-2">
            <Toggle label="Show amount in words" value={s.document.showAmountInWords} onChange={(v) => set("document", "showAmountInWords", v)} />
            <Toggle label="Show HSN / SAC summary" value={s.document.showHsnSummary} onChange={(v) => set("document", "showHsnSummary", v)} hint="The rate-wise tax breakup table" />
            <Toggle label="Show bank details" value={s.document.showBankDetails} onChange={(v) => set("document", "showBankDetails", v)} />
          </div>
          <div className="pt-2">
            <Toggle
              label="Attach invoice PDF to order confirmation email"
              value={s.attachToOrderEmail}
              onChange={(v) => setSettings((p: any) => ({ ...p, attachToOrderEmail: v }))}
            />
          </div>
        </div>
      )}

      {/* ----------------------- BANK ----------------------- */}
      {tab === "Bank" && (
        <div className="space-y-5">
          <p className="text-sm text-gray-500">
            Only printed when “Show bank details” is enabled on the Document tab.
          </p>
          <Text label="Account name" value={s.bank.accountName} onChange={(v) => set("bank", "accountName", v)} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Text label="Bank name" value={s.bank.bankName} onChange={(v) => set("bank", "bankName", v)} />
            <Text label="Account number" value={s.bank.accountNumber} onChange={(v) => set("bank", "accountNumber", v)} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Text label="IFSC" value={s.bank.ifsc} onChange={(v) => set("bank", "ifsc", v.toUpperCase())} />
            <Text label="Branch" value={s.bank.branch} onChange={(v) => set("bank", "branch", v)} />
          </div>
        </div>
      )}

      {/* ----------------------- REGISTER ----------------------- */}
      {tab === "Invoice Register" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[220px] flex gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadRegister()}
                placeholder="Search invoice number or customer"
                className="flex-1 rounded-md border px-3 py-2 text-sm"
              />
              <button
                onClick={loadRegister}
                className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
              >
                <Search size={14} /> Search
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border p-4">
              <p className="text-xs text-gray-400">Invoices</p>
              <p className="text-xl font-bold">{registerTotals.count}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-gray-400">Invoiced value</p>
              <p className="text-xl font-bold">
                {currency}
                {registerTotals.grandTotal.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-gray-400">Tax collected</p>
              <p className="text-xl font-bold">
                {currency}
                {registerTotals.totalTax.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {registerLoading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : invoices.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No invoices issued yet. One is created automatically when an order is confirmed.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="p-2 border-b">Invoice No.</th>
                    <th className="p-2 border-b">Date</th>
                    <th className="p-2 border-b">Customer</th>
                    <th className="p-2 border-b">Place of supply</th>
                    <th className="p-2 border-b text-right">Tax</th>
                    <th className="p-2 border-b text-right">Total</th>
                    <th className="p-2 border-b"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv._id} className="border-b">
                      <td className="p-2 font-mono">{inv.invoiceNumber}</td>
                      <td className="p-2 text-gray-500">
                        {new Date(inv.issuedAt).toLocaleDateString()}
                      </td>
                      <td className="p-2">{inv.buyerName || "—"}</td>
                      <td className="p-2 text-gray-500">
                        {inv.placeOfSupply || "—"}
                        <span className="ml-1 text-xs text-gray-400">
                          {inv.isInterState ? "(IGST)" : "(CGST+SGST)"}
                        </span>
                      </td>
                      <td className="p-2 text-right text-gray-600">
                        {currency}
                        {inv.totalTax.toLocaleString("en-IN")}
                      </td>
                      <td className="p-2 text-right font-medium">
                        {currency}
                        {inv.grandTotal.toLocaleString("en-IN")}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/api/invoices/${inv.order}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-gray-500 hover:text-gray-800"
                            title="View"
                          >
                            <ExternalLink size={16} />
                          </a>
                          <a
                            href={`/api/invoices/${inv.order}?download=1`}
                            className="text-gray-500 hover:text-gray-800"
                            title="Download"
                          >
                            <Download size={16} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
