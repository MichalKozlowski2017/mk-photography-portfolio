import { cookies } from "next/headers";
import { translations, defaultLocale, type Locale, type Translations } from "./translations";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const raw = store.get("locale")?.value;
  return raw === "pl" ? "pl" : defaultLocale;
}

export async function getT(): Promise<Translations> {
  const locale = await getLocale();
  return translations[locale];
}
