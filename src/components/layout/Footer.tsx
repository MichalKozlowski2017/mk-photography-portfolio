"use client";

import Link from "next/link";
import { useLang } from "@/i18n/LangContext";

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="border-t border-white/10 bg-black py-14 text-center">
      <p className="font-playfair text-2xl tracking-[0.35em] text-white uppercase">MK Shots</p>
      <p className="mt-2 text-xs tracking-[0.25em] text-white/30 uppercase">{t.footer.tagline}</p>

      <div className="mt-8 flex justify-center gap-12">
        <Link
          href="/"
          className="text-xs tracking-[0.18em] text-white/40 uppercase transition-colors hover:text-white"
        >
          {t.nav.home}
        </Link>
        <Link
          href="/gallery"
          className="text-xs tracking-[0.18em] text-white/40 uppercase transition-colors hover:text-white"
        >
          {t.nav.gallery}
        </Link>
        <Link
          href="/about"
          className="text-xs tracking-[0.18em] text-white/40 uppercase transition-colors hover:text-white"
        >
          {t.nav.about}
        </Link>
      </div>

      <p className="mt-10 text-xs text-white/20">
        © {new Date().getFullYear()} MK Shots. {t.footer.rights}
      </p>
    </footer>
  );
}
