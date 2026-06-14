"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NieuweGebruikerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "MEDEWERKER",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/gebruikers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Er is een fout opgetreden.");
      return;
    }

    router.push("/admin/gebruikers");
    router.refresh();
  }

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <a href="/admin/gebruikers" className="text-gray-400 hover:text-gray-600 text-sm">← Gebruikers</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Gebruiker toevoegen</h1>
        <p className="text-gray-500 mt-1">De gebruiker kan direct inloggen met de opgegeven gegevens.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Volledige naam *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Jan de Vries"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mailadres *</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="jan@spijkersbouw.nl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tijdelijk wachtwoord *</label>
            <input
              required
              type="password"
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Minimaal 8 tekens"
            />
            <p className="text-xs text-gray-400 mt-1">Deel dit wachtwoord veilig mee. De gebruiker kan het later wijzigen via Profiel.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="MEDEWERKER">Medewerker — offertes en klanten</option>
              <option value="ADMIN">Admin — volledige toegang</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        <div className="flex justify-end gap-3">
          <a href="/admin/gebruikers" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Annuleren
          </a>
          <button type="submit" disabled={loading}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors">
            {loading ? "Aanmaken..." : "Gebruiker aanmaken"}
          </button>
        </div>
      </form>
    </div>
  );
}
