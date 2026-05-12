import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Link from "next/link";
import Nav from "./components/Nav";
import TrackPageView from "./components/TrackPageView";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { config } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowRight,
  faBookOpen,
  faCompass,
  faMapLocationDot,
  faPlus,
  faWandSparkles,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faInstagram,
  faLinkedin,
  faXTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";

config.autoAddCss = false;

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
        <header className="relative bg-taru-green shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
            <Link
              href="/"
              className="flex items-center gap-3 shrink-0 group"
            >
              <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-white ring-2 ring-taru-cream/35 shadow-sm">
                <Image
                  src="/taru-logo.png"
                  alt="Zulu and Taru Adventures logo"
                  fill
                  className="object-contain object-center p-0.5"
                  sizes="44px"
                  priority
                />
              </span>
              <span className="font-heading text-lg font-bold text-taru-cream group-hover:text-white transition-colors tracking-wide">
                Zulu and Taru&apos;s Adventures
              </span>
            </Link>
            <Nav />
          </div>
        </header>

        <TrackPageView />
        <main className="flex-1">{children}</main>

        <footer className="mt-20 border-t-4 border-taru-cream-dark bg-gradient-to-br from-[#3A4417] via-taru-green-dark to-[#1f250c] text-taru-cream">
          <div className="w-full px-6 md:px-10 lg:px-12 pt-14 pb-8">
            <div className="mb-10 rounded-2xl border border-taru-cream/20 bg-taru-cream/8 p-6 md:p-7">
              <p className="text-[11px] uppercase tracking-[0.24em] text-taru-cream/65 mb-2 inline-flex items-center gap-2">
                <FontAwesomeIcon icon={faWandSparkles} className="h-3 w-3" />
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

            <div className="grid gap-10 md:grid-cols-4 md:gap-10">
              <div className="md:col-span-1 rounded-2xl border border-taru-cream/20 bg-black/10 p-5">
                <div>
                  <span className="relative mb-3 inline-block h-20 w-20 overflow-hidden rounded-full bg-white ring-2 ring-taru-cream/30 shadow-sm">
                    <Image
                      src="/taru-logo.png"
                      alt="Taru logo"
                      fill
                      className="object-contain object-center p-1"
                      sizes="80px"
                    />
                  </span>
                  <p className="text-sm tracking-[0.18em] uppercase text-taru-cream/90">
                    Zulu and Taru Adventures
                  </p>
                  <p className="mt-1 text-xs text-taru-cream/70">
                    Southwest Road Chronicle
                  </p>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-taru-cream/80">
                  Plan that out. Collect the stories. Capture every moment that
                  becomes part of the journey.
                </p>

                <div className="mt-6">
                  <p className="text-[11px] tracking-[0.2em] uppercase text-taru-cream/65 mb-3">
                    Follow Us
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-taru-cream/80">
                    <a href="#" aria-label="X" className="hover:text-white transition-colors">
                      <FontAwesomeIcon icon={faXTwitter} className="h-4 w-4" />
                    </a>
                    <a href="#" aria-label="LinkedIn" className="hover:text-white transition-colors">
                      <FontAwesomeIcon icon={faLinkedin} className="h-4 w-4" />
                    </a>
                    <a href="#" aria-label="Instagram" className="hover:text-white transition-colors">
                      <FontAwesomeIcon icon={faInstagram} className="h-4 w-4" />
                    </a>
                    <a href="#" aria-label="Facebook" className="hover:text-white transition-colors">
                      <FontAwesomeIcon icon={faFacebook} className="h-4 w-4" />
                    </a>
                    <a href="#" aria-label="YouTube" className="hover:text-white transition-colors">
                      <FontAwesomeIcon icon={faYoutube} className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="md:col-span-1">
                <h3 className="font-heading text-2xl text-taru-cream mb-4 inline-flex items-center gap-2.5">
                  <FontAwesomeIcon icon={faCompass} className="h-4 w-4 text-taru-cream/85" />
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
                  <FontAwesomeIcon icon={faBookOpen} className="h-4 w-4 text-taru-cream/85" />
                  <span>Read the Chapters</span>
                </h3>
                <ul className="space-y-2.5">
                  {footerLinks.map(({ href, label }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="inline-flex items-center gap-2 text-sm text-taru-cream/80 hover:text-white transition-colors"
                      >
                        <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3 text-taru-cream/50" />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-heading text-xl text-taru-cream mb-4 inline-flex items-center gap-2">
                  <FontAwesomeIcon icon={faMapLocationDot} className="h-4 w-4 text-taru-cream/85" />
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
                  <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5 text-taru-cream/80" />
                  <span>Live notes from the road</span>
                </div>
              </div>
            </div>

            <div className="mt-12 border-t border-taru-cream/20 pt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs tracking-wide text-taru-cream/70">
                © {new Date().getFullYear()}{' '}Zulu and Taru&apos;s Adventures. All rights reserved. Built from the road, one story at a time.
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
