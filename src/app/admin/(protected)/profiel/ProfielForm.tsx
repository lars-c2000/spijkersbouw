"use client";

import { useState } from "react";

type Props = {
  name: string;
  email: string;
};

export default function ProfielForm({ name, email }: Props) {
  const [pwForm, setPwForm] = useState({ current: "", new: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (pwForm.new !== pwForm.confirm) {
      setError("Nieuwe wachtwoorden komen niet overeen.");
      return;
    }
    if (pwForm.new.length < 8) {
      setError("Nieuw wachtwoord moet minimaal 8 tekens bevatten.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/admin/profiel", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.new }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Opslaan mislukt.");
      return;
    }
    setSuccess("Wachtwoord gewijzigd.");
    setPwForm({ current: "", new: "", confirm: "" });
  }

  return (
    <div className="space-y-6">
      {/* Accountgegevens (read-only) */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Accountgegevens</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Naam</label>
          <input
            value={name}
            readOnly
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mailadres</label>
          <input
            value={email}
            readOnly
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500"
          />
        </div>
        <p className="text-xs text-gray-400">Naam en e-mail kunnen worden gewijzigd via Gebruikersbeheer.</p>
      </div>

      {/* Wachtwoord wijzigen */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Wachtwoord wijzigen</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Huidig wachtwoord</label>
          <input
            type="password"
            required
            value={pwForm.current}
            onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nieuw wachtwoord</label>
          <input
            type="password"
            required
            minLength={8}
            value={pwForm.new}
            onChange={(e) => setPwForm({ ...pwForm, new: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Minimaal 8 tekens"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bevestig nieuw wachtwoord</label>
          <input
            type="password"
            required
            value={pwForm.confirm}
            onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Herhaal nieuw wachtwoord"
          />
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2 rounded-lg">{success}</div>}

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {saving ? "Opslaan..." : "Wachtwoord wijzigen"}
        </button>
      </form>
    </div>
  );
}
