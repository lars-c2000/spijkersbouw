import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SubsidieStatus } from "@/generated/prisma/client";
import {
  MAATREGEL_LABELS,
  getDocumentChecklist,
  fmtSubsidie,
} from "@/lib/subsidieRules";
import SubsidieStatusSelect from "./SubsidieStatusSelect";

const statusLabel: Record<SubsidieStatus, string> = {
  CONCEPT: "Concept",
  IN_BEHANDELING: "In behandeling",
  INGEDIEND: "Ingediend",
  GOEDGEKEURD: "Goedgekeurd",
  AFGEWEZEN: "Afgewezen",
  UITBETAALD: "Uitbetaald",
};

const statusClass: Record<SubsidieStatus, string> = {
  CONCEPT: "bg-gray-100 text-gray-700",
  IN_BEHANDELING: "bg-blue-100 text-blue-700",
  INGEDIEND: "bg-yellow-100 text-yellow-700",
  GOEDGEKEURD: "bg-green-100 text-green-700",
  AFGEWEZEN: "bg-red-100 text-red-700",
  UITBETAALD: "bg-emerald-100 text-emerald-700",
};

export default async function SubsidieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const aanvraag = await prisma.subsidieAanvraag.findUnique({
    where: { id },
    include: {
      customer: true,
      quote: { select: { id: true, number: true, title: true } },
      maatregelen: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!aanvraag) notFound();

  const checklist = getDocumentChecklist(aanvraag.maatregelen.map((m) => m.type));

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/subsidies" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Subsidies
        </Link>
        <div className="flex items-start justify-between mt-2">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{aanvraag.number}</h1>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[aanvraag.status]}`}>
                {statusLabel[aanvraag.status]}
              </span>
              {aanvraag.combinatieBonus && (
                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                  2× combinatiebonus
                </span>
              )}
            </div>
            <p className="text-gray-500 mt-1">{aanvraag.customer.name}</p>
          </div>
          <a
            href={`/api/admin/subsidies/${id}/pdf`}
            target="_blank"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Download aannemersverklaring
          </a>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Hoofdkolom */}
        <div className="col-span-2 space-y-6">
          {/* Maatregelen tabel */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Maatregelen</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Maatregel</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">m²</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Technische waarde</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Product</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Tarief</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500">Subsidie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {aanvraag.maatregelen.map((m) => {
                  const spec = m.uWaarde != null
                    ? `Uw = ${m.uWaarde} W/m²K`
                    : m.rdWaarde != null
                    ? `Rd = ${m.rdWaarde} m²K/W`
                    : "—";
                  const product = [m.productMerk, m.productModel].filter(Boolean).join(" ") || "—";
                  return (
                    <tr key={m.id}>
                      <td className="px-6 py-3 font-medium text-gray-900">{MAATREGEL_LABELS[m.type]}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{m.oppervlakte} m²</td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{spec}</td>
                      <td className="px-4 py-3 text-gray-600">{product}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{fmtSubsidie(m.tarief)}/m²</td>
                      <td className="px-6 py-3 text-right font-semibold text-green-700">{fmtSubsidie(m.subsidie)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-green-50 border-t-2 border-green-200">
                  <td colSpan={5} className="px-6 py-3 font-semibold text-green-800">
                    Totaal subsidie {aanvraag.combinatieBonus ? "(incl. 2× combinatiebonus)" : ""}
                  </td>
                  <td className="px-6 py-3 text-right font-bold text-green-700 text-base">
                    {fmtSubsidie(aanvraag.totaalSubsidie)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Document checklist */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Document checklist</h2>
            <p className="text-xs text-gray-500 mb-4">
              Alle onderstaande documenten zijn nodig voor een complete ISDE-aanvraag bij RVO.
            </p>
            <ul className="space-y-3">
              {checklist.map((doc) => (
                <li key={doc.id} className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 border-2 ${doc.required ? "border-orange-400" : "border-gray-300"}`} />
                  <div>
                    <p className={`text-sm font-medium ${doc.required ? "text-gray-900" : "text-gray-600"}`}>
                      {doc.label}
                      {!doc.required && <span className="text-xs text-gray-400 font-normal ml-1">(aanbevolen)</span>}
                    </p>
                    {doc.toelichting && <p className="text-xs text-gray-500 mt-0.5">{doc.toelichting}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Meldcode waarschuwing */}
          {!aanvraag.meldcode && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-medium text-amber-800">Let op: geen meldcode ingevuld</p>
              <p className="text-xs text-amber-700 mt-1">
                De meldcode moet bij RVO worden aangevraagd vóórdat de werkzaamheden beginnen. Zonder meldcode op de factuur is de subsidie niet aan te vragen.
              </p>
            </div>
          )}

          {/* Notities */}
          {aanvraag.notes && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Notities</h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{aanvraag.notes}</p>
            </div>
          )}
        </div>

        {/* Zijbalk */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Status</h2>
            <SubsidieStatusSelect aanvraagId={aanvraag.id} current={aanvraag.status} />
            {aanvraag.indieningsDatum && (
              <p className="text-xs text-gray-500 mt-2">
                Ingediend: {aanvraag.indieningsDatum.toLocaleDateString("nl-NL")}
              </p>
            )}
            {aanvraag.beschikkingsDatum && (
              <p className="text-xs text-gray-500 mt-1">
                Beschikking: {aanvraag.beschikkingsDatum.toLocaleDateString("nl-NL")}
              </p>
            )}
          </div>

          {/* Subsidie samenvatting */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Subsidie</h2>
            <div className="space-y-2 text-sm">
              {aanvraag.maatregelen.map((m) => (
                <div key={m.id} className="flex justify-between">
                  <span className="text-gray-500 text-xs">{MAATREGEL_LABELS[m.type]}</span>
                  <span className="text-gray-700">{fmtSubsidie(m.subsidie)}</span>
                </div>
              ))}
              {aanvraag.combinatieBonus && (
                <div className="flex justify-between text-orange-600 text-xs font-medium">
                  <span>2× combinatiebonus</span>
                  <span>actief</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
                <span className="font-semibold text-gray-900">Totaal</span>
                <span className="font-bold text-green-700">{fmtSubsidie(aanvraag.totaalSubsidie)}</span>
              </div>
            </div>
          </div>

          {/* Projectgegevens */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Projectgegevens</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Klant</p>
                <Link href={`/admin/klanten/${aanvraag.customer.id}`} className="text-orange-500 hover:underline">
                  {aanvraag.customer.name}
                </Link>
              </div>
              {aanvraag.projectAdres && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Projectadres</p>
                  <p className="text-gray-700">{aanvraag.projectAdres}</p>
                </div>
              )}
              {aanvraag.meldcode && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Meldcode RVO</p>
                  <p className="text-gray-700 font-mono">{aanvraag.meldcode}</p>
                </div>
              )}
              {aanvraag.quote && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Gekoppelde offerte</p>
                  <Link href={`/admin/offertes/${aanvraag.quote.id}`} className="text-orange-500 hover:underline">
                    {aanvraag.quote.number} — {aanvraag.quote.title}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Externe link RVO */}
          <a
            href="https://mijn.rvo.nl/isde"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Aanvragen bij RVO.nl
          </a>
        </div>
      </div>
    </div>
  );
}
