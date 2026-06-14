"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type LineItem = {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  btwRate: number;
};

type Klant = { id: string; name: string; email: string | null };

type Prefill = {
  id: string;
  customerId: string;
  title: string;
  lineItems: unknown;
  totalExclBtw: number;
  btwAmount: number;
  totalInclBtw: number;
  customer: Klant;
} | null;

const emptyItem = (): LineItem => ({
  description: "", quantity: 1, unit: "stuk", unitPrice: 0, btwRate: 21,
});

function calcTotals(items: LineItem[]) {
  const exclBtw = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const btw = items.reduce((s, i) => s + i.quantity * i.unitPrice * (i.btwRate / 100), 0);
  return { exclBtw, btw, inclBtw: exclBtw + btw };
}

// Default vervaldatum: 30 dagen vanaf vandaag
function defaultDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

export default function NieuweFactuurForm({
  prefill,
  klanten,
}: {
  prefill: Prefill;
  klanten: Klant[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const prefillItems = Array.isArray(prefill?.lineItems)
    ? (prefill.lineItems as LineItem[])
    : [emptyItem()];

  const [customerId, setCustomerId] = useState(prefill?.customer.id ?? "");
  const [dueDate, setDueDate] = useState(defaultDueDate());
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>(prefillItems);

  const totals = calcTotals(items);

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId) { setError("Selecteer een klant."); return; }
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/facturen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        quoteId: prefill?.id ?? null,
        dueDate,
        notes,
        lineItems: items,
        exclBtw: totals.exclBtw,
        btw: totals.btw,
        inclBtw: totals.inclBtw,
      }),
    });

    setLoading(false);
    if (!res.ok) { setError("Er is een fout opgetreden."); return; }
    const data = await res.json();
    router.push(`/admin/facturen/${data.id}`);
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <a href="/admin/facturen" className="text-gray-400 hover:text-gray-600 text-sm">← Facturen</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Nieuwe factuur</h1>
        {prefill && (
          <p className="text-sm text-gray-500 mt-1">
            Aangemaakt vanuit offerte <span className="font-mono">{prefill.id.slice(0, 8)}…</span>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Klant + datum */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Factuurgegevens</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Klant *</label>
              {prefill ? (
                <div className="border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-sm text-gray-700">
                  {prefill.customer.name}
                </div>
              ) : (
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Selecteer klant...</option>
                  {klanten.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name}{k.email ? ` — ${k.email}` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Factuurdatum</label>
              <input
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                readOnly
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vervaldatum *</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Regelitems */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Regelitems</h2>
          </div>
          <div className="p-6 space-y-3">
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <input
                    placeholder="Omschrijving"
                    value={item.description}
                    onChange={(e) => updateItem(i, "description", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="col-span-1">
                  <input
                    type="number" min="0" step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, "quantity", parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="col-span-1">
                  <input
                    placeholder="stuk"
                    value={item.unit}
                    onChange={(e) => updateItem(i, "unit", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="col-span-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                    <input
                      type="number" min="0" step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(i, "unitPrice", parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <select
                    value={item.btwRate}
                    onChange={(e) => updateItem(i, "btwRate", parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value={21}>21% BTW</option>
                    <option value={9}>9% BTW</option>
                    <option value={0}>0% BTW</option>
                  </select>
                </div>
                <div className="col-span-1 text-right">
                  <button type="button" onClick={() => setItems((p) => p.filter((_, j) => j !== i))}
                    className="text-gray-400 hover:text-red-500 transition-colors" disabled={items.length === 1}>✕</button>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setItems((p) => [...p, emptyItem()])}
              className="text-orange-500 hover:text-orange-700 text-sm font-medium mt-2">
              + Regel toevoegen
            </button>
          </div>

          {/* Totalen */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotaal excl. BTW</span>
              <span>€ {totals.exclBtw.toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>BTW</span>
              <span>€ {totals.btw.toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-200 pt-2 mt-2">
              <span>Totaal incl. BTW</span>
              <span>€ {totals.inclBtw.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>
        </div>

        {/* Notities */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Interne notities</label>
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            placeholder="Optionele notities..." />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        <div className="flex justify-end gap-3 pb-8">
          <a href="/admin/facturen" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Annuleren
          </a>
          <button type="submit" disabled={loading}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors">
            {loading ? "Opslaan..." : "Factuur aanmaken"}
          </button>
        </div>
      </form>
    </div>
  );
}
