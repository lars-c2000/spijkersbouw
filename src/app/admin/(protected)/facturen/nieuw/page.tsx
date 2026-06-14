import { prisma } from "@/lib/prisma";
import NieuweFactuurForm from "./NieuweFactuurForm";

export default async function NieuweFactuurPage({
  searchParams,
}: {
  searchParams: Promise<{ quoteId?: string }>;
}) {
  const { quoteId } = await searchParams;

  // Als quoteId meegegeven: prefill vanuit offerte
  let prefill = null;
  if (quoteId) {
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { customer: true },
    });
    if (quote) prefill = quote;
  }

  // Alle klanten voor dropdown
  const klanten = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });

  return <NieuweFactuurForm prefill={prefill} klanten={klanten} />;
}
