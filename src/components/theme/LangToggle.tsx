"use client";

import { useLang } from "@/i18n/LangContext";

interface Props {
  hasBg?: boolean;
}

export function LangToggle({ hasBg }: Props) {
  const { locale, t, setLocale, isPending } = useLang();

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "pl" : "en")}
      disabled={isPending}
      aria-label={`Switch to ${locale === "en" ? "Polish" : "English"}`}
      className={`text-[11px] tracking-[0.2em] uppercase transition-colors disabled:opacity-40 ${
        hasBg
          ? "text-black/40 hover:text-black dark:text-white/50 dark:hover:text-white"
          : "text-white/50 hover:text-white"
      }`}
    >
      {t.lang.switch}
    </button>
  );
}
