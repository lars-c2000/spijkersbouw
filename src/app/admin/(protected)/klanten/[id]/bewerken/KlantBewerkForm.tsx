"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CustomerType } from "@/generated/prisma/client";

type Klant = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postcode: string | null;
  type: CustomerType;
  kvk: string | null;
  btwNummer: string | null;
  notes: string | null;
};

export default function KlantBewerkForm({ klant }: { klant: Klant }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: klant.name,
    email: klant.email ?? "",
    phone: klant.phone ?? "",
    address: klant.address ?? "",
    city: klant.city ?? "",
    postcode: klant.postcode ?? "",
    type: klant.type as string,
    kvk: klant.kvk ?? "",
    btwNummer: klant.btwNummer ?? "",
    notes: klant.notes ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch(`/api/admin/klanten/${klant.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) { setError("Opslaan mislukt."); return; }
    router.push(`/admin/klanten/${klant.id}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Weet je zeker dat je ${klant.name} wilt verwijderen? Alle bijbehorende offertes en facturen blijven bestaan maar zijn niet meer aan een klant gekoppeld.`)) return;
    await fetch(`/api/admin/klanten/${klant.id}`, { method: "DELETE" });
    router.push("/admin/klanten");
    router.refresh();
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
          placeholder="Interne notities..."
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="flex items-center justify-between pb-8">
        <button
          type="button"
          onClick={handleDelete}
          className="px-4 py-2 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
        >
          Klant verwijderen
        </button>
        <div className="flex gap-3">
          <a
            href={`/admin/klanten/${klant.id}`}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuleren
          </a>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? "Opslaan..." : "Wijzigingen opslaan"}
          </button>
        </div>
      </div>
    </form>
  );
}
