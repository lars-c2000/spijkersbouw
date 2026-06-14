import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { SubsidieStatus } from "@/generated/prisma/client";
import { fmtSubsidie } from "@/lib/subsidieRules";

const statusLabel: Record<SubsidieStatus, string> = {
  CONCEPT: "Concept",
  IN_BEHANDELING: "In behandeling",
  INGEDIEND: "Ingediend",
  GOEDGEKEURD: "Goedgekeurd",
  AFGEWEZEN: "Afgewezen",
  UITBETAALD: "Uitbetaald",
};

const statusClass: Record<SubsidieStatus, string> = {
  CONCEPT: "bg-gray-100 text-gray-600",
  IN_BEHANDELING: "bg-blue-100 text-blue-700",
  INGEDIEND: "bg-yellow-100 text-yellow-700",
  GOEDGEKEURD: "bg-green-100 text-green-700",
  AFGEWEZEN: "bg-red-100 text-red-700",
  UITBETAALD: "bg-emerald-100 text-emerald-700",
};

export default async function SubsidiesPage() {
  const aanvragen = await prisma.subsidieAanvraag.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: { select: { name: true } } },
  });

  const totaalGoedgekeurd = aanvragen
    .filter((a) => a.status === "GOEDGEKEURD" || a.status === "UITBETAALD")
    .reduce((s, a) => s + a.totaalSubsidie, 0);

  const totaalPipeline = aanvragen
    .filter((a) => !["AFGEWEZEN"].includes(a.status))
    .reduce((s, a) => s + a.totaalSubsidie, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subsidies</h1>
          <p className="text-gray-500 mt-1">ISDE-subsidieaanvragen beheren en aannemersverklaringen genereren.</p>
        </div>
        <Link
          href="/admin/subsidies/nieuw"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nieuwe aanvraag
        </Link>
      </div>

      {/* KPI rij */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Totaal aanvragen</p>
          <p className="text-2xl font-bold text-gray-900">{aanvragen.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Subsidie pipeline</p>
          <p className="text-2xl font-bold text-blue-600">{fmtSubsidie(totaalPipeline)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Goedgekeurd / uitbetaald</p>
          <p className="text-2xl font-bold text-green-600">{fmtSubsidie(totaalGoedgekeurd)}</p>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {aanvragen.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 mb-4">Nog geen subsidieaanvragen.</p>
            <Link href="/admin/subsidies/nieuw" className="text-orange-500 hover:underline text-sm font-medium">
              Eerste aanvraag aanmaken →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 font-medium text-gray-500">Nummer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Klant</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Bonus</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Subsidie</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Datum</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {aanvragen.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-mono text-xs text-gray-400">{a.number}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{a.customer.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[a.status]}`}>
                      {statusLabel[a.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {a.combinatieBonus && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        2× bonus
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    {fmtSubsidie(a.totaalSubsidie)}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {a.createdAt.toLocaleDateString("nl-NL")}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link href={`/admin/subsidies/${a.id}`} className="text-orange-500 text-xs hover:underline">
                      Openen →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
