import Link from "next/link";
import { getCmsPage, cms } from "@/lib/cms";

const serviceKeys = [
  { key: "nieuwbouw", title: "Nieuwbouw", items: ["Woningbouw", "Bedrijfspanden", "Garages", "Overkappingen"] },
  { key: "renovatie", title: "Verbouw & Renovatie", items: ["Badkamer verbouwing", "Keuken verbouwing", "Woningrenovatie", "Kantoorrenovatie"] },
  { key: "aanbouw", title: "Aanbouw", items: ["Zij aanbouw", "Achterbouw", "Uitbouw woonkamer", "Opbouw verdieping"] },
  { key: "timmerwerk", title: "Timmerwerk", items: ["Kozijnen en ramen", "Deuren", "Traprenovatie", "Gevelbekleding"] },
  { key: "dakkapellen", title: "Dakkapellen", items: ["Prefab dakkapellen", "Hardhout en kunststof", "Zijlicht en/of voorkant", "Regelwerk en afwerking"] },
  { key: "maatwerk", title: "Maatwerk Meubels", items: ["Inbouwkasten", "Keukenmeubels", "Tafels", "Decoratie"] },
];

const defaultDescriptions: Record<string, string> = {
  nieuwbouw: "Complete nieuwbouwprojecten van begin tot eind. Wij bouwen uw droomwoning met oog voor detail en kwaliteit.",
  renovatie: "Uw bestaande pand een nieuwe look geven. Van kleine verbouwingen tot complete renovaties.",
  aanbouw: "Meer ruimte creëren door uitbreiding van uw woning. Wij verzorgen het complete traject.",
  timmerwerk: "Alle vormen van maatwerk timmerwerk voor uw projecten.",
  dakkapellen: "Professionele dakkapellen voor meer ruimte en licht in uw woning.",
  maatwerk: "Op maat gemaakte meubels die perfect passen bij uw wensen en interieur.",
};

export default async function DienstenPage() {
  const c = await getCmsPage("diensten");

  const intro = cms(c, "intro_tekst", "Bekijk ons complete aanbod aan timmerwerkzaamheden en bouwprojecten.");

  return (
    <>
      <section className="bg-black text-white py-16 md:py-24">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Onze Diensten</h1>
          <p className="text-gray-300 text-lg max-w-2xl">{intro}</p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceKeys.map((service) => {
              const description = cms(c, `${service.key}_tekst`, defaultDescriptions[service.key]);
              return (
                <div key={service.key} className="border border-gray-200 p-8 hover:border-black transition-colors">
                  <h2 className="text-2xl font-bold mb-4">{service.title}</h2>
                  <p className="text-gray-600 mb-6">{description}</p>
                  <ul className="space-y-2 mb-6">
                    {service.items.map((item, i) => (
                      <li key={i} className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-black mr-3 flex-shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/offerte" className="text-black font-medium hover:underline">
                    Offerte aanvragen &rarr;
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Advies Nodig?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Twijfelt u welke dienst het beste bij uw project past? Wij helpen u graag met deskundig advies.
          </p>
          <Link href="/contact" className="inline-block bg-[#e65100] text-white px-8 py-4 font-medium hover:bg-[#bf360c] transition-colors">
            Contact Opnemen
          </Link>
        </div>
      </section>
    </>
  );
}
