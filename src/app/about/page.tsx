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
      <div className="grid gap-16 lg:grid-cols-[1fr_380px]">
        {/* Text */}
        <div className="space-y-6 text-foreground/70 leading-relaxed">
          <p className="font-playfair text-xl text-foreground leading-relaxed">{t.about.intro}</p>
          <p>{t.about.p1}</p>
          <p>
            {t.about.p2}&nbsp;
            <span className="italic text-foreground">{t.about.p2em}</span>.
          </p>
          <p>{t.about.p3}</p>

          {/* Contact */}
          <div className="pt-6 border-t border-foreground/10">
            <p className="text-sm uppercase tracking-[0.2em] text-foreground/40 mb-4">
              {t.about.contact}
            </p>
            <a
              href="mailto:m.kozlowski87@gmail.com"
              className="text-sm text-foreground/60 transition-colors hover:text-foreground"
            >
              m.kozlowski87@gmail.com
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-6">
          {t.about.stats.map(({ label, value }) => (
            <div
              key={label}
              className="border-b border-foreground/10 pb-6 flex items-end justify-between"
            >
              <span className="text-xs tracking-[0.18em] uppercase text-foreground/40">
                {label}
              </span>
              <span className="font-playfair text-3xl font-bold text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
