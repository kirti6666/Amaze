"use client";

import { useEffect, useState } from "react";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { AddressForm } from "@/components/storefront/AddressForm";

interface Address {
  _id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function loadAddresses() {
    setLoading(true);
    const res = await fetch("/api/addresses");
    const data = await res.json();
    setAddresses(data.addresses ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this address?")) return;
    const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    if (res.ok) loadAddresses();
  }

  async function handleSetDefault(id: string) {
    await fetch(`/api/addresses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    loadAddresses();
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">My Addresses</h1>

      {loading ? (
        <ListSkeleton rows={3} />
      ) : (
        <div className="space-y-3 mb-6">
          {addresses.map((addr) => (
            <div key={addr._id} className="border rounded-md p-4 text-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    {addr.fullName}{" "}
                    {addr.isDefault && (
                      <span className="text-xs bg-success-bg text-success px-2 py-0.5 rounded-full ml-1">
                        Default
                      </span>
                    )}
                  </p>
                  <p className="text-muted">{addr.phone}</p>
                  <p className="text-muted">
                    {addr.line1}
                    {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} -{" "}
                    {addr.pincode}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr._id)}
                      className="block text-xs text-primary underline"
                    >
                      Set default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(addr._id)}
                    className="block text-xs text-danger underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {addresses.length === 0 && (
            <p className="text-muted text-sm">No saved addresses yet.</p>
          )}
        </div>
      )}

      {showForm ? (
        <AddressForm
          onSaved={() => {
            setShowForm(false);
            loadAddresses();
          }}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="rounded-md border px-4 py-2 text-sm"
        >
          + Add new address
        </button>
      )}
    </main>
  );
}
