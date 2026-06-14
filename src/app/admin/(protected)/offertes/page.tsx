import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { QuoteStatus } from "@/generated/prisma/client";

const statusConfig: Record<QuoteStatus, { label: string; classes: string }> = {
  NIEUW: { label: "Nieuw", classes: "bg-blue-100 text-blue-700" },
  IN_BEHANDELING: { label: "In behandeling", classes: "bg-yellow-100 text-yellow-700" },
  VERSTUURD: { label: "Verstuurd", classes: "bg-purple-100 text-purple-700" },
  GEWONNEN: { label: "Gewonnen", classes: "bg-green-100 text-green-700" },
  VERLOREN: { label: "Verloren", classes: "bg-red-100 text-red-700" },
};

async function getOffertes(status?: string) {
  return prisma.quote.findMany({
    where: status ? { status: status as QuoteStatus } : undefined,
    include: { customer: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export default async function OffertesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const offertes = await getOffertes(status);

  const counts = await prisma.quote.groupBy({
    by: ["status"],
    _count: true,
  });
  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]));

  const filters: { label: string; value?: string; status?: QuoteStatus }[] = [
    { label: "Alle", value: undefined },
    { label: "Nieuw", status: "NIEUW" },
    { label: "In behandeling", status: "IN_BEHANDELING" },
    { label: "Verstuurd", status: "VERSTUURD" },
    { label: "Gewonnen", status: "GEWONNEN" },
    { label: "Verloren", status: "VERLOREN" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offertes</h1>
          <p className="text-gray-500 mt-1">{offertes.length} offerte{offertes.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/admin/offertes/nieuw"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nieuwe offerte
        </Link>
      </div>

      {/* Statusfilters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map((f) => {
          const active = status === f.status || (!status && !f.status);
          const href = f.status ? `/admin/offertes?status=${f.status}` : "/admin/offertes";
          const count = f.status ? (countMap[f.status] ?? 0) : offertes.length;
          return (
            <Link
              key={f.label}
              href={href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {f.label}
              <span className={`ml-1.5 text-xs ${active ? "text-gray-300" : "text-gray-400"}`}>
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {offertes.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-sm">Geen offertes gevonden.</p>
            <Link href="/admin/offertes/nieuw" className="text-orange-500 hover:underline text-sm mt-2 inline-block">
              Maak de eerste offerte aan →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nummer</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Klant</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Omschrijving</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Bedrag</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Datum</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {offertes.map((q) => {
                const cfg = statusConfig[q.status];
                return (
                  <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{q.number}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{q.customer.name}</p>
                      {q.customer.email && (
                        <p className="text-xs text-gray-400">{q.customer.email}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-700 max-w-xs truncate">{q.title}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cfg.classes}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {q.totalInclBtw > 0
                        ? `€ ${q.totalInclBtw.toFixed(2).replace(".", ",")}`
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {q.createdAt.toLocaleDateString("nl-NL")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/offertes/${q.id}`}
                        className="text-orange-500 hover:text-orange-700 font-medium text-xs"
                      >
                        Openen →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
