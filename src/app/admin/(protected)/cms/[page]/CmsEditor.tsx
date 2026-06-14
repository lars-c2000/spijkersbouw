"use client";

import { useState } from "react";
import { CmsPageConfig } from "@/lib/cmsFields";

export default function CmsEditor({
  page,
  config,
  initialValues,
}: {
  page: string;
  config: CmsPageConfig;
  initialValues: Record<string, string>;
}) {
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/admin/cms/${page}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: values }),
    });
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="space-y-6">
      {config.fields.map((field) => (
        <div key={field.key} className="bg-white rounded-xl border border-gray-200 p-6">
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            {field.label}
          </label>
          <p className="text-xs text-gray-400 font-mono mb-3">{page}.{field.key}</p>
          {field.type === "textarea" || field.type === "html" ? (
            <textarea
              rows={field.type === "html" ? 8 : 4}
              value={values[field.key] ?? ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y font-mono"
            />
          ) : (
            <input
              type="text"
              value={values[field.key] ?? ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          )}
        </div>
      ))}

      <div className="flex items-center justify-between pb-8">
        <a href="/admin/cms" className="text-sm text-gray-500 hover:text-gray-700">
          ← Terug naar CMS
        </a>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-green-600 font-medium">✓ Opgeslagen</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? "Opslaan..." : "Opslaan"}
          </button>
        </div>
      </div>
    </div>
  );
}
