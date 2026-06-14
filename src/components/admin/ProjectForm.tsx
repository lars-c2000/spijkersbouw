"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProjectData = {
  id?: string;
  title: string;
  description: string;
  category: string;
  year: number;
  published: boolean;
};

const CATEGORIES = ["Nieuwbouw", "Renovatie", "Aanbouw", "Timmerwerk", "Dakkapel", "Maatwerk meubels"];

export default function ProjectForm({ initial }: { initial?: Partial<ProjectData> }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<ProjectData>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    category: initial?.category ?? "Renovatie",
    year: initial?.year ?? new Date().getFullYear(),
    published: initial?.published ?? false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const url = isEdit ? `/api/admin/projecten/${initial!.id}` : "/api/admin/projecten";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Er is een fout opgetreden.");
      return;
    }

    const data = await res.json();
    router.push(`/admin/cms/projecten/${data.id}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Weet je zeker dat je dit project wilt verwijderen?")) return;
    await fetch(`/api/admin/projecten/${initial!.id}`, { method: "DELETE" });
    router.push("/admin/cms/projecten");
    router.refresh();
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <a href="/admin/cms/projecten" className="text-gray-400 hover:text-gray-600 text-sm">← Projecten</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          {isEdit ? "Project bewerken" : "Nieuw project"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Dakkapel plaatsen Tilburg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jaar</label>
              <input
                type="number"
                min={2000}
                max={2099}
                value={form.year}
                onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Omschrijving</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              placeholder="Beschrijf dit project in een paar zinnen..."
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="w-4 h-4 accent-orange-500"
            />
            <span className="text-sm font-medium text-gray-700">Tonen op website</span>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        <div className="flex items-center justify-between pb-8">
          {isEdit ? (
            <button type="button" onClick={handleDelete} className="text-sm text-red-500 hover:text-red-700 font-medium">
              Project verwijderen
            </button>
          ) : <span />}
          <div className="flex gap-3">
            <a href="/admin/cms/projecten" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Annuleren
            </a>
            <button type="submit" disabled={loading}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors">
              {loading ? "Opslaan..." : isEdit ? "Wijzigingen opslaan" : "Project aanmaken"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
