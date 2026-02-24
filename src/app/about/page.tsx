import type { Metadata } from "next";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t.meta.aboutTitle,
    description: t.meta.aboutDesc,
  };
}

export default async function AboutPage() {
  const t = await getT();

  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-36">
      {/* Header */}
      <div className="mb-16 text-center">
        <p className="mb-4 text-[11px] tracking-[0.5em] uppercase text-foreground/30">
          {t.about.label}
        </p>
        <h1 className="font-playfair text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
          Michał Kozłowski
        </h1>
        <p className="mt-5 text-sm tracking-[0.25em] uppercase text-foreground/40">
          {t.about.role}
        </p>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl space-y-6 text-foreground/70 leading-relaxed">
        <p className="font-playfair text-xl text-foreground leading-relaxed">{t.about.intro}</p>
        <p>{t.about.p1}</p>
        <p>
          {t.about.p2}&nbsp;
          <span className="italic text-foreground">{t.about.p2em}</span>.
        </p>
        <p>{t.about.p3}</p>
      </div>
    </main>
  );
}
