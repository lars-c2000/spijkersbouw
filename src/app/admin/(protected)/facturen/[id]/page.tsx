import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { InvoiceStatus } from "@/generated/prisma/client";
import InvoiceStatusSelect from "./InvoiceStatusSelect";

const statusConfig: Record<InvoiceStatus, { label: string; classes: string }> = {
  CONCEPT: { label: "Concept", classes: "bg-gray-100 text-gray-600" },
  VERZONDEN: { label: "Verzonden", classes: "bg-blue-100 text-blue-700" },
  BETAALD: { label: "Betaald", classes: "bg-green-100 text-green-700" },
  VERLOPEN: { label: "Verlopen", classes: "bg-red-100 text-red-700" },
};

export default async function FactuurDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const factuur = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      quote: { select: { id: true, number: true } },
    },
  });

  if (!factuur) notFound();

  const cfg = statusConfig[factuur.status];
  const isOverdue = factuur.status === "VERZONDEN" && new Date() > factuur.dueDate;

  const lineItems = Array.isArray(factuur.lineItems)
    ? factuur.lineItems as {
        description: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        btwRate: number;
      }[]
    : [];

  // Groepeer BTW per tarief
  const btwGroups = lineItems.reduce<Record<number, number>>((acc, item) => {
    const base = item.quantity * item.unitPrice;
    acc[item.btwRate] = (acc[item.btwRate] ?? 0) + base * (item.btwRate / 100);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link href="/admin/facturen" className="text-gray-400 hover:text-gray-600 text-sm">
            ← Facturen
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-2xl font-bold text-gray-900">{factuur.number}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${cfg.classes}`}>
              {cfg.label}
            </span>
            {isOverdue && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                Verlopen!
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/admin/facturen/${id}/pdf`}
            target="_blank"
            className="border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PDF downloaden
          </a>
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
              <div className="px-6 py-8 text-center text-gray-400 text-sm">Geen regelitems.</div>
            ) : (
              <>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold">Omschrijving</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-500 font-semibold">Aantal</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-500 font-semibold">Stukprijs</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-500 font-semibold">BTW</th>
                      <th className="text-right px-6 py-3 text-xs text-gray-500 font-semibold">Bedrag</th>
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
                    <span>€ {factuur.totalExclBtw.toFixed(2).replace(".", ",")}</span>
                  </div>
                  {Object.entries(btwGroups).map(([rate, amount]) => (
                    <div key={rate} className="flex justify-between text-gray-600">
                      <span>BTW {rate}%</span>
                      <span>€ {amount.toFixed(2).replace(".", ",")}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-200 pt-2 mt-2">
                    <span>Totaal incl. BTW</span>
                    <span>€ {factuur.totalInclBtw.toFixed(2).replace(".", ",")}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Gekoppelde offerte */}
          {factuur.quote && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Gekoppelde offerte</h2>
              <Link href={`/admin/offertes/${factuur.quote.id}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-mono text-sm text-gray-700">{factuur.quote.number}</span>
                <span className="text-orange-500 text-sm">Openen →</span>
              </Link>
            </div>
          )}

          {/* Notities */}
          {factuur.notes && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Notities</h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{factuur.notes}</p>
            </div>
          )}
        </div>

        {/* Zijbalk */}
        <div className="space-y-6">
          {/* Klantinfo */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Klant</h2>
            <div className="space-y-2 text-sm">
              <Link href={`/admin/klanten/${factuur.customer.id}`}
                className="font-medium text-orange-600 hover:underline block">
                {factuur.customer.name}
              </Link>
              {factuur.customer.email && <p className="text-gray-500">{factuur.customer.email}</p>}
              {factuur.customer.phone && <p className="text-gray-500">{factuur.customer.phone}</p>}
              {factuur.customer.address && <p className="text-gray-500">{factuur.customer.address}</p>}
              {factuur.customer.city && (
                <p className="text-gray-500">{factuur.customer.postcode} {factuur.customer.city}</p>
              )}
              {factuur.customer.kvk && <p className="text-gray-500">KvK: {factuur.customer.kvk}</p>}
              {factuur.customer.btwNummer && (
                <p className="text-gray-500">BTW: {factuur.customer.btwNummer}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Status</h2>
            <InvoiceStatusSelect invoiceId={factuur.id} currentStatus={factuur.status} />
          </div>

          {/* Datums */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Datums</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Factuurdatum</p>
                <p className="text-gray-700">{factuur.invoiceDate.toLocaleDateString("nl-NL")}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Vervaldatum</p>
                <p className={isOverdue ? "text-red-600 font-semibold" : "text-gray-700"}>
                  {factuur.dueDate.toLocaleDateString("nl-NL")}
                </p>
              </div>
              {factuur.sentAt && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Verstuurd op</p>
                  <p className="text-gray-700">{factuur.sentAt.toLocaleDateString("nl-NL")}</p>
                </div>
              )}
              {factuur.paidAt && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Betaald op</p>
                  <p className="text-green-700 font-semibold">{factuur.paidAt.toLocaleDateString("nl-NL")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
