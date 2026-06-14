"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/generated/prisma/client";

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
};

export default function GebruikerEditForm({
  user,
  isMe,
}: {
  user: User;
  isMe: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({ name: user.name, role: user.role });
  const [pwForm, setPwForm] = useState({ newPassword: "", confirmPassword: "" });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    setSaving(true);
    const res = await fetch(`/api/admin/gebruikers/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) { setError("Opslaan mislukt."); return; }
    setSuccess("Gegevens opgeslagen.");
    router.refresh();
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setError("Wachtwoorden komen niet overeen.");
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/admin/gebruikers/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pwForm.newPassword }),
    });
    setSaving(false);
    if (!res.ok) { setError("Wachtwoord wijzigen mislukt."); return; }
    setSuccess("Wachtwoord gewijzigd.");
    setPwForm({ newPassword: "", confirmPassword: "" });
  }

  async function handleDelete() {
    if (isMe) return;
    if (!confirm(`Weet je zeker dat je ${user.name} wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) return;
    await fetch(`/api/admin/gebruikers/${user.id}`, { method: "DELETE" });
    router.push("/admin/gebruikers");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Basisgegevens */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Gegevens</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Naam</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
          <input
            value={user.email}
            readOnly
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
            disabled={isMe}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50 disabled:text-gray-500"
          >
            <option value="MEDEWERKER">Medewerker</option>
            <option value="ADMIN">Admin</option>
          </select>
          {isMe && <p className="text-xs text-gray-400 mt-1">Je kunt je eigen rol niet wijzigen.</p>}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2 rounded-lg">{success}</div>}

        <button type="submit" disabled={saving}
          className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors">
          {saving ? "Opslaan..." : "Opslaan"}
        </button>
      </form>

      {/* Wachtwoord resetten */}
      <form onSubmit={handleResetPassword} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Wachtwoord instellen</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nieuw wachtwoord</label>
          <input
            type="password"
            required
            minLength={8}
            value={pwForm.newPassword}
            onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Minimaal 8 tekens"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bevestig wachtwoord</label>
          <input
            type="password"
            required
            value={pwForm.confirmPassword}
            onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Herhaal nieuw wachtwoord"
          />
        </div>
        <button type="submit" disabled={saving}
          className="px-5 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors">
          Wachtwoord wijzigen
        </button>
      </form>

      {/* Verwijderen */}
      {!isMe && (
        <div className="bg-white rounded-xl border border-red-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-2">Gebruiker verwijderen</h2>
          <p className="text-sm text-gray-500 mb-4">
            Dit verwijdert de toegang van {user.name} tot het beheerpaneel. Dit kan niet ongedaan worden gemaakt.
          </p>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Gebruiker verwijderen
          </button>
        </div>
      )}
    </div>
  );
}
