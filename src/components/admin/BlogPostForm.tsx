"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Post = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  published: boolean;
};

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function BlogPostForm({ initial }: { initial?: Partial<Post> }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [autoSlug, setAutoSlug] = useState(!isEdit);

  const [form, setForm] = useState<Post>({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "",
    category: initial?.category ?? "Nieuws",
    published: initial?.published ?? false,
  });

  function handleTitleChange(title: string) {
    setForm((prev) => ({
      ...prev,
      title,
      slug: autoSlug ? slugify(title) : prev.slug,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const url = isEdit ? `/api/admin/blog/${initial!.id}` : "/api/admin/blog";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Er is een fout opgetreden.");
      return;
    }

    const data = await res.json();
    router.push(`/admin/cms/blog/${data.id}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Weet je zeker dat je dit artikel wilt verwijderen?")) return;
    await fetch(`/api/admin/blog/${initial!.id}`, { method: "DELETE" });
    router.push("/admin/cms/blog");
    router.refresh();
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <a href="/admin/cms/blog" className="text-gray-400 hover:text-gray-600 text-sm">← Blog</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          {isEdit ? "Artikel bewerken" : "Nieuw artikel"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Metadata */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
            <input
              required
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Hoe kies je de juiste dakkapel?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL slug *
              <span className="text-gray-400 font-normal ml-1">(wordt gebruikt in /blog/…)</span>
            </label>
            <div className="flex gap-2">
              <input
                required
                value={form.slug}
                onChange={(e) => {
                  setAutoSlug(false);
                  setForm({ ...form, slug: e.target.value });
                }}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="hoe-kies-je-de-juiste-dakkapel"
              />
              <button
                type="button"
                onClick={() => { setAutoSlug(true); setForm((f) => ({ ...f, slug: slugify(f.title) })); }}
                className="text-xs text-gray-500 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50"
              >
                Auto
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option>Nieuws</option>
                <option>Tips</option>
                <option>Projecten</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Gepubliceerd</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Korte samenvatting</label>
            <textarea
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              placeholder="Korte samenvatting die in de lijstweergave wordt getoond..."
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Inhoud *
            <span className="text-gray-400 font-normal ml-1">(platte tekst of HTML)</span>
          </label>
          <textarea
            required
            rows={20}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y"
            placeholder="Schrijf hier de volledige inhoud van het artikel..."
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        <div className="flex items-center justify-between pb-8">
          {isEdit ? (
            <button
              type="button"
              onClick={handleDelete}
              className="text-sm text-red-500 hover:text-red-700 font-medium"
            >
              Artikel verwijderen
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            <a href="/admin/cms/blog" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Annuleren
            </a>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? "Opslaan..." : isEdit ? "Wijzigingen opslaan" : "Artikel aanmaken"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
