import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { InvoiceStatus } from "@/generated/prisma/client";

const statusConfig: Record<InvoiceStatus, { label: string; classes: string }> = {
  CONCEPT: { label: "Concept", classes: "bg-gray-100 text-gray-600" },
  VERZONDEN: { label: "Verzonden", classes: "bg-blue-100 text-blue-700" },
  BETAALD: { label: "Betaald", classes: "bg-green-100 text-green-700" },
  VERLOPEN: { label: "Verlopen", classes: "bg-red-100 text-red-700" },
};

async function getFacturen(status?: string) {
  return prisma.invoice.findMany({
    where: status ? { status: status as InvoiceStatus } : undefined,
    include: { customer: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export default async function FacturenPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const facturen = await getFacturen(status);

  const counts = await prisma.invoice.groupBy({
    by: ["status"],
    _count: true,
  });
  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]));

  // Totaal openstaand (VERZONDEN + VERLOPEN)
  const openstaand = await prisma.invoice.aggregate({
    where: { status: { in: ["VERZONDEN", "VERLOPEN"] } },
    _sum: { totalInclBtw: true },
  });

  const filters: { label: string; status?: InvoiceStatus }[] = [
    { label: "Alle" },
    { label: "Concept", status: "CONCEPT" },
    { label: "Verzonden", status: "VERZONDEN" },
    { label: "Betaald", status: "BETAALD" },
    { label: "Verlopen", status: "VERLOPEN" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturen</h1>
          <p className="text-gray-500 mt-1">
            {facturen.length} factuur{facturen.length !== 1 ? "en" : ""}
            {openstaand._sum.totalInclBtw && openstaand._sum.totalInclBtw > 0 && (
              <span className="ml-2 text-red-600 font-medium">
                — € {openstaand._sum.totalInclBtw.toFixed(2).replace(".", ",")} openstaand
              </span>
            )}
          </p>
        </div>
        <Link
          href="/admin/facturen/nieuw"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nieuwe factuur
        </Link>
      </div>

      {/* Statusfilters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map((f) => {
          const active = status === f.status || (!status && !f.status);
          const href = f.status ? `/admin/facturen?status=${f.status}` : "/admin/facturen";
          const count = f.status ? (countMap[f.status] ?? 0) : facturen.length;
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
        {facturen.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-sm">Geen facturen gevonden.</p>
            <Link href="/admin/facturen/nieuw" className="text-orange-500 hover:underline text-sm mt-2 inline-block">
              Maak de eerste factuur aan →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nummer</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Klant</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Bedrag</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Factuurdatum</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vervaldatum</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {facturen.map((f) => {
                const cfg = statusConfig[f.status];
                const isOverdue = f.status === "VERZONDEN" && new Date() > f.dueDate;
                return (
                  <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{f.number}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{f.customer.name}</p>
                      {f.customer.email && <p className="text-xs text-gray-400">{f.customer.email}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cfg.classes}`}>
                        {cfg.label}
                      </span>
                      {isOverdue && (
                        <span className="ml-2 text-xs text-red-600 font-medium">Verlopen!</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      € {f.totalInclBtw.toFixed(2).replace(".", ",")}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {f.invoiceDate.toLocaleDateString("nl-NL")}
                    </td>
                    <td className={`px-6 py-4 ${isOverdue ? "text-red-600 font-medium" : "text-gray-500"}`}>
                      {f.dueDate.toLocaleDateString("nl-NL")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/facturen/${f.id}`} className="text-orange-500 hover:text-orange-700 font-medium text-xs">
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
