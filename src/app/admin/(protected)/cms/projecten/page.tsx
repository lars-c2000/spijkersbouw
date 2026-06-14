import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PublishToggle from "../blog/PublishToggle";

export default async function ProjectenAdminPage() {
  const projecten = await prisma.project.findMany({ orderBy: { year: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="mb-1">
            <Link href="/admin/cms" className="text-gray-400 hover:text-gray-600 text-sm">← CMS</Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Projecten</h1>
          <p className="text-gray-500 mt-1">{projecten.length} project{projecten.length !== 1 ? "en" : ""}</p>
        </div>
        <Link
          href="/admin/cms/projecten/nieuw"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nieuw project
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {projecten.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-sm">Nog geen projecten.</p>
            <Link href="/admin/cms/projecten/nieuw" className="text-orange-500 hover:underline text-sm mt-2 inline-block">
              Voeg het eerste project toe →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Titel</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Categorie</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Jaar</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Gepubliceerd</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projecten.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{p.title}</p>
                    {p.description && <p className="text-xs text-gray-400 truncate max-w-xs">{p.description}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{p.category}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{p.year}</td>
                  <td className="px-6 py-4">
                    <PublishToggle id={p.id} published={p.published} entity="projecten" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/cms/projecten/${p.id}`} className="text-orange-500 hover:text-orange-700 font-medium text-xs">
                      Bewerken →
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
