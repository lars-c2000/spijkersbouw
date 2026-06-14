"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NieuweKlantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "",
    city: "", postcode: "", type: "PARTICULIER",
    kvk: "", btwNummer: "", notes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/klanten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) { setError("Er is een fout opgetreden."); return; }
    const data = await res.json();
    router.push(`/admin/klanten/${data.id}`);
  }

  const field = (label: string, name: keyof typeof form, opts?: { type?: string; placeholder?: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={opts?.type ?? "text"}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        placeholder={opts?.placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
    </div>
  );

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <a href="/admin/klanten" className="text-gray-400 hover:text-gray-600 text-sm">← Klanten</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Nieuwe klant</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Contactgegevens</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Naam *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jan de Vries"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="PARTICULIER">Particulier</option>
                <option value="ZAKELIJK">Zakelijk</option>
              </select>
            </div>
            {field("E-mail", "email", { type: "email", placeholder: "jan@example.nl" })}
            {field("Telefoon", "phone", { placeholder: "06-12345678" })}
            {field("Adres", "address", { placeholder: "Straatnaam 1" })}
            {field("Postcode", "postcode", { placeholder: "5000 AA" })}
            {field("Plaats", "city", { placeholder: "Tilburg" })}
            {form.type === "ZAKELIJK" && field("KvK-nummer", "kvk", { placeholder: "12345678" })}
            {form.type === "ZAKELIJK" && field("BTW-nummer", "btwNummer", { placeholder: "NL123456789B01" })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notities</label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            placeholder="Interne notities over deze klant..."
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        <div className="flex justify-end gap-3 pb-8">
          <a href="/admin/klanten" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Annuleren
          </a>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? "Opslaan..." : "Klant aanmaken"}
          </button>
        </div>
      </form>
    </div>
  );
}
