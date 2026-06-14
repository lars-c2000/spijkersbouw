import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProfielForm from "./ProfielForm";

export default async function ProfielPage() {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, role: true, createdAt: true },
  });

  if (!user) notFound();

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-sm text-gray-400">
              {user.role === "ADMIN" ? "Beheerder" : "Medewerker"} · lid sinds {user.createdAt.toLocaleDateString("nl-NL", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      <ProfielForm name={user.name} email={user.email} />
    </div>
  );
}
