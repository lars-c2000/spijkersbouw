import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { QuoteStatus, InvoiceStatus } from "@/generated/prisma/client";

const quoteStatusLabel: Record<QuoteStatus, string> = {
  NIEUW: "Nieuw", IN_BEHANDELING: "In behandeling", VERSTUURD: "Verstuurd",
  GEWONNEN: "Gewonnen", VERLOREN: "Verloren",
};
const invoiceStatusLabel: Record<InvoiceStatus, string> = {
  CONCEPT: "Concept", VERZONDEN: "Verzonden", BETAALD: "Betaald", VERLOPEN: "Verlopen",
};
const invoiceStatusClasses: Record<InvoiceStatus, string> = {
  CONCEPT: "bg-gray-100 text-gray-600",
  VERZONDEN: "bg-blue-100 text-blue-700",
  BETAALD: "bg-green-100 text-green-700",
  VERLOPEN: "bg-red-100 text-red-700",
};

export default async function KlantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const klant = await prisma.customer.findUnique({
    where: { id },
    include: {
      quotes: { orderBy: { createdAt: "desc" } },
      invoices: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!klant) notFound();

  const omzetBetaald = klant.invoices
    .filter((f) => f.status === "BETAALD")
    .reduce((s, f) => s + f.totalInclBtw, 0);

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <Link href="/admin/klanten" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Klanten
        </Link>
        <div className="flex items-start justify-between mt-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{klant.name}</h1>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
              klant.type === "ZAKELIJK" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
            }`}>
              {klant.type === "ZAKELIJK" ? "Zakelijk" : "Particulier"}
            </span>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/admin/offertes/nieuw?klantId=${klant.id}`}
              className="border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Offerte
            </Link>
            <Link
              href={`/admin/klanten/${klant.id}/bewerken`}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Bewerken
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Offertes */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">Offertes ({klant.quotes.length})</h2>
              <Link href={`/admin/offertes/nieuw`} className="text-orange-500 text-sm hover:underline">
                + Nieuw
              </Link>
            </div>
            {klant.quotes.length === 0 ? (
              <p className="px-6 py-8 text-sm text-gray-400 text-center">Nog geen offertes.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-100">
                  {klant.quotes.map((q) => (
                    <tr key={q.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-mono text-xs text-gray-400">{q.number}</td>
                      <td className="px-4 py-3 text-gray-700 flex-1">{q.title}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">{quoteStatusLabel[q.status]}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {q.totalInclBtw > 0 ? `€ ${q.totalInclBtw.toFixed(2).replace(".", ",")}` : "—"}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <Link href={`/admin/offertes/${q.id}`} className="text-orange-500 text-xs hover:underline">
                          Openen →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Facturen */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">Facturen ({klant.invoices.length})</h2>
            </div>
            {klant.invoices.length === 0 ? (
              <p className="px-6 py-8 text-sm text-gray-400 text-center">Nog geen facturen.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-100">
                  {klant.invoices.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-mono text-xs text-gray-400">{f.number}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${invoiceStatusClasses[f.status]}`}>
                          {invoiceStatusLabel[f.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        € {f.totalInclBtw.toFixed(2).replace(".", ",")}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        Vervalt {f.dueDate.toLocaleDateString("nl-NL")}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <Link href={`/admin/facturen/${f.id}`} className="text-orange-500 text-xs hover:underline">
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

        {/* Zijbalk */}
        <div className="space-y-6">
          {/* Contactgegevens */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Contactgegevens</h2>
            <div className="space-y-3 text-sm">
              {klant.email && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">E-mail</p>
                  <a href={`mailto:${klant.email}`} className="text-orange-600 hover:underline">{klant.email}</a>
                </div>
              )}
              {klant.phone && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Telefoon</p>
                  <a href={`tel:${klant.phone}`} className="text-gray-700 hover:underline">{klant.phone}</a>
                </div>
              )}
              {(klant.address || klant.city) && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Adres</p>
                  <p className="text-gray-700">{klant.address}</p>
                  <p className="text-gray-700">{klant.postcode} {klant.city}</p>
                </div>
              )}
              {klant.kvk && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">KvK</p>
                  <p className="text-gray-700">{klant.kvk}</p>
                </div>
              )}
              {klant.btwNummer && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">BTW-nummer</p>
                  <p className="text-gray-700">{klant.btwNummer}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Statistieken</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Klant sinds</span>
                <span className="text-gray-900 font-medium">{klant.createdAt.toLocaleDateString("nl-NL")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Offertes</span>
                <span className="text-gray-900 font-medium">{klant.quotes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Facturen</span>
                <span className="text-gray-900 font-medium">{klant.invoices.length}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-3">
                <span className="text-gray-500">Omzet (betaald)</span>
                <span className="font-bold text-gray-900">€ {omzetBetaald.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>
          </div>

          {/* Notities */}
          {klant.notes && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Notities</h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{klant.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
