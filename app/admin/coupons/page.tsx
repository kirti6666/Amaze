"use client";

import { useEffect, useState } from "react";
import { Trash2, Pencil, X } from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useCurrency } from "@/lib/useCurrency";

interface Coupon {
  _id: string;
  code: string;
  discountType: "percent" | "flat";
  value: number;
  minOrderValue: number;
  expiresAt: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

const EMPTY_FORM = {
  code: "",
  discountType: "percent" as "percent" | "flat",
  value: "",
  minOrderValue: "0",
  expiresAt: "",
  usageLimit: "0",
  isActive: true,
};

export default function AdminCouponsPage() {
  const { symbol: currency } = useCurrency();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/coupons");
    const data = await res.json();
    setCoupons(data.coupons ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
  }

  function startEdit(c: Coupon) {
    setEditingId(c._id);
    setError("");
    setForm({
      code: c.code,
      discountType: c.discountType,
      value: String(c.value),
      minOrderValue: String(c.minOrderValue),
      expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 10) : "",
      usageLimit: String(c.usageLimit),
      isActive: c.isActive,
    });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    // Send expiry as end-of-day so a coupon is usable through its whole last day.
    const payload = {
      code: form.code,
      discountType: form.discountType,
      value: Number(form.value),
      minOrderValue: Number(form.minOrderValue),
      expiresAt: form.expiresAt ? `${form.expiresAt}T23:59:59` : "",
      usageLimit: Number(form.usageLimit),
      isActive: form.isActive,
    };

    try {
      const res = await fetch(editingId ? `/api/coupons/${editingId}` : "/api/coupons", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save coupon");
        return;
      }
      resetForm();
      load();
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this coupon permanently?")) return;
    const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Failed to delete coupon");
      return;
    }
    if (editingId === id) resetForm();
    load();
  }

  async function toggleActive(c: Coupon) {
    await fetch(`/api/coupons/${c._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    load();
  }

  function statusBadge(c: Coupon) {
    const expired = new Date(c.expiresAt) < new Date();
    const usedUp = c.usageLimit > 0 && c.usedCount >= c.usageLimit;
    if (!c.isActive) return { label: "Inactive", cls: "bg-gray-100 text-gray-500" };
    if (expired) return { label: "Expired", cls: "bg-red-100 text-red-600" };
    if (usedUp) return { label: "Used up", cls: "bg-orange-100 text-orange-600" };
    return { label: "Active", cls: "bg-green-100 text-green-700" };
  }

  function describe(c: Coupon) {
    return c.discountType === "percent" ? `${c.value}% off` : `${currency}${c.value} off`;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Coupons</h1>

      {/* Create / edit form */}
      <form onSubmit={submit} className="border rounded-lg p-5 mb-8 max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">{editingId ? "Edit coupon" : "Create coupon"}</h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
            >
              <X size={14} /> Cancel edit
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Code</label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="WELCOME10"
              className="w-full rounded-md border px-3 py-2 uppercase"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Discount type</label>
            <select
              value={form.discountType}
              onChange={(e) =>
                setForm({ ...form, discountType: e.target.value as "percent" | "flat" })
              }
              className="w-full rounded-md border px-3 py-2 bg-white"
            >
              <option value="percent">Percent (%)</option>
              <option value="flat">Flat amount</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Value {form.discountType === "percent" ? "(%)" : `(${currency})`}
            </label>
            <input
              type="number"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              min={1}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Min. order value ({currency})</label>
            <input
              type="number"
              value={form.minOrderValue}
              onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
              min={0}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Expires on</label>
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Usage limit (0 = unlimited)</label>
            <input
              type="number"
              value={form.usageLimit}
              onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
              min={0}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 mt-4 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Active (available to shoppers)
        </label>

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 rounded-md bg-primary text-primary-foreground px-5 py-2 disabled:opacity-50"
        >
          {submitting ? "Saving…" : editingId ? "Save changes" : "Create coupon"}
        </button>
      </form>

      {/* List */}
      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : coupons.length === 0 ? (
        <p className="text-gray-400">No coupons yet. Create your first one above.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-2 border-b">Code</th>
                <th className="p-2 border-b">Discount</th>
                <th className="p-2 border-b">Min order</th>
                <th className="p-2 border-b">Usage</th>
                <th className="p-2 border-b">Expires</th>
                <th className="p-2 border-b">Status</th>
                <th className="p-2 border-b"></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => {
                const badge = statusBadge(c);
                return (
                  <tr key={c._id} className="border-b">
                    <td className="p-2 font-mono font-medium">{c.code}</td>
                    <td className="p-2">{describe(c)}</td>
                    <td className="p-2 text-gray-500">
                      {c.minOrderValue > 0 ? `${currency}${c.minOrderValue}` : "—"}
                    </td>
                    <td className="p-2 text-gray-500">
                      {c.usedCount}
                      {c.usageLimit > 0 ? ` / ${c.usageLimit}` : " / ∞"}
                    </td>
                    <td className="p-2 text-gray-500">
                      {new Date(c.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => toggleActive(c)}
                        className={`text-xs px-2 py-1 rounded-full ${badge.cls}`}
                        title="Toggle active"
                      >
                        {badge.label}
                      </button>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(c)}
                          className="text-gray-500 hover:text-gray-800"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => remove(c._id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
