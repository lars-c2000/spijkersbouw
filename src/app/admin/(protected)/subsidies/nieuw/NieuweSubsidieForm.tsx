"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MaatregelType,
  MAATREGEL_LABELS,
  MAATREGEL_EENHEID,
  TECH_EISEN,
  berekenSubsidie,
  fmtSubsidie,
} from "@/lib/subsidieRules";

type Klant = { id: string; name: string };
type Quote = { id: string; number: string; title: string };

type Maatregel = {
  type: MaatregelType;
  oppervlakte: string;
  uWaarde: string;
  rdWaarde: string;
  productMerk: string;
  productModel: string;
};

const leegeMaatregel = (): Maatregel => ({
  type: MaatregelType.DAKISOLATIE,
  oppervlakte: "",
  uWaarde: "",
  rdWaarde: "",
  productMerk: "",
  productModel: "",
});

const ALLE_TYPES = Object.values(MaatregelType) as MaatregelType[];

export default function NieuweSubsidieForm({
  klanten,
  quotesByKlant,
  defaultQuoteId,
  defaultKlantId,
}: {
  klanten: Klant[];
  quotesByKlant: Record<string, Quote[]>;
  defaultQuoteId?: string;
  defaultKlantId?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [klantId, setKlantId] = useState(defaultKlantId ?? "");
  const [quoteId, setQuoteId] = useState(defaultQuoteId ?? "");
  const [projectAdres, setProjectAdres] = useState("");
  const [meldcode, setMeldcode] = useState("");
  const [notes, setNotes] = useState("");
  const [maatregelen, setMaatregelen] = useState<Maatregel[]>([leegeMaatregel()]);

  const beschikbareQuotes = klantId ? (quotesByKlant[klantId] ?? []) : [];

  const updateMaatregel = useCallback((i: number, patch: Partial<Maatregel>) => {
    setMaatregelen((prev) => prev.map((m, idx) => idx === i ? { ...m, ...patch } : m));
  }, []);

  const addMaatregel = () => setMaatregelen((prev) => [...prev, leegeMaatregel()]);
  const removeMaatregel = (i: number) => setMaatregelen((prev) => prev.filter((_, idx) => idx !== i));

  // Live berekening
  const inputs = maatregelen
    .map((m) => ({ type: m.type, oppervlakte: parseFloat(m.oppervlakte) }))
    .filter((m) => m.oppervlakte > 0);

  const berekening = inputs.length > 0 ? berekenSubsidie(inputs) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const payload = maatregelen.map((m) => ({
      type: m.type,
      oppervlakte: parseFloat(m.oppervlakte),
      uWaarde: m.uWaarde ? parseFloat(m.uWaarde) : null,
      rdWaarde: m.rdWaarde ? parseFloat(m.rdWaarde) : null,
      productMerk: m.productMerk || undefined,
      productModel: m.productModel || undefined,
    }));

    const invalid = payload.find((m) => !m.oppervlakte || isNaN(m.oppervlakte));
    if (invalid) { setError("Vul bij alle maatregelen een geldige oppervlakte in."); return; }

    setLoading(true);
    const res = await fetch("/api/admin/subsidies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: klantId,
        quoteId: quoteId || null,
        projectAdres: projectAdres || undefined,
        meldcode: meldcode || undefined,
        notes: notes || undefined,
        maatregelen: payload,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Er is een fout opgetreden.");
      return;
    }
    const { id } = await res.json();
    router.push(`/admin/subsidies/${id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Klant + offerte */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Project & klant</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Klant *</label>
            <select
              required
              value={klantId}
              onChange={(e) => { setKlantId(e.target.value); setQuoteId(""); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Selecteer klant</option>
              {klanten.map((k) => (
                <option key={k.id} value={k.id}>{k.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gekoppelde offerte</label>
            <select
              value={quoteId}
              onChange={(e) => setQuoteId(e.target.value)}
              disabled={!klantId || beschikbareQuotes.length === 0}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">Geen offerte</option>
              {beschikbareQuotes.map((q) => (
                <option key={q.id} value={q.id}>{q.number} — {q.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Projectadres</label>
            <input
              type="text"
              value={projectAdres}
              onChange={(e) => setProjectAdres(e.target.value)}
              placeholder="Straat 1, 5000 AA Tilburg"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meldcode RVO
              <span className="ml-1 text-xs text-gray-400">(aanvragen vóór aanvang werk)</span>
            </label>
            <input
              type="text"
              value={meldcode}
              onChange={(e) => setMeldcode(e.target.value)}
              placeholder="RVO meldcode"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Maatregelen */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Maatregelen</h2>
          {berekening && (
            <div className="flex items-center gap-3">
              {berekening.combinatieBonus && (
                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                  2× combinatiebonus actief
                </span>
              )}
              <span className="text-lg font-bold text-green-700">{fmtSubsidie(berekening.totaalSubsidie)}</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {maatregelen.map((m, i) => {
            const eisen = TECH_EISEN[m.type];
            const needsU = eisen.uWaardeMax !== undefined;
            const needsRd = eisen.rdWaardeMin !== undefined;
            const berekend = berekening?.maatregelen.find((bm) => bm.type === m.type);

            return (
              <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Maatregel {i + 1}</span>
                  <div className="flex items-center gap-3">
                    {berekend && (
                      <span className="text-sm font-semibold text-green-700">
                        {fmtSubsidie(berekend.subsidie)}
                        <span className="text-xs text-gray-400 font-normal ml-1">
                          ({fmtSubsidie(berekend.tarief)}/m²)
                        </span>
                      </span>
                    )}
                    {maatregelen.length > 1 && (
                      <button type="button" onClick={() => removeMaatregel(i)} className="text-red-400 hover:text-red-600 text-xs">
                        Verwijderen
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Type maatregel</label>
                    <select
                      value={m.type}
                      onChange={(e) => updateMaatregel(i, { type: e.target.value as MaatregelType })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {ALLE_TYPES.map((t) => (
                        <option key={t} value={t}>{MAATREGEL_LABELS[t]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Oppervlakte ({MAATREGEL_EENHEID[m.type]})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      required
                      value={m.oppervlakte}
                      onChange={(e) => updateMaatregel(i, { oppervlakte: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="0.0"
                    />
                  </div>
                  {needsU && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        U-waarde (max {eisen.uWaardeMax} W/m²K)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={m.uWaarde}
                        onChange={(e) => updateMaatregel(i, { uWaarde: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder={`≤ ${eisen.uWaardeMax}`}
                      />
                    </div>
                  )}
                  {needsRd && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Rd-waarde (min {eisen.rdWaardeMin} m²K/W)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={m.rdWaarde}
                        onChange={(e) => updateMaatregel(i, { rdWaarde: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder={`≥ ${eisen.rdWaardeMin}`}
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Product / merk</label>
                    <input
                      type="text"
                      value={m.productMerk}
                      onChange={(e) => updateMaatregel(i, { productMerk: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Bijv. Pilkington"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Model / type</label>
                    <input
                      type="text"
                      value={m.productModel}
                      onChange={(e) => updateMaatregel(i, { productModel: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Bijv. Optitherm S3"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addMaatregel}
          className="text-orange-500 hover:text-orange-600 text-sm font-medium"
        >
          + Maatregel toevoegen
        </button>

        {maatregelen.length === 1 && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Tip: voeg een tweede maatregel toe voor de combinatiebonus — tarieven verdubbelen automatisch.
          </p>
        )}
      </div>

      {/* Notities */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Interne notities</label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
          placeholder="Bijzonderheden voor intern gebruik..."
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="flex justify-end gap-3 pb-8">
        <a href="/admin/subsidies" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          Annuleren
        </a>
        <button
          type="submit"
          disabled={loading || !klantId}
          className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? "Aanmaken..." : `Aanvraag aanmaken${berekening ? ` — ${fmtSubsidie(berekening.totaalSubsidie)}` : ""}`}
        </button>
      </div>
    </form>
  );
}
