import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import GebruikerEditForm from "./GebruikerEditForm";

export default async function GebruikerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  if (!user) notFound();

  const isMe = user.id === session?.user?.id;

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <a href="/admin/gebruikers" className="text-gray-400 hover:text-gray-600 text-sm">← Gebruikers</a>
        <div className="flex items-center gap-3 mt-2">
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            {isMe && <p className="text-sm text-gray-400">Dit ben jij</p>}
          </div>
        </div>
      </div>

      <GebruikerEditForm user={user} isMe={isMe} />
    </div>
  );
}
