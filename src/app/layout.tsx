import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zulu and Taru's Adventures",
  description:
    "One human. One 1976 VW Westfalia. The American Southwest awaits. Follow Zulu and Taru across California, Nevada, Utah, New Mexico, and Colorado.",
  openGraph: {
    title: "Zulu and Taru's Adventures",
    description: "One human. One 1976 VW Westfalia. The American Southwest awaits.",
    siteName: "Zulu and Taru's Adventures",
  },
};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/journal", label: "Journal" },
  { href: "/videos", label: "Videos" },
  { href: "/photos", label: "Photos" },
  { href: "/route", label: "The Route" },
  { href: "/tarus-story", label: "Taru's Story" },
  { href: "/contact", label: "Contact" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col bg-taru-sand font-sans">
        <header className="bg-taru-green text-taru-cream shadow-md">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col items-center py-4 gap-1">
              <Link href="/" className="text-center group">
                <span className="font-heading text-2xl md:text-3xl font-bold text-taru-cream tracking-wide group-hover:text-white transition-colors">
                  Zulu and Taru&apos;s Adventures
                </span>
                <p className="text-xs md:text-sm text-taru-cream/70 mt-0.5 italic">
                  One human. One 1976 VW Westfalia. The American Southwest awaits.
                </p>
              </Link>
            </div>
            <nav className="flex flex-wrap justify-center gap-1 pb-3">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-3 py-1.5 text-sm font-medium text-taru-cream/80 hover:text-white hover:bg-taru-green-dark rounded transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="bg-taru-green text-taru-cream/70 text-center text-sm py-6 mt-12">
          <p className="font-heading italic text-taru-cream/90 mb-1">
            &quot;Not all those who wander are lost.&quot;
          </p>
          <p>Zulu and Taru's Adventures &mdash; Summer 2026</p>
        </footer>
      </body>
    </html>
  );
}
