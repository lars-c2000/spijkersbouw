import Link from "next/link";
import { getCmsPage, cms } from "@/lib/cms";

export default async function OverOnsPage() {
  const c = await getCmsPage("over-ons");

  const introTitle = cms(c, "intro_title", "Wie zijn wij?");
  const introTekst = cms(c, "intro_tekst", "Spijkersbouw is opgericht met als doel: kwalitatief hoogwaardig timmerwerk leveren aan particulieren en bedrijven in Tilburg en omgeving.");
  const geschiedenisTekst = cms(c, "geschiedenis_tekst", "Met jaren ervaring in de bouw- en timmerbranche weten wij als geen ander hoe belangrijk het is om te werken met vakmanschap, goede materialen en een klantgerichte aanpak.");

  const waarden = [
    { titel: cms(c, "waarde_1_titel", "Kwaliteit"), tekst: cms(c, "waarde_1_tekst", "Wij streven naar de hoogste kwaliteit in elk project. Alleen de beste materialen en vakmanschap.") },
    { titel: cms(c, "waarde_2_titel", "Betrouwbaarheid"), tekst: cms(c, "waarde_2_tekst", "Afspraken worden nageleefd. Wij leveren op tijd en binnen budget.") },
    { titel: cms(c, "waarde_3_titel", "Klantgericht"), tekst: cms(c, "waarde_3_tekst", "Uw wensen staan centraal. Wij luisteren en adviseren om het beste resultaat te behalen.") },
  ];

  const eigenaarNaam = cms(c, "eigenaar_naam", "Lars");
  const eigenaarFunctie = cms(c, "eigenaar_functie", "Eigenaar & Timmerman");
  const eigenaarBio = cms(c, "eigenaar_bio", "");
  const teamIntro = cms(c, "team_intro", "");

  return (
    <>
      <section className="bg-black text-white py-16 md:py-24">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Over Ons</h1>
          <p className="text-gray-300 text-lg max-w-2xl">Ontdek wie wij zijn en wat ons drijft.</p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">{introTitle}</h2>
              <p className="text-gray-600 mb-4">{introTekst}</p>
              {geschiedenisTekst && <p className="text-gray-600">{geschiedenisTekst}</p>}
            </div>
            <div className="bg-gray-200 aspect-square flex items-center justify-center">
              <span className="text-gray-500">Foto workshop/team</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">Onze Waarden</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {waarden.map((waarde, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-black text-white mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4">{waarde.titel}</h3>
                <p className="text-gray-600">{waarde.tekst}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">Het Team</h2>
          {teamIntro && <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">{teamIntro}</p>}
          {!teamIntro && <div className="mb-12" />}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-gray-200 aspect-square mb-4 mx-auto max-w-xs flex items-center justify-center">
                <span className="text-gray-500">Foto</span>
              </div>
              <h3 className="text-lg font-bold">{eigenaarNaam}</h3>
              <p className="text-gray-600">{eigenaarFunctie}</p>
              {eigenaarBio && <p className="text-gray-500 text-sm mt-2">{eigenaarBio}</p>}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Werkgebied</h2>
              <p className="text-gray-600 mb-4">Wij zijn actief in Tilburg en de omliggende regio, waaronder:</p>
              <ul className="space-y-2 text-gray-600">
                <li>• Tilburg</li>
                <li>• Goirle</li>
                <li>• Oisterwijk</li>
                <li>• Berkel Enschot</li>
                <li>• Hilvarenbeek</li>
              </ul>
              <p className="text-gray-600 mt-4">Neem contact met ons op voor andere regio&apos;s.</p>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Certificeringen</h2>
              <p className="text-gray-600">Wij werken volgens de hoogste standaarden en beschikken over diverse certificeringen. Vraag naar onze actuele kwalificaties.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Samenwerken?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Heeft u een project in gedachte? Wij helpen u graag verder met deskundig advies en vakmanschap.
          </p>
          <Link href="/offerte" className="inline-block bg-[#e65100] text-white px-8 py-4 font-medium hover:bg-[#bf360c] transition-colors">
            Offerte Aanvragen
          </Link>
        </div>
      </section>
    </>
  );
}
