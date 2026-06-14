import Link from "next/link";
import { prisma } from "@/lib/prisma";

const categories = ["Alle", "Tips", "Nieuws", "Projecten"];

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string }>;
}) {
  const { categorie } = await searchParams;

  const articles = await prisma.blogPost.findMany({
    where: {
      published: true,
      ...(categorie && categorie !== "Alle" ? { category: categorie } : {}),
    },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <>
      <section className="bg-black text-white py-16 md:py-24">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
          <p className="text-gray-300 text-lg max-w-2xl">
            Tips, nieuws en inspiratie voor uw bouwproject.
          </p>
        </div>
      </section>

      <section className="py-8 border-b border-gray-200">
        <div className="container-custom">
          <div className="flex flex-wrap gap-4">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={cat === "Alle" ? "/blog" : `/blog?categorie=${cat}`}
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
          {articles.length === 0 ? (
            <p className="text-gray-500 text-center py-16">Nog geen artikelen gepubliceerd.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {articles.map((article) => (
                <article
                  key={article.id}
                  className="border border-gray-200 hover:border-black transition-colors"
                >
                  <div className="aspect-video bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Artikel foto</span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-sm text-gray-500">{article.category}</span>
                      <span className="text-sm text-gray-400">
                        {(article.publishedAt ?? article.createdAt).toLocaleDateString("nl-NL", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold mb-3">{article.title}</h2>
                    {article.excerpt && (
                      <p className="text-gray-600 mb-4">{article.excerpt}</p>
                    )}
                    <Link
                      href={`/blog/${article.slug}`}
                      className="text-black font-medium hover:underline"
                    >
                      Lees meer &rarr;
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Vragen Over Uw Project?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Heeft u een vraag over uw bouwproject? Neem contact met ons op voor
            deskundig advies.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-[#e65100] text-white px-8 py-4 font-medium hover:bg-[#bf360c] transition-colors"
          >
            Contact Opnemen
          </Link>
        </div>
      </section>
    </>
  );
}
