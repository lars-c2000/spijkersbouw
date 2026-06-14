import Link from "next/link";
import Image from "next/image";
import { getCmsPage, cms } from "@/lib/cms";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const [c, recenteProjecten] = await Promise.all([
    getCmsPage("home"),
    prisma.project.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, title: true, category: true },
    }),
  ]);

  const heroTitle = cms(c, "hero_title", "Vakmanschap in Hout");
  const heroSubtitle = cms(c, "hero_subtitle", "Spijkersbouw is uw betrouwbare timmerpartner voor al uw bouwprojecten. Van nieuwbouw tot renovatie, wij leveren kwaliteit.");
  const heroCta = cms(c, "hero_cta_primary", "Offerte Aanvragen");

  const usps = [
    { title: cms(c, "usp_1_title", "Ervaring"), text: cms(c, "usp_1_text", "Jarenlange ervaring in alle timmerwerkzaamheden") },
    { title: cms(c, "usp_2_title", "Kwaliteit"), text: cms(c, "usp_2_text", "Wij werken alleen met de beste materialen") },
    { title: cms(c, "usp_3_title", "Betrouwbaar"), text: cms(c, "usp_3_text", "Op tijd leveren en afspraken nakomen") },
  ];

  const projectenToShow = recenteProjecten.length > 0
    ? recenteProjecten
    : [
        { id: "1", title: "Renovatie woning Tilburg", category: "Renovatie" },
        { id: "2", title: "Aanbouw keuken", category: "Aanbouw" },
        { id: "3", title: "Dakkapel constructie", category: "Timmerwerk" },
      ];

  return (
    <>
      <section className="relative bg-black text-white py-24 md:py-32">
        <div className="absolute inset-0 z-0">
          <Image src="/timmerman-tilburg.jpg" alt="Timmerman aan het werk" fill className="object-cover opacity-40 scale-x-[-1]" priority />
        </div>
        <div className="relative z-10 container-custom">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{heroTitle}</h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">{heroSubtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/offerte" className="bg-[#e65100] text-white px-6 py-3 font-medium hover:bg-[#bf360c] transition-colors text-center">
                {heroCta}
              </Link>
              <Link href="/diensten" className="border border-white text-white px-6 py-3 font-medium hover:bg-white hover:text-black transition-colors text-center">
                Onze Diensten
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Onze Diensten</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Nieuwbouw", description: "Complete nieuwbouwprojecten van begin tot eind" },
              { title: "Renovatie", description: "Verbouwing en renovatie van uw woning of pand" },
              { title: "Aanbouw", description: "Uitbreiding van uw woning met kwaliteitswerk" },
            ].map((service, index) => (
              <div key={index} className="bg-white p-8 border border-gray-200 hover:border-black transition-colors">
                <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <Link href="/diensten" className="text-black font-medium hover:underline">
                  Meer informatie &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Waarom Kiezen Voor Ons?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {usps.map((usp, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-black text-white mx-auto mb-6 flex items-center justify-center">
                  <span className="text-2xl font-bold">{index + 1}</span>
                </div>
                <h3 className="text-xl font-bold mb-4">{usp.title}</h3>
                <p className="text-gray-600">{usp.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Recente Projecten</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {projectenToShow.map((project) => (
              <div key={project.id} className="bg-black text-white p-8 aspect-square flex flex-col justify-end">
                <p className="text-gray-400 text-sm mb-2">{project.category}</p>
                <h3 className="text-xl font-bold">{project.title}</h3>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/projecten" className="inline-block border-2 border-black px-6 py-3 font-medium hover:bg-black hover:text-white transition-colors">
              Alle Projecten
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-black text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Klaar Voor Uw Project?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Neem contact met ons op voor een vrijblijvend gesprek over uw wensen. Wij helpen u graag verder.
          </p>
          <Link href="/offerte" className="inline-block bg-[#e65100] text-white px-8 py-4 font-medium hover:bg-[#bf360c] transition-colors">
            Offerte Aanvragen
          </Link>
        </div>
      </section>
    </>
  );
}
