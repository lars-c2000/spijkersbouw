import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function KlantenPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { q, type } = await searchParams;

  const klanten = await prisma.customer.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
                { city: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        type ? { type: type as "PARTICULIER" | "ZAKELIJK" } : {},
      ],
    },
    include: {
      _count: { select: { quotes: true, invoices: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Klanten</h1>
          <p className="text-gray-500 mt-1">{klanten.length} klant{klanten.length !== 1 ? "en" : ""}</p>
        </div>
        <Link
          href="/admin/klanten/nieuw"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nieuwe klant
        </Link>
      </div>

      {/* Zoeken + filter */}
      <form className="flex gap-3 mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Zoek op naam, e-mail of plaats..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <select
          name="type"
          defaultValue={type}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">Alle types</option>
          <option value="PARTICULIER">Particulier</option>
          <option value="ZAKELIJK">Zakelijk</option>
        </select>
        <button
          type="submit"
          className="bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Zoeken
        </button>
      </form>

      {/* Klantenlijst */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {klanten.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-sm">Geen klanten gevonden.</p>
            <Link href="/admin/klanten/nieuw" className="text-orange-500 hover:underline text-sm mt-2 inline-block">
              Voeg de eerste klant toe →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Naam</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Contactgegevens</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Offertes</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Facturen</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Sinds</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {klanten.map((k) => (
                <tr key={k.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{k.name}</p>
                    {k.city && <p className="text-xs text-gray-400">{k.postcode} {k.city}</p>}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {k.email && <p>{k.email}</p>}
                    {k.phone && <p>{k.phone}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      k.type === "ZAKELIJK"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {k.type === "ZAKELIJK" ? "Zakelijk" : "Particulier"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{k._count.quotes}</td>
                  <td className="px-6 py-4 text-gray-600">{k._count.invoices}</td>
                  <td className="px-6 py-4 text-gray-500">{k.createdAt.toLocaleDateString("nl-NL")}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/klanten/${k.id}`} className="text-orange-500 hover:text-orange-700 font-medium text-xs">
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
