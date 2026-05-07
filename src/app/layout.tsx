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
  const tripStates = ["California", "Nevada", "Utah", "New Mexico", "Colorado"];
  const footerLinks = [
    { href: "/tarus-story", label: "Taru's Story" },
    { href: "/route", label: "Route Tracker" },
    { href: "/photos", label: "Photo Journal" },
    { href: "/videos", label: "Video Diaries" },
    { href: "/contact", label: "Send a Message" },
  ];
  const expeditionLog = [
    "Dawn coffee at trailheads.",
    "Long highway stretches with old records spinning.",
    "Campfire notes under desert stars.",
  ];

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

        <footer className="mt-20 border-t-4 border-taru-cream-dark bg-gradient-to-br from-[#3A4417] via-taru-green-dark to-[#1f250c] text-taru-cream">
          <div className="w-full px-6 md:px-10 lg:px-12 pt-14 pb-8">
            <div className="mb-10 rounded-2xl border border-taru-cream/20 bg-taru-cream/8 p-6 md:p-7">
              <p className="text-[11px] uppercase tracking-[0.24em] text-taru-cream/65 mb-2 inline-flex items-center gap-2">
                <span aria-hidden>*</span>
                <span>Field Dispatch / Summer 2026</span>
              </p>
              <h2 className="font-heading text-3xl md:text-4xl leading-tight text-taru-cream mb-3">
                Not a vacation. An editorial of open roads, old steel, and wild
                places.
              </h2>
              <p className="max-w-3xl text-sm md:text-base text-taru-cream/80 leading-relaxed">
                Zulu and Taru&apos;s Adventures documents each chapter like a magazine
                feature from the road: route updates, visual stories, field notes,
                and the unexpected moments between destinations.
              </p>
            </div>

            <div className="grid gap-10 md:grid-cols-3 md:gap-12">
              <div className="md:col-span-1">
                <h3 className="font-heading text-2xl text-taru-cream mb-4 inline-flex items-center gap-2.5">
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-taru-cream/85"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="8" />
                    <path d="M12 7l3 8-8-3 5-5z" />
                  </svg>
                  <span>Expedition Log</span>
                </h3>
                <ul className="space-y-2.5">
                  {expeditionLog.map((entry) => (
                    <li key={entry} className="flex gap-2.5 text-sm text-taru-cream/80">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-taru-cream/70" />
                      <span>{entry}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-heading text-xl text-taru-cream mb-4 inline-flex items-center gap-2">
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-taru-cream/85"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 5a2 2 0 0 1 2-2h5v17H6a2 2 0 0 0-2 2z" />
                    <path d="M20 5a2 2 0 0 0-2-2h-5v17h5a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>Read the Chapters</span>
                </h3>
                <ul className="space-y-2.5">
                  {footerLinks.map(({ href, label }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="inline-flex items-center gap-2 text-sm text-taru-cream/80 hover:text-white transition-colors"
                      >
                        <span className="text-taru-cream/50">➜</span>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-heading text-xl text-taru-cream mb-4 inline-flex items-center gap-2">
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-taru-cream/85"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                  <span>Current Route Desk</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tripStates.map((state) => (
                    <span
                      key={state}
                      className="inline-flex items-center rounded-full border border-taru-cream/30 bg-taru-cream/10 px-3 py-1 text-xs tracking-wide text-taru-cream/90"
                    >
                      {state}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm text-taru-cream/75 leading-relaxed">
                  Updates are posted in sequence, stop by stop, to capture the full
                  texture of life on the move.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-xs text-taru-cream/70">
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5 text-taru-cream/80"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span>Live notes from the road</span>
                </div>
              </div>
            </div>

            <div className="mt-12 border-t border-taru-cream/20 pt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs tracking-wide text-taru-cream/70">
                © {new Date().getFullYear()} Zulu and Taru&apos;s Adventures. All
                rights reserved. Built from the road, one story at a time.
              </p>
              <div className="flex items-center gap-5 text-xs text-taru-cream/70">
                <Link href="/contact" className="hover:text-white transition-colors">
                  Press + Collaborations
                </Link>
                <Link href="/journal" className="hover:text-white transition-colors">
                  Field Journal
                </Link>
                <Link href="/route" className="hover:text-white transition-colors">
                  Route Updates
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
