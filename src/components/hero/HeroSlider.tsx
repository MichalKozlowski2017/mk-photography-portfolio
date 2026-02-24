"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/i18n/LangContext";

interface HeroPhoto {
  url: string;
  title?: string | null;
}

interface Props {
  photos: HeroPhoto[];
}

export function HeroSlider({ photos }: Props) {
  const [current, setCurrent] = useState(0);
  const { t } = useLang();

  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % photos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [photos.length]);

  return (
    <section className="relative h-screen overflow-hidden bg-black">
      {/* Photos */}
      {photos.map((photo, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={photo.url}
            alt={photo.title ?? ""}
            fill
            className="object-cover"
            sizes="100vw"
            priority={i === 0}
          />
        </div>
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
        <p className="mb-5 text-[11px] tracking-[0.5em] uppercase text-white/50">
          {t.hero.subtitle}
        </p>
        <h1 className="font-playfair text-5xl font-bold sm:text-7xl lg:text-8xl">
          Michał Kozłowski
          <br />
          <span className="text-3xl font-normal tracking-[0.35em] sm:text-4xl lg:text-5xl">
            Shots
          </span>
        </h1>
        <p className="mt-5 text-xs tracking-[0.35em] uppercase text-white/40">{t.hero.tagline}</p>
        <Link
          href="/gallery"
          className="mt-14 border border-white/40 px-10 py-3 text-[11px] tracking-[0.3em] uppercase text-white/80 transition-all duration-300 hover:border-white hover:bg-white hover:text-black"
        >
          {t.hero.cta}
        </Link>
      </div>

      {/* Slide indicators */}
      {photos.length > 1 && (
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-2">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={t.hero.slideLabel(i + 1)}
              className="h-px rounded-none transition-all duration-300"
              style={{
                width: i === current ? "32px" : "16px",
                backgroundColor: i === current ? "white" : "rgba(255,255,255,0.35)",
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
