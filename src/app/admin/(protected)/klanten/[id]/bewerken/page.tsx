import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import KlantBewerkForm from "./KlantBewerkForm";

export default async function KlantBewerkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const klant = await prisma.customer.findUnique({ where: { id } });
  if (!klant) notFound();

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <a href={`/admin/klanten/${klant.id}`} className="text-gray-400 hover:text-gray-600 text-sm">
          ← {klant.name}
        </a>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Klant bewerken</h1>
      </div>

      <KlantBewerkForm klant={klant} />
    </div>
  );
}
