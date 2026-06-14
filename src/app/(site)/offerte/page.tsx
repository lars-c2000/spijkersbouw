"use client";

import { useState } from "react";

const projectTypes = [
  "Nieuwbouw",
  "Renovatie",
  "Aanbouw",
  "Dakkapel",
  "Timmerwerk",
  "Reparatie/onderhoud",
  "anders",
];

export default function OffertePage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await fetch("/api/offertes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        address: fd.get("address"),
        projectType: fd.get("projectType"),
        description: fd.get("description"),
      }),
    });
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <>
        <section className="bg-black text-white py-16 md:py-24">
          <div className="container-custom">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Bedankt!
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl">
              Uw offerteaanvraag is succesvol verzonden.
            </p>
          </div>
        </section>
        <section className="py-16 md:py-24">
          <div className="container-custom text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-black text-white mx-auto mb-6 flex items-center justify-center">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4">
                Offerteaanvraag Ontvangen
              </h2>
              <p className="text-gray-600 mb-8">
                Wij hebben uw offerteaanvraag ontvangen en nemen binnen 2
                werkdagen contact met u op. Heeft u nog vragen? Neem dan
                contact met ons op via{" "}
                <a href="tel:+31201234567" className="text-black underline">
                  +31 20 123 4567
                </a>{" "}
                of{" "}
                <a
                  href="mailto:info@spijkersbouw.nl"
                  className="text-black underline"
                >
                  info@spijkersbouw.nl
                </a>
              </p>
              <a
                href="/"
                className="inline-block bg-[#e65100] text-white px-8 py-4 font-medium hover:bg-[#bf360c] transition-colors"
              >
                Terug naar Home
              </a>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="bg-black text-white py-16 md:py-24">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Offerte Aanvragen
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl">
            Vul het formulier in en wij nemen binnen 2 werkdagen contact met u
            op.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                  >
                    Naam *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                  >
                    E-mail *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium mb-2"
                  >
                    Telefoon *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium mb-2"
                  >
                    Adres (optioneel)
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="projectType"
                  className="block text-sm font-medium mb-2"
                >
                  Type project *
                </label>
                <select
                  id="projectType"
                  name="projectType"
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none bg-white"
                >
                  <option value="">Selecteer een type project</option>
                  {projectTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-2"
                >
                  Beschrijving van uw project *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  required
                  placeholder="Vertel ons zo veel mogelijk over uw project..."
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Bijlagen (tekeningen, foto&apos;s)
                </label>
                <div className="border-2 border-dashed border-gray-300 p-6 text-center">
                  <input
                    type="file"
                    id="attachments"
                    name="attachments"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                  />
                  <label
                    htmlFor="attachments"
                    className="cursor-pointer text-gray-600 hover:text-black"
                  >
                    <svg
                      className="w-8 h-8 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span>Sleep bestanden hier of klik om te uploaden</span>
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    JPG, PNG of PDF (max. 10MB)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="privacy"
                  name="privacy"
                  required
                  className="mt-1"
                />
                <label htmlFor="privacy" className="text-sm text-gray-600">
                  Ik ga akkoord met de{" "}
                  <a href="/contact" className="text-black underline">
                    privacyverklaring
                  </a>
                  . Mijn gegevens worden alleen gebruikt voor het beantwoorden
                  van deze aanvraag. *
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#e65100] text-white py-4 font-medium hover:bg-[#bf360c] disabled:opacity-60 transition-colors"
              >
                {loading ? "Bezig met verzenden..." : "Verzenden"}
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container-custom text-center">
          <p className="text-gray-600">
            Liever bellen?{" "}
            <a href="tel:+31201234567" className="text-black font-medium">
              +31 20 123 4567
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
