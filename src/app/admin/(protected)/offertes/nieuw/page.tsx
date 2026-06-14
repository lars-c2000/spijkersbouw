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

const emptyItem = (): LineItem => ({
  description: "",
  quantity: 1,
  unit: "stuk",
  unitPrice: 0,
  btwRate: 21,
});

function calcTotals(items: LineItem[]) {
  const exclBtw = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const btw = items.reduce((s, i) => s + i.quantity * i.unitPrice * (i.btwRate / 100), 0);
  return { exclBtw, btw, inclBtw: exclBtw + btw };
}

export default function NieuweOffertePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    customerCity: "",
    customerPostcode: "",
    title: "",
    projectType: "",
    description: "",
    notes: "",
    validUntil: "",
  });

  const [items, setItems] = useState<LineItem[]>([emptyItem()]);

  const totals = calcTotals(items);

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/offertes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, lineItems: items, ...totals }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Er is een fout opgetreden. Probeer het opnieuw.");
      return;
    }

    const data = await res.json();
    router.push(`/admin/offertes/${data.id}`);
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <a href="/admin/offertes" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Offertes
        </a>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Nieuwe offerte</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Klantgegevens */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Klantgegevens</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Naam *</label>
              <input
                required
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Jan de Vries"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                value={form.customerEmail}
                onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="jan@example.nl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefoon</label>
              <input
                value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="06-12345678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
              <input
                value={form.customerAddress}
                onChange={(e) => setForm({ ...form, customerAddress: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Straatnaam 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
              <input
                value={form.customerPostcode}
                onChange={(e) => setForm({ ...form, customerPostcode: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="5000 AA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plaats</label>
              <input
                value={form.customerCity}
                onChange={(e) => setForm({ ...form, customerCity: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Tilburg"
              />
            </div>
          </div>
        </div>

        {/* Offerte details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Offerte details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Offerte dakkapel plaatsen"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type project</label>
              <select
                value={form.projectType}
                onChange={(e) => setForm({ ...form, projectType: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Selecteer type</option>
                <option>Nieuwbouw</option>
                <option>Renovatie</option>
                <option>Aanbouw</option>
                <option>Timmerwerk</option>
                <option>Dakkapel</option>
                <option>Maatwerk meubels</option>
                <option>Overig</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Geldig tot</label>
              <input
                type="date"
                value={form.validUntil}
                onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Omschrijving</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                placeholder="Beschrijf het project..."
              />
            </div>
          </div>
        </div>

        {/* Regelitems */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
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
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Aantal"
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
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0,00"
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
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    disabled={items.length === 1}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addItem}
              className="text-orange-500 hover:text-orange-700 text-sm font-medium mt-2"
            >
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
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            placeholder="Notities voor intern gebruik..."
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pb-8">
          <a
            href="/admin/offertes"
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuleren
          </a>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? "Opslaan..." : "Offerte aanmaken"}
          </button>
        </div>
      </form>
    </div>
  );
}
