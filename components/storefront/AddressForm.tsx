"use client";

import { useState } from "react";

interface AddressFormProps {
  onSaved: () => void;
  onCancel?: () => void;
}

export function AddressForm({ onSaved, onCancel }: AddressFormProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, line1, line2, city, state, pincode, isDefault }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save address");
        return;
      }
      onSaved();
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border rounded-md p-4">
      <div className="grid grid-cols-2 gap-3">
        <input
          required
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
        />
      </div>
      <input
        required
        placeholder="Address line 1"
        value={line1}
        onChange={(e) => setLine1(e.target.value)}
        className="w-full rounded-md border px-3 py-2 text-sm"
      />
      <input
        placeholder="Address line 2 (optional)"
        value={line2}
        onChange={(e) => setLine2(e.target.value)}
        className="w-full rounded-md border px-3 py-2 text-sm"
      />
      <div className="grid grid-cols-3 gap-3">
        <input
          required
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="Pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
        />
        Set as default address
      </label>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Address"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border px-4 py-2 text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
