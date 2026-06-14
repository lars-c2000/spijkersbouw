import Link from "next/link";

const footerLinks = {
  diensten: [
    { href: "/diensten", label: "Nieuwbouw" },
    { href: "/diensten", label: "Renovatie" },
    { href: "/diensten", label: "Aanbouw" },
    { href: "/diensten", label: "Timmerwerk" },
  ],
  bedrijf: [
    { href: "/over-ons", label: "Over Ons" },
    { href: "/projecten", label: "Projecten" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4">Spijkersbouw</h3>
            <p className="text-gray-400 text-sm mb-4">
              Uw betrouwbare timmerpartner voor al uw bouwprojecten. Van
              nieuwbouw tot renovatie, wij staan voor kwaliteit en vakmanschap.
            </p>
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <p>Regio: Tilburg en omgeving</p>
              <p>KvK: [KVK nummer]</p>
              <p>BTW: [BTW nummer]</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Diensten</h4>
            <ul className="space-y-2">
              {footerLinks.diensten.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Bedrijf</h4>
            <ul className="space-y-2">
              {footerLinks.bedrijf.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Spijkersbouw. Alle rechten
            voorbehouden.
          </p>
          <div className="flex gap-4">
            <Link
              href="/contact"
              className="text-gray-500 hover:text-white text-sm transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/contact"
              className="text-gray-500 hover:text-white text-sm transition-colors"
            >
              Algemene voorwaarden
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
