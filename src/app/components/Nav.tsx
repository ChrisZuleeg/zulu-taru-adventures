"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/journal", label: "Journal" },
  { href: "/videos", label: "Videos" },
  { href: "/photos", label: "Photos" },
  { href: "/route", label: "The Route" },
  { href: "/tarus-story", label: "Taru's Story" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex flex-wrap justify-end gap-0.5">
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap
              ${pathname === href ? "text-white bg-white/15" : "text-taru-cream/75 hover:text-white hover:bg-white/10"}`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Mobile hamburger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle menu"
        className="md:hidden flex flex-col justify-center gap-1.5 w-8 h-8 shrink-0"
      >
        <span className={`block h-0.5 bg-taru-cream transition-all duration-200 ${open ? "rotate-45 translate-y-2" : ""}`} />
        <span className={`block h-0.5 bg-taru-cream transition-all duration-200 ${open ? "opacity-0" : ""}`} />
        <span className={`block h-0.5 bg-taru-cream transition-all duration-200 ${open ? "-rotate-45 -translate-y-2" : ""}`} />
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-taru-green border-t border-white/10 shadow-lg z-50">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`block px-6 py-3.5 text-sm font-medium border-b border-white/10 transition-colors
                ${pathname === href ? "text-white bg-white/10" : "text-taru-cream/80 hover:text-white hover:bg-white/10"}`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
