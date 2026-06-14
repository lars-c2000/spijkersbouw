"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/diensten", label: "Diensten" },
  { href: "/subsidies", label: "Subsidies" },
  { href: "/over-ons", label: "Over Ons" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <Image
              src="/spijkersbouw-nl.png?v=2"
              alt="Spijkersbouw"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-black"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/offerte"
              className="bg-[#e65100] text-white px-4 py-2 text-sm font-medium hover:bg-[#bf360c] transition-colors"
            >
              Offerte
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block py-2 text-sm font-medium ${
                  pathname === link.href
                    ? "text-black"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/offerte"
              onClick={() => setIsOpen(false)}
              className="block mt-4 bg-black text-white px-4 py-2 text-sm font-medium text-center hover:bg-gray-800 transition-colors"
            >
              Offerte Aanvragen
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
