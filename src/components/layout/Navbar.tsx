"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LangToggle } from "@/components/theme/LangToggle";
import { useLang } from "@/i18n/LangContext";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLang();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isHeroPage = pathname === "/";
  const hasBg = scrolled || !isHeroPage;

  const linkClass = (active: boolean) =>
    `text-xs tracking-[0.2em] uppercase transition-colors ${
      hasBg
        ? active
          ? "text-black dark:text-white"
          : "text-black/50 hover:text-black dark:text-white/60 dark:hover:text-white"
        : active
          ? "text-white"
          : "text-white/60 hover:text-white"
    }`;

  const navLinks = [
    { href: "/", label: t.nav.home, active: pathname === "/" },
    { href: "/gallery", label: t.nav.gallery, active: pathname.startsWith("/gallery") },
    { href: "/stats", label: t.nav.stats, active: pathname === "/stats" },
    { href: "/about", label: t.nav.about, active: pathname === "/about" },
  ];

  return (
    <>
      <nav
        className={`fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 transition-all duration-500 md:px-8 ${
          hasBg ? "bg-white/90 py-3 backdrop-blur-md dark:bg-black/90" : "bg-transparent py-6"
        }`}
      >
        <Link
          href="/"
          className={`font-playfair text-lg font-bold tracking-[0.2em] uppercase transition-colors ${
            hasBg ? "text-black dark:text-white" : "text-white"
          }`}
        >
          MK Shots
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-7 md:flex">
          {navLinks.map(({ href, label, active }) => (
            <Link key={href} href={href} className={linkClass(active)}>
              {label}
            </Link>
          ))}
          <LangToggle hasBg={hasBg} />
          <ThemeToggle hasBg={hasBg} />
        </div>

        {/* Mobile: toggles + hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          <LangToggle hasBg={hasBg} />
          <ThemeToggle hasBg={hasBg} />
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Zamknij menu" : "Otwórz menu"}
            className={`relative flex h-8 w-8 flex-col items-center justify-center gap-1.5 transition-colors ${
              hasBg ? "text-black dark:text-white" : "text-white"
            }`}
          >
            <span
              className={`block h-px w-6 bg-current transition-all duration-300 ${
                menuOpen ? "translate-y-1.75 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-px w-6 bg-current transition-all duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-px w-6 bg-current transition-all duration-300 ${
                menuOpen ? "-translate-y-1.75 -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Fullscreen mobile overlay */}
      <div
        className={`fixed inset-0 z-40 flex flex-col bg-white transition-all duration-500 dark:bg-zinc-950 md:hidden ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {/* Links */}
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          {navLinks.map(({ href, label, active }, i) => (
            <div
              key={href}
              className={`transition-all duration-500 ${
                menuOpen ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
              style={{ transitionDelay: menuOpen ? `${80 + i * 60}ms` : "0ms" }}
            >
              <Link
                href={href}
                className={`font-playfair text-5xl font-semibold tracking-wide transition-colors duration-150 ${
                  active
                    ? "text-zinc-900 dark:text-white"
                    : "text-zinc-300 hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-white"
                }`}
              >
                {label}
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom branding */}
        <div
          className={`pb-10 text-center transition-all duration-500 ${
            menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={{ transitionDelay: menuOpen ? "360ms" : "0ms" }}
        >
          <p className="font-playfair text-sm tracking-[0.3em] uppercase text-zinc-300 dark:text-zinc-700">
            MK Shots
          </p>
        </div>
      </div>
    </>
  );
}
