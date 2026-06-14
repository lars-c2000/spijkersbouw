import Link from "next/link";
import { prisma } from "@/lib/prisma";

const categories = ["Alle", "Nieuwbouw", "Renovatie", "Aanbouw", "Timmerwerk", "Dakkapel", "Maatwerk meubels"];

export default async function ProjectenPage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string }>;
}) {
  const { categorie } = await searchParams;

  const projecten = await prisma.project.findMany({
    where: {
      published: true,
      ...(categorie && categorie !== "Alle" ? { category: categorie } : {}),
    },
    orderBy: [{ year: "desc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <section className="bg-black text-white py-16 md:py-24">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Projecten</h1>
          <p className="text-gray-300 text-lg max-w-2xl">
            Bekijk onze afgeronde projecten.
          </p>
        </div>
      </section>

      <section className="py-8 border-b border-gray-200">
        <div className="container-custom">
          <div className="flex flex-wrap gap-4">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={cat === "Alle" ? "/projecten" : `/projecten?categorie=${cat}`}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  (cat === "Alle" && !categorie) || cat === categorie
                    ? "bg-black text-white"
                    : "border border-gray-300 hover:border-black"
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-custom">
          {projecten.length === 0 ? (
            <p className="text-gray-500 text-center py-16">
              {categorie ? `Geen ${categorie} projecten gevonden.` : "Nog geen projecten gepubliceerd."}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projecten.map((project) => (
                <div
                  key={project.id}
                  className="group border border-gray-200 hover:border-black transition-colors"
                >
                  <div className="aspect-video bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                    <span className="text-gray-500">Project foto</span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-sm text-gray-500">{project.category}</span>
                      <span className="text-sm text-gray-400">{project.year}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{project.title}</h3>
                    {project.description && (
                      <p className="text-gray-600 text-sm">{project.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Nieuw Project?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Heeft u een project in gedachte? Wij helpen u graag met het realiseren van uw wensen.
          </p>
          <Link
            href="/offerte"
            className="inline-block bg-[#e65100] text-white px-8 py-4 font-medium hover:bg-[#bf360c] transition-colors"
          >
            Offerte Aanvragen
          </Link>
        </div>
      </section>
    </>
  );
}
