"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

export interface VariantAttribute {
  name: string;
  options: string[];
}

export interface VariantCombination {
  combination: Record<string, string>;
  sku?: string;
  stock: number;
  price?: number;
}

interface VariantBuilderProps {
  variants: VariantAttribute[];
  combinations: VariantCombination[];
  onVariantsChange: (v: VariantAttribute[]) => void;
  onCombinationsChange: (c: VariantCombination[]) => void;
}

function cartesianProduct(attrs: VariantAttribute[]): Record<string, string>[] {
  if (attrs.length === 0) return [];
  return attrs.reduce<Record<string, string>[]>(
    (acc, attr) => {
      const next: Record<string, string>[] = [];
      for (const combo of acc) {
        for (const option of attr.options) {
          next.push({ ...combo, [attr.name]: option });
        }
      }
      return next;
    },
    [{}]
  );
}

function comboKey(combo: Record<string, string>) {
  return Object.entries(combo)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
}

export function VariantBuilder({
  variants,
  combinations,
  onVariantsChange,
  onCombinationsChange,
}: VariantBuilderProps) {
  const [newAttrName, setNewAttrName] = useState("");
  const [newAttrOptions, setNewAttrOptions] = useState("");

  function regenerateCombinations(attrs: VariantAttribute[], current: VariantCombination[]) {
    const generated = cartesianProduct(attrs);
    const existingByKey = new Map(current.map((c) => [comboKey(c.combination), c]));

    // Keep existing stock/sku/price for combinations that still exist after the
    // attribute change; only genuinely new combinations start at stock 0.
    const merged: VariantCombination[] = generated.map((combo) => {
      const key = comboKey(combo);
      return existingByKey.get(key) ?? { combination: combo, stock: 0 };
    });

    onCombinationsChange(merged);
  }

  function addAttribute() {
    const name = newAttrName.trim();
    const options = newAttrOptions
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);
    if (!name || options.length === 0) return;

    const updated = [...variants, { name, options }];
    onVariantsChange(updated);
    setNewAttrName("");
    setNewAttrOptions("");
    regenerateCombinations(updated, combinations);
  }

  function removeAttribute(name: string) {
    const updated = variants.filter((v) => v.name !== name);
    onVariantsChange(updated);
    regenerateCombinations(updated, combinations);
  }

  function updateCombination(index: number, patch: Partial<VariantCombination>) {
    const updated = combinations.map((c, i) => (i === index ? { ...c, ...patch } : c));
    onCombinationsChange(updated);
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2 text-sm">Variant Attributes</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {variants.map((v) => (
            <span
              key={v.name}
              className="inline-flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 text-sm"
            >
              {v.name}: {v.options.join(", ")}
              <button type="button" onClick={() => removeAttribute(v.name)} className="ml-1">
                <X size={14} />
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            placeholder="Attribute name (e.g. Size)"
            value={newAttrName}
            onChange={(e) => setNewAttrName(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm flex-1"
          />
          <input
            placeholder="Options, comma separated (e.g. S, M, L)"
            value={newAttrOptions}
            onChange={(e) => setNewAttrOptions(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm flex-1"
          />
          <button
            type="button"
            onClick={addAttribute}
            className="rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm flex items-center gap-1 whitespace-nowrap"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {combinations.length > 0 && (
        <div>
          <h3 className="font-medium mb-2 text-sm">
            Stock per Combination ({combinations.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {variants.map((v) => (
                    <th key={v.name} className="p-2 border-b">
                      {v.name}
                    </th>
                  ))}
                  <th className="p-2 border-b">SKU</th>
                  <th className="p-2 border-b">Stock</th>
                  <th className="p-2 border-b">Price override</th>
                </tr>
              </thead>
              <tbody>
                {combinations.map((c, i) => (
                  <tr key={comboKey(c.combination)} className="border-b">
                    {variants.map((v) => (
                      <td key={v.name} className="p-2">
                        {c.combination[v.name]}
                      </td>
                    ))}
                    <td className="p-2">
                      <input
                        value={c.sku ?? ""}
                        onChange={(e) => updateCombination(i, { sku: e.target.value })}
                        className="w-28 rounded border px-2 py-1"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min={0}
                        value={c.stock}
                        onChange={(e) =>
                          updateCombination(i, { stock: Number(e.target.value) })
                        }
                        className="w-20 rounded border px-2 py-1"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min={0}
                        placeholder="—"
                        value={c.price ?? ""}
                        onChange={(e) =>
                          updateCombination(i, {
                            price: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        className="w-24 rounded border px-2 py-1"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
