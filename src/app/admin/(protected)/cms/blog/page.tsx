import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PublishToggle from "./PublishToggle";

export default async function BlogAdminPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/cms" className="text-gray-400 hover:text-gray-600 text-sm">← CMS</Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Blog artikelen</h1>
          <p className="text-gray-500 mt-1">{posts.length} artikel{posts.length !== 1 ? "en" : ""}</p>
        </div>
        <Link
          href="/admin/cms/blog/nieuw"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nieuw artikel
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-sm">Nog geen artikelen.</p>
            <Link href="/admin/cms/blog/nieuw" className="text-orange-500 hover:underline text-sm mt-2 inline-block">
              Schrijf het eerste artikel →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Titel</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Categorie</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Datum</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Gepubliceerd</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{post.title}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">/blog/{post.slug}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {post.publishedAt
                      ? post.publishedAt.toLocaleDateString("nl-NL")
                      : post.createdAt.toLocaleDateString("nl-NL")}
                  </td>
                  <td className="px-6 py-4">
                    <PublishToggle id={post.id} published={post.published} entity="blog" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/cms/blog/${post.id}`} className="text-orange-500 hover:text-orange-700 font-medium text-xs">
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
