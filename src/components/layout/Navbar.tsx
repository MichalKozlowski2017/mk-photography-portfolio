"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LangToggle } from "@/components/theme/LangToggle";
import { useLang } from "@/i18n/LangContext";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { t } = useLang();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-8 transition-all duration-500 ${
        hasBg ? "bg-white/90 py-3 backdrop-blur-md dark:bg-black/90" : "bg-transparent py-6"
      }`}
    >
      <Link
        href="/"
        className={`font-playfair text-lg font-bold tracking-[0.2em] uppercase transition-colors ${
          hasBg ? "text-black dark:text-white" : "text-white"
        }`}
      >
        MK Photography
      </Link>

      <div className="flex items-center gap-7">
        <Link href="/" className={linkClass(pathname === "/")}>
          {t.nav.home}
        </Link>
        <Link href="/gallery" className={linkClass(pathname.startsWith("/gallery"))}>
          {t.nav.gallery}
        </Link>
        <Link href="/about" className={linkClass(hasBg && pathname === "/about")}>
          {t.nav.about}
        </Link>
        <LangToggle hasBg={hasBg} />
        <ThemeToggle hasBg={hasBg} />
      </div>
    </nav>
  );
}
