import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { QuoteStatus } from "@/generated/prisma/client";
import QuoteStatusSelect from "./QuoteStatusSelect";
import SubsidieHints from "@/components/admin/SubsidieHints";

const statusConfig: Record<QuoteStatus, { label: string; classes: string }> = {
  NIEUW: { label: "Nieuw", classes: "bg-blue-100 text-blue-700" },
  IN_BEHANDELING: { label: "In behandeling", classes: "bg-yellow-100 text-yellow-700" },
  VERSTUURD: { label: "Verstuurd", classes: "bg-purple-100 text-purple-700" },
  GEWONNEN: { label: "Gewonnen", classes: "bg-green-100 text-green-700" },
  VERLOREN: { label: "Verloren", classes: "bg-red-100 text-red-700" },
};

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      customer: true,
      invoice: { select: { id: true, number: true, status: true } },
      subsidieAanvraag: { select: { id: true, number: true, totaalSubsidie: true, status: true } },
    },
  });

  if (!quote) notFound();

  const cfg = statusConfig[quote.status];
  const lineItems = Array.isArray(quote.lineItems) ? quote.lineItems as {
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    btwRate: number;
  }[] : [];

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/admin/offertes" className="text-gray-400 hover:text-gray-600 text-sm">
              ← Offertes
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{quote.number}</h1>
          <p className="text-gray-500 mt-1">{quote.title}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${cfg.classes}`}>
            {cfg.label}
          </span>
          {!quote.invoice && (
            <Link
              href={`/admin/facturen/nieuw?quoteId=${quote.id}`}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Factuur aanmaken
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Hoofdinhoud */}
        <div className="col-span-2 space-y-6">
          {/* Regelitems */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Regelitems</h2>
            </div>
            {lineItems.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-400 text-sm">
                Nog geen regelitems. Bewerk de offerte om items toe te voegen.
              </div>
            ) : (
              <>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold">Omschrijving</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-500 font-semibold">Aantal</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-500 font-semibold">Prijs</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-500 font-semibold">BTW</th>
                      <th className="text-right px-6 py-3 text-xs text-gray-500 font-semibold">Totaal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {lineItems.map((item, i) => (
                      <tr key={i}>
                        <td className="px-6 py-3 text-gray-700">{item.description}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{item.quantity} {item.unit}</td>
                        <td className="px-4 py-3 text-right text-gray-600">€ {item.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{item.btwRate}%</td>
                        <td className="px-6 py-3 text-right font-medium text-gray-900">
                          € {(item.quantity * item.unitPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 space-y-1 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotaal excl. BTW</span>
                    <span>€ {quote.totalExclBtw.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>BTW</span>
                    <span>€ {quote.btwAmount.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-200 pt-2 mt-2">
                    <span>Totaal incl. BTW</span>
                    <span>€ {quote.totalInclBtw.toFixed(2).replace(".", ",")}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Omschrijving */}
          {quote.description && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Omschrijving</h2>
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{quote.description}</p>
            </div>
          )}

          {/* Gekoppelde factuur */}
          {quote.invoice && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Factuur</h2>
              <Link
                href={`/admin/facturen/${quote.invoice.id}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="font-mono text-sm text-gray-700">{quote.invoice.number}</span>
                <span className="text-orange-500 text-sm">Openen →</span>
              </Link>
            </div>
          )}
        </div>

        {/* Zijbalk */}
        <div className="space-y-6">
          {/* Klantinfo */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Klant</h2>
            <div className="space-y-2 text-sm">
              <Link
                href={`/admin/klanten/${quote.customer.id}`}
                className="font-medium text-orange-600 hover:underline block"
              >
                {quote.customer.name}
              </Link>
              {quote.customer.email && (
                <p className="text-gray-500">{quote.customer.email}</p>
              )}
              {quote.customer.phone && (
                <p className="text-gray-500">{quote.customer.phone}</p>
              )}
              {quote.customer.address && (
                <p className="text-gray-500">{quote.customer.address}</p>
              )}
              {quote.customer.city && (
                <p className="text-gray-500">{quote.customer.postcode} {quote.customer.city}</p>
              )}
            </div>
          </div>

          {/* Status wijzigen */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Status</h2>
            <QuoteStatusSelect quoteId={quote.id} currentStatus={quote.status} />
          </div>

          {/* Subsidie hints */}
          <SubsidieHints quoteId={quote.id} bestaandeAanvraag={quote.subsidieAanvraag ?? null} lineItems={lineItems} />

          {/* Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Details</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Type project</p>
                <p className="text-gray-700">{quote.projectType ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Aangemaakt</p>
                <p className="text-gray-700">{quote.createdAt.toLocaleDateString("nl-NL")}</p>
              </div>
              {quote.validUntil && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Geldig tot</p>
                  <p className="text-gray-700">{quote.validUntil.toLocaleDateString("nl-NL")}</p>
                </div>
              )}
              {quote.sentAt && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Verstuurd op</p>
                  <p className="text-gray-700">{quote.sentAt.toLocaleDateString("nl-NL")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
