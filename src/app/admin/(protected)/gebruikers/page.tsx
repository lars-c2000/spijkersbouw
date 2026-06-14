import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { UserRole } from "@/generated/prisma/client";

const roleConfig: Record<UserRole, { label: string; classes: string }> = {
  ADMIN: { label: "Admin", classes: "bg-orange-100 text-orange-700" },
  MEDEWERKER: { label: "Medewerker", classes: "bg-blue-100 text-blue-700" },
};

export default async function GebruikersPage() {
  const session = await auth();
  const gebruikers = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gebruikers</h1>
          <p className="text-gray-500 mt-1">{gebruikers.length} gebruiker{gebruikers.length !== 1 ? "s" : ""} met toegang tot het beheerpaneel.</p>
        </div>
        <Link
          href="/admin/gebruikers/nieuw"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Gebruiker toevoegen
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Naam</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">E-mail</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Toegevoegd</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {gebruikers.map((user) => {
              const cfg = roleConfig[user.role];
              const isMe = user.id === session?.user?.id;
              return (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        {isMe && <p className="text-xs text-gray-400">Dit ben jij</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cfg.classes}`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {user.createdAt.toLocaleDateString("nl-NL")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/gebruikers/${user.id}`}
                      className="text-orange-500 hover:text-orange-700 font-medium text-xs"
                    >
                      Bewerken →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
