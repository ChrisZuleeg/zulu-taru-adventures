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
        <header className="bg-taru-green shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
            <Link
              href="/"
              className="font-heading text-lg font-bold text-taru-cream hover:text-white transition-colors tracking-wide shrink-0"
            >
              Zulu and Taru&apos;s Adventures
            </Link>
            <nav className="flex flex-wrap justify-end gap-0.5">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-3 py-1.5 text-sm font-medium text-taru-cream/75 hover:text-white hover:bg-white/10 rounded-md transition-colors whitespace-nowrap"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="bg-taru-green-dark text-taru-cream/60 text-center text-sm py-10 mt-16">
          <p className="font-heading italic text-taru-cream/85 text-base mb-2">
            &quot;Not all those who wander are lost.&quot;
          </p>
          <p className="text-xs tracking-wide">
            Zulu and Taru&apos;s Adventures &mdash; Summer 2026
          </p>
        </footer>
      </body>
    </html>
  );
}
