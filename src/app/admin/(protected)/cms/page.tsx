import { CMS_PAGES } from "@/lib/cmsFields";
import Link from "next/link";

const moduleLinks = [
  {
    label: "Blog artikelen",
    description: "Schrijf en publiceer blog posts",
    href: "/admin/cms/blog",
    icon: "✍️",
  },
  {
    label: "Projecten",
    description: "Portfolio projecten beheren",
    href: "/admin/cms/projecten",
    icon: "🏗️",
  },
];

export default function CmsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">CMS</h1>
        <p className="text-gray-500 mt-1">Beheer de inhoud van je website.</p>
      </div>

      {/* Paginainhoud */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Pagina-inhoud</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {Object.entries(CMS_PAGES).map(([slug, config]) => (
          <Link
            key={slug}
            href={`/admin/cms/${slug}`}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-orange-300 hover:shadow-sm transition-all group"
          >
            <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
              {config.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{config.description}</p>
            <p className="text-xs text-gray-400 mt-3">{config.fields.length} velden</p>
          </Link>
        ))}
      </div>

      {/* Blog + Projecten */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Content modules</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {moduleLinks.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-orange-300 hover:shadow-sm transition-all group flex items-start gap-4"
          >
            <span className="text-2xl">{m.icon}</span>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                {m.label}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{m.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
