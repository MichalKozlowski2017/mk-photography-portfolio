"use client";

import { createContext, useContext, useState, useTransition } from "react";
import { translations, type Locale, type Translations } from "./translations";
import { setLocaleCookie } from "./actions";

interface LangContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (l: Locale) => void;
  isPending: boolean;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [isPending, startTransition] = useTransition();

  function setLocale(l: Locale) {
    startTransition(async () => {
      await setLocaleCookie(l);
      setLocaleState(l);
    });
  }

  return (
    <LangContext.Provider value={{ locale, t: translations[locale], setLocale, isPending }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside <LangProvider>");
  return ctx;
}
