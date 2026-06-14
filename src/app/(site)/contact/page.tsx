import Link from "next/link";
import { getCmsPage, cms } from "@/lib/cms";

export default async function ContactPage() {
  const c = await getCmsPage("contact");

  const adres = cms(c, "adres", "Tilburg, Nederland");
  const telefoon = cms(c, "telefoon", "");
  const email = cms(c, "email", "info@spijkersbouw.nl");
  const kvk = cms(c, "kvk", "");
  const btw = cms(c, "btw", "");
  const openingstijden = cms(c, "openingstijden", "Ma–Vr: 08:00–17:00\nZa: Op afspraak\nZo: Gesloten");

  return (
    <>
      <section className="bg-black text-white py-16 md:py-24">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact</h1>
          <p className="text-gray-300 text-lg max-w-2xl">
            Neem contact met ons op. Wij helpen u graag verder.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-6">Contactformulier</h2>
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">Naam *</label>
                  <input type="text" id="name" name="name" required className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">E-mail *</label>
                  <input type="email" id="email" name="email" required className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">Telefoon</label>
                  <input type="tel" id="phone" name="phone" className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">Bericht *</label>
                  <textarea id="message" name="message" rows={5} required className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none resize-none"></textarea>
                </div>
                <button type="submit" className="w-full bg-[#e65100] text-white py-4 font-medium hover:bg-[#bf360c] transition-colors">
                  Verzenden
                </button>
              </form>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Contactgegevens</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-2">Adres</h3>
                  <p className="text-gray-600 whitespace-pre-line">{adres}</p>
                </div>
                {telefoon && (
                  <div>
                    <h3 className="font-bold mb-2">Telefoon</h3>
                    <p className="text-gray-600">
                      <a href={`tel:${telefoon.replace(/\s/g, "")}`} className="hover:text-black">{telefoon}</a>
                    </p>
                  </div>
                )}
                <div>
                  <h3 className="font-bold mb-2">E-mail</h3>
                  <p className="text-gray-600">
                    <a href={`mailto:${email}`} className="hover:text-black">{email}</a>
                  </p>
                </div>
                {kvk && (
                  <div>
                    <h3 className="font-bold mb-2">KvK Nummer</h3>
                    <p className="text-gray-600">{kvk}</p>
                  </div>
                )}
                {btw && (
                  <div>
                    <h3 className="font-bold mb-2">BTW Nummer</h3>
                    <p className="text-gray-600">{btw}</p>
                  </div>
                )}
              </div>

              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Openingstijden</h2>
                <p className="text-gray-600 whitespace-pre-line">{openingstijden}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Snelle Offerte?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Wilt u snel een offerte aanvragen? Gebruik dan ons speciale offerteformulier voor een snelle reactie.
          </p>
          <Link href="/offerte" className="inline-block bg-[#e65100] text-white px-8 py-4 font-medium hover:bg-[#bf360c] transition-colors">
            Offerte Aanvragen
          </Link>
        </div>
      </section>
    </>
  );
}
