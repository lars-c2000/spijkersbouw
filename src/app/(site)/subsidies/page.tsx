import Link from "next/link";
import Image from "next/image";

const subsidies = [
  {
    title: "Isolatie Subsidie",
    description:
      "Subsidie voor het isoleren van uw woning. Van vloerisolatie tot gevelisolatie.",
    link: "https://www.rvo.nl/subsidies-financiering/isolatiesubsidie",
  },
  {
    title: "Zonnepanelen Subsidie",
    description:
      "Investeer in zonne-energie met financiële ondersteuning van de overheid.",
    link: "https://www.rvo.nl/subsidies-financiering/zonnepanelen",
  },
  {
    title: "Warmtepomp Subsidie",
    description:
      "Subsidie voor de installatie van een warmtepomp in uw woning.",
    link: "https://www.rvo.nl/subsidies-financiering/warmtepomp",
  },
  {
    title: "MIA / VAMIL",
    description:
      "Milieu-investeringsaftrek en willekeurige afschrijving voor ondernemers.",
    link: "https://www.rvo.nl/subsidies-financiering/mia-vamil",
  },
];

const faqs = [
  {
    question: "Welke subsidies zijn momenteel beschikbaar?",
    answer:
      "De beschikbaarheid van subsidies wijzigt regelmatig. Momenteel zijn er subsidies voor isolatie, zonnepanelen en warmtepompen. Raadpleeg de RVO website voor de meest actuele informatie.",
  },
  {
    question: "Hoe vraag ik een subsidie aan?",
    answer:
      "De meeste subsidies kunt u aanvragen via de website van RVO (Rijksdienst voor Ondernemend Nederland). Zorg dat u alle benodigde documenten paraat heeft voordat u start met de aanvraag.",
  },
  {
    question: "Kan Spijkersbouw helpen bij mijn subsidie aanvraag?",
    answer:
      "Wij kunnen u informeren over de mogelijkheden en de subsidievoorwaarden. De daadwerkelijke aanvraag moet u zelf doen, of wij kunnen u doorverwijzen naar een specialist.",
  },
  {
    question: "Wat is de subsidie voor isolatie?",
    answer:
      "De isolatiesubsidie bedraagt een percentage van de investeringskosten, afhankelijk van het type isolatie. Bezoek de RVO website voor de exacte bedragen en voorwaarden.",
  },
];

export default function SubsidiesPage() {
  return (
    <>
      <section className="relative bg-black text-white py-16 md:py-24">
        <div className="absolute inset-0 z-0">
          <Image
            src="/tilburg-kozijnen-isolatie-subsidie.png"
            alt="Kozijnen isolatie"
            fill
            className="object-cover opacity-40"
          />
        </div>
        <div className="relative z-10 container-custom">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Subsidies</h1>
          <p className="text-gray-300 text-lg max-w-2xl">
            Informatie over beschikbare subsidies voor uw bouw- en
            renovatieprojecten.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Subsidies Voor Uw Project
            </h2>
            <p className="text-gray-600 mb-12">
              De overheid biedt diverse subsidies aan om energiebesparende
              maatregelen te stimuleren. Hieronder vindt u een overzicht van de
              meest relevante subsidies voor woningeigenaren en ondernemers.
              Let op: subsidies kunnen wijzigen, raadpleeg altijd de
              officiële bronnen voor de meest actuele informatie.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {subsidies.map((subsidie, index) => (
              <div
                key={index}
                className="border border-gray-200 p-8 hover:border-black transition-colors"
              >
                <h3 className="text-xl font-bold mb-4">{subsidie.title}</h3>
                <p className="text-gray-600 mb-6">{subsidie.description}</p>
                <a
                  href={subsidie.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black font-medium hover:underline inline-flex items-center"
                >
                  Meer informatie
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">
            Veelgestelde Vragen
          </h2>
          <div className="max-w-3xl mx-auto space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-8">
                <h3 className="text-lg font-bold mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Advies Over Subsidies?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Heeft u vragen over subsidies voor uw project? Neem contact met ons
            op voor vrijblijvend advies.
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
