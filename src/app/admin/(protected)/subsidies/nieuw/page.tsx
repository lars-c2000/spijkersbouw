import { prisma } from "@/lib/prisma";
import NieuweSubsidieForm from "./NieuweSubsidieForm";

export default async function NieuweSubsidiePage({
  searchParams,
}: {
  searchParams: Promise<{ quoteId?: string; klantId?: string }>;
}) {
  const sp = await searchParams;

  const [klanten, quotes] = await Promise.all([
    prisma.customer.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.quote.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, number: true, title: true, customerId: true },
    }),
  ]);

  const quotesByKlant: Record<string, { id: string; number: string; title: string }[]> = {};
  for (const q of quotes) {
    if (!quotesByKlant[q.customerId]) quotesByKlant[q.customerId] = [];
    quotesByKlant[q.customerId].push({ id: q.id, number: q.number, title: q.title });
  }

  // Bepaal default klant bij quoteId
  let defaultKlantId = sp.klantId;
  if (sp.quoteId && !defaultKlantId) {
    const quote = quotes.find((q) => q.id === sp.quoteId);
    if (quote) defaultKlantId = quote.customerId;
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <a href="/admin/subsidies" className="text-gray-400 hover:text-gray-600 text-sm">← Subsidies</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Nieuwe subsidieaanvraag</h1>
        <p className="text-gray-500 mt-1">ISDE — Investeringssubsidie Duurzame Energie en Energiebesparing</p>
      </div>

      <NieuweSubsidieForm
        klanten={klanten}
        quotesByKlant={quotesByKlant}
        defaultQuoteId={sp.quoteId}
        defaultKlantId={defaultKlantId}
      />
    </div>
  );
}
